import { NextRequest } from 'next/server';
import { createAndSetCSRFToken } from '@/lib/csrf';
import { createSuccessResponse } from '@/lib/apiHandler';

/**
 * GET - CSRF token al
 * Client-side form'lar için CSRF token döndürür
 */
export async function GET(request: NextRequest) {
  try {
    const token = await createAndSetCSRFToken();
    
    return createSuccessResponse(
      { csrfToken: token },
      undefined,
      200
    );
  } catch (error) {
    return createSuccessResponse(
      { csrfToken: null },
      'CSRF token oluşturulamadı',
      500
    );
  }
}

