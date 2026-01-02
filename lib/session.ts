import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { getEnv } from './env';

const JWT_SECRET = getEnv('JWT_SECRET', 'change-this-secret-in-production');
const SESSION_COOKIE_NAME = 'session';
const ADMIN_SESSION_COOKIE_NAME = 'admin_session';

export interface SessionPayload {
  userId: string;
  email: string;
  isAdmin: boolean;
}

/**
 * Session token oluşturur
 */
export function createSessionToken(payload: SessionPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d',
  });
}

/**
 * Session token'ı doğrular ve payload'ı döndürür
 */
export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as SessionPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Cookie'den session bilgisini alır
 */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  
  if (!sessionCookie) {
    return null;
  }
  
  return verifySessionToken(sessionCookie.value);
}

/**
 * Admin session'ı alır
 */
export async function getAdminSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const adminCookie = cookieStore.get(ADMIN_SESSION_COOKIE_NAME);
  
  if (!adminCookie) {
    return null;
  }
  
  const session = verifySessionToken(adminCookie.value);
  
  // Admin session'ı sadece isAdmin: true ise geçerli
  if (session && session.isAdmin) {
    return session;
  }
  
  return null;
}

/**
 * Session cookie'sini set eder
 */
export async function setSession(payload: SessionPayload, isAdmin: boolean = false): Promise<void> {
  const token = createSessionToken(payload);
  const cookieStore = await cookies();
  const cookieName = isAdmin ? ADMIN_SESSION_COOKIE_NAME : SESSION_COOKIE_NAME;
  
  cookieStore.set(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 gün
    path: '/',
  });
}

/**
 * Session cookie'sini siler
 */
export async function clearSession(isAdmin: boolean = false): Promise<void> {
  const cookieStore = await cookies();
  const cookieName = isAdmin ? ADMIN_SESSION_COOKIE_NAME : SESSION_COOKIE_NAME;
  
  cookieStore.delete(cookieName);
}

