import { randomBytes, createHmac } from 'crypto';
import { cookies } from 'next/headers';
import { getEnv } from './env';

const CSRF_TOKEN_COOKIE_NAME = 'csrf-token';
const CSRF_SECRET = getEnv('JWT_SECRET', 'change-this-secret-in-production'); // JWT_SECRET'ı kullanıyoruz

/**
 * CSRF token oluşturur
 */
export function generateCSRFToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * CSRF token'ı hash'ler (HMAC ile)
 */
function hashToken(token: string): string {
  return createHmac('sha256', CSRF_SECRET)
    .update(token)
    .digest('hex');
}

/**
 * CSRF token'ı cookie'ye kaydeder
 */
export async function setCSRFToken(token: string): Promise<void> {
  const hashedToken = hashToken(token);
  const cookieStore = await cookies();
  
  cookieStore.set(CSRF_TOKEN_COOKIE_NAME, hashedToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 saat
    path: '/',
  });
}

/**
 * CSRF token'ı cookie'den alır
 */
export async function getCSRFToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get(CSRF_TOKEN_COOKIE_NAME);
  
  return tokenCookie ? tokenCookie.value : null;
}

/**
 * CSRF token'ı doğrular
 */
export async function validateCSRFToken(token: string): Promise<boolean> {
  if (!token) {
    return false;
  }
  
  const storedToken = await getCSRFToken();
  if (!storedToken) {
    return false;
  }
  
  const hashedToken = hashToken(token);
  return hashedToken === storedToken;
}

/**
 * CSRF token'ı temizler
 */
export async function clearCSRFToken(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(CSRF_TOKEN_COOKIE_NAME);
}

/**
 * Yeni CSRF token oluşturur ve cookie'ye kaydeder
 */
export async function createAndSetCSRFToken(): Promise<string> {
  const token = generateCSRFToken();
  await setCSRFToken(token);
  return token;
}

