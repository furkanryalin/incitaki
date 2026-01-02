import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/session';

/**
 * Admin yetkilendirme kontrolü
 * Bu fonksiyon admin API route'larında kullanılmalı
 */
export async function requireAdmin(request: NextRequest): Promise<{
  authorized: boolean;
  session?: { userId: string; email: string; isAdmin: boolean };
  response?: NextResponse;
}> {
  const session = await getAdminSession();
  
  if (!session || !session.isAdmin) {
    return {
      authorized: false,
      response: NextResponse.json(
        { 
          success: false,
          error: 'Unauthorized. Admin access required.',
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
 * Admin API route wrapper
 * Kullanım:
 * 
 * export async function GET(request: NextRequest) {
 *   const auth = await requireAdmin(request);
 *   if (!auth.authorized) return auth.response!;
 *   
 *   // ... normal kod
 * }
 */
export async function withAdminAuth(
  request: NextRequest,
  handler: (session: { userId: string; email: string; isAdmin: boolean }) => Promise<NextResponse>
): Promise<NextResponse> {
  const auth = await requireAdmin(request);
  
  if (!auth.authorized) {
    return auth.response!;
  }
  
  return handler(auth.session!);
}

