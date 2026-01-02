import { NextRequest } from 'next/server';
import { rateLimit, getClientIP } from '@/lib/rateLimit';
import { contactSchema } from '@/lib/validations';
import { validateRequest, handleApiError, createSuccessResponse, createErrorResponse } from '@/lib/apiHandler';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - 15 dakikada maksimum 3 mesaj
    const clientIP = getClientIP(request);
    const rateLimitResult = rateLimit(`contact:${clientIP}`, {
      windowMs: 15 * 60 * 1000, // 15 dakika
      maxRequests: 3,
    });

    if (!rateLimitResult.allowed) {
      return createErrorResponse(
        'Çok fazla mesaj gönderimi. Lütfen bir süre sonra tekrar deneyin.',
        429
      );
    }

    // Validate request body
    const validation = await validateRequest(request, contactSchema);
    if (!validation.success) {
      return validation.response;
    }

    const { name, email, message, subject } = validation.data;

    // Local development için console'a yazdır
    // Production'da burada email gönderilir (SendGrid, Nodemailer, vb.)
    console.log('\n📧 ============================================');
    console.log('📬 YENİ İLETİŞİM MESAJI');
    console.log('============================================');
    console.log(`👤 Ad Soyad: ${name}`);
    console.log(`📧 E-posta: ${email}`);
    if (subject) {
      console.log(`📌 Konu: ${subject}`);
    }
    console.log(`💬 Mesaj:`);
    console.log(message);
    console.log('============================================\n');

    // Production'da burada email gönderilir:
    // await sendContactEmail({ name, email, message, subject });

    return createSuccessResponse(
      undefined,
      'Mesajınız başarıyla gönderildi! En kısa sürede size dönüş yapacağız.'
    );
  } catch (error) {
    return handleApiError(error);
  }
}

