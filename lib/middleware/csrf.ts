import { NextRequest, NextResponse } from 'next/server';
import { validateCSRFToken } from '@/lib/csrf';

/**
 * CSRF koruması middleware
 * POST, PUT, DELETE, PATCH isteklerinde CSRF token kontrolü yapar
 */
export async function requireCSRF(request: NextRequest): Promise<{
  valid: boolean;
  response?: NextResponse;
}> {
  // Sadece state-changing method'lar için CSRF kontrolü
  const method = request.method;
  if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    return { valid: true };
  }
  
  // CSRF token'ı header'dan al (body'den okumak request'i consume eder)
  const csrfToken = 
    request.headers.get('X-CSRF-Token') ||
    request.headers.get('x-csrf-token');
  
  if (!csrfToken) {
    return {
      valid: false,
      response: NextResponse.json(
        {
          success: false,
          error: 'CSRF token gerekli',
          code: 'CSRF_TOKEN_MISSING'
        },
        { status: 403 }
      ),
    };
  }
  
  const isValid = await validateCSRFToken(csrfToken as string);
  
  if (!isValid) {
    return {
      valid: false,
      response: NextResponse.json(
        {
          success: false,
          error: 'Geçersiz CSRF token',
          code: 'CSRF_TOKEN_INVALID'
        },
        { status: 403 }
      ),
    };
  }
  
  return { valid: true };
}

/**
 * CSRF korumalı API route wrapper
 */
export async function withCSRF(
  request: NextRequest,
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  const csrfCheck = await requireCSRF(request);
  
  if (!csrfCheck.valid) {
    return csrfCheck.response!;
  }
  
  return handler();
}

