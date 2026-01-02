import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { rateLimit, getClientIP } from '@/lib/rateLimit';
import { forgotPasswordSchema } from '@/lib/validations';
import { validateRequest, handleApiError, createSuccessResponse, createErrorResponse } from '@/lib/apiHandler';
import { createPasswordResetToken, logResetTokenForDevelopment } from '@/lib/passwordReset';

export async function POST(request: NextRequest) {
  try {
    // Validate request body first
    const validation = await validateRequest(request, forgotPasswordSchema);
    if (!validation.success) {
      return validation.response;
    }

    const { email } = validation.data;

    // Rate limiting - email bazlı (local development için daha esnek)
    // Production'da IP bazlı da eklenebilir
    const rateLimitResult = rateLimit(`forgot-password:${email}`, {
      windowMs: 15 * 60 * 1000, // 15 dakika
      maxRequests: process.env.NODE_ENV === 'production' ? 3 : 10, // Local'de 10, production'da 3
    });

    if (!rateLimitResult.allowed) {
      return createErrorResponse(
        'Çok fazla şifre sıfırlama isteği. Lütfen bir süre sonra tekrar deneyin.',
        429
      );
    }

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Güvenlik: Kullanıcı yoksa bile başarılı mesaj döndür (email enumeration koruması)
    if (!user) {
      // Timing attack koruması için kısa bir gecikme
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      return createSuccessResponse(
        undefined,
        'Eğer bu e-posta adresine kayıtlı bir hesap varsa, şifre sıfırlama bağlantısı gönderildi.'
      );
    }

    // Password reset token oluştur
    const token = await createPasswordResetToken(user.id);

    // Local development için console'a yazdır
    // Production'da burada email gönderilir
    logResetTokenForDevelopment(email, token);

    return createSuccessResponse(
      undefined,
      'Eğer bu e-posta adresine kayıtlı bir hesap varsa, şifre sıfırlama bağlantısı gönderildi.'
    );
  } catch (error) {
    return handleApiError(error);
  }
}

