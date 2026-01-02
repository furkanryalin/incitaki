import { NextRequest } from 'next/server';
import { clearRateLimit } from '@/lib/rateLimit';
import { createSuccessResponse, createErrorResponse } from '@/lib/apiHandler';

/**
 * Development için rate limit temizleme endpoint'i
 * Production'da bu endpoint'i kaldırın veya admin-only yapın
 */
export async function POST(request: NextRequest) {
  // Sadece development modunda çalışsın
  if (process.env.NODE_ENV === 'production') {
    return createErrorResponse('Bu endpoint production\'da kullanılamaz', 403);
  }

  try {
    const { identifier } = await request.json().catch(() => ({}));
    
    if (identifier) {
      clearRateLimit(identifier);
      return createSuccessResponse(
        undefined,
        `Rate limit temizlendi: ${identifier}`
      );
    } else {
      clearRateLimit(); // Tümünü temizle
      return createSuccessResponse(
        undefined,
        'Tüm rate limit kayıtları temizlendi'
      );
    }
  } catch (error) {
    return createErrorResponse('Rate limit temizlenemedi', 500);
  }
}

