import { NextRequest } from 'next/server';
import { rateLimit, getClientIP } from '@/lib/rateLimit';
import { newsletterSchema } from '@/lib/validations';
import { validateRequest, handleApiError, createSuccessResponse, createErrorResponse } from '@/lib/apiHandler';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - 1 saatte maksimum 1 abonelik
    const clientIP = getClientIP(request);
    const rateLimitResult = rateLimit(`newsletter:${clientIP}`, {
      windowMs: 60 * 60 * 1000, // 1 saat
      maxRequests: 1,
    });

    if (!rateLimitResult.allowed) {
      return createErrorResponse(
        'Çok fazla abonelik denemesi. Lütfen bir süre sonra tekrar deneyin.',
        429
      );
    }

    // Validate request body
    const validation = await validateRequest(request, newsletterSchema);
    if (!validation.success) {
      return validation.response;
    }

    const { email } = validation.data;

    // Local development için console'a yazdır
    // Production'da burada email servisi entegrasyonu yapılır
    console.log('\n📬 ============================================');
    console.log('📧 YENİ NEWSLETTER ABONELİĞİ');
    console.log('============================================');
    console.log(`📧 E-posta: ${email}`);
    console.log(`⏰ Tarih: ${new Date().toLocaleString('tr-TR')}`);
    console.log('============================================\n');

    // Production'da burada email servisi entegrasyonu yapılır:
    // await subscribeToNewsletter(email);

    return createSuccessResponse(
      undefined,
      'E-bülten aboneliğiniz başarıyla oluşturuldu!'
    );
  } catch (error) {
    return handleApiError(error);
  }
}

