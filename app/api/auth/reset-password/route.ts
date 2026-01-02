import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { rateLimit, getClientIP } from '@/lib/rateLimit';
import { resetPasswordSchema } from '@/lib/validations';
import { validateRequest, handleApiError, createSuccessResponse, createErrorResponse } from '@/lib/apiHandler';
import { verifyPasswordResetToken, markTokenAsUsed } from '@/lib/passwordReset';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - 15 dakikada maksimum 5 deneme
    const clientIP = getClientIP(request);
    const rateLimitResult = rateLimit(`reset-password:${clientIP}`, {
      windowMs: 15 * 60 * 1000, // 15 dakika
      maxRequests: 5,
    });

    if (!rateLimitResult.allowed) {
      return createErrorResponse(
        'Çok fazla şifre sıfırlama denemesi. Lütfen bir süre sonra tekrar deneyin.',
        429
      );
    }

    // Validate request body
    const validation = await validateRequest(request, resetPasswordSchema);
    if (!validation.success) {
      return validation.response;
    }

    const { token, newPassword } = validation.data;

    // Token'ı doğrula
    const tokenVerification = await verifyPasswordResetToken(token);
    
    if (!tokenVerification.valid || !tokenVerification.userId) {
      return createErrorResponse(
        tokenVerification.message || 'Geçersiz veya süresi dolmuş token',
        400
      );
    }

    // Yeni şifreyi hash'le
    const hashedPassword = await hashPassword(newPassword);

    // Kullanıcı şifresini güncelle
    await prisma.user.update({
      where: { id: tokenVerification.userId },
      data: { password: hashedPassword },
    });

    // Token'ı kullanıldı olarak işaretle
    await markTokenAsUsed(token);

    return createSuccessResponse(
      undefined,
      'Şifreniz başarıyla sıfırlandı. Yeni şifrenizle giriş yapabilirsiniz.'
    );
  } catch (error) {
    return handleApiError(error);
  }
}

