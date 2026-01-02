import { NextRequest } from 'next/server';
import { clearSession } from '@/lib/session';
import { createSuccessResponse } from '@/lib/apiHandler';

export async function POST(request: NextRequest) {
  await clearSession(false); // Normal kullanıcı session
  
  return createSuccessResponse(
    undefined,
    'Çıkış başarılı',
    200
  );
}

