import { NextRequest } from 'next/server';
import { clearSession } from '@/lib/session';
import { createSuccessResponse } from '@/lib/apiHandler';

export async function POST(request: NextRequest) {
  await clearSession(true); // Admin session
  
  return createSuccessResponse(
    undefined,
    'Çıkış başarılı',
    200
  );
}

