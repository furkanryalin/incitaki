import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

/**
 * Kullanıcı yetkilendirme kontrolü
 * Bu fonksiyon kullanıcı API route'larında kullanılmalı
 */
export async function requireAuth(request: NextRequest): Promise<{
  authorized: boolean;
  session?: { userId: string; email: string; isAdmin: boolean };
  response?: NextResponse;
}> {
  const session = await getSession();
  
  if (!session) {
    return {
      authorized: false,
      response: NextResponse.json(
        { 
          success: false,
          error: 'Unauthorized. Please log in.',
          code: 'UNAUTHORIZED'
        },
        { status: 401 }
      ),
    };
  }
  
  return {
    authorized: true,
    session,
  };
}

/**
 * Kullanıcı API route wrapper
 */
export async function withAuth(
  request: NextRequest,
  handler: (session: { userId: string; email: string; isAdmin: boolean }) => Promise<NextResponse>
): Promise<NextResponse> {
  const auth = await requireAuth(request);
  
  if (!auth.authorized) {
    return auth.response!;
  }
  
  return handler(auth.session!);
}

