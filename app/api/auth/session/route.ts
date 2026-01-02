import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function GET(request: NextRequest) {
  const session = await getSession();
  
  return NextResponse.json({
    authenticated: !!session,
    user: session ? {
      userId: session.userId,
      email: session.email,
      isAdmin: session.isAdmin,
    } : null,
  });
}

