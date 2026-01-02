import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword } from '@/lib/auth';
import { rateLimit, getClientIP } from '@/lib/rateLimit';
import { loginSchema } from '@/lib/validations';
import { validateRequest, handleApiError, createSuccessResponse, createErrorResponse } from '@/lib/apiHandler';
import { setSession } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - 5 dakikada maksimum 5 deneme
    const clientIP = getClientIP(request);
    const rateLimitResult = rateLimit(`login:${clientIP}`, {
      windowMs: 5 * 60 * 1000, // 5 dakika
      maxRequests: 5,
    });

    if (!rateLimitResult.allowed) {
      return createErrorResponse(
        'Çok fazla giriş denemesi. Lütfen bir süre sonra tekrar deneyin.',
        429
      );
    }

    // Validate request body with Zod
    const validation = await validateRequest(request, loginSchema);
    if (!validation.success) {
      return validation.response;
    }

    const { email, password } = validation.data;

    // Kullanıcıyı veritabanından bul
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      // Güvenlik: Kullanıcı bulunamadı mesajı (timing attack koruması için aynı süre)
      await comparePassword(password, '$2a$10$dummyHashForTimingProtection');
      return createErrorResponse('E-posta veya şifre hatalı', 401);
    }

    // Şifre kontrolü (hash karşılaştırması)
    const isPasswordValid = await comparePassword(password, user.password);
    
    if (!isPasswordValid) {
      return createErrorResponse('E-posta veya şifre hatalı', 401);
    }

    // Session oluştur (JWT)
    await setSession(
      {
        userId: user.id,
        email: user.email,
        isAdmin: user.isAdmin || false,
      },
      false // Normal kullanıcı session
    );

    // Şifreyi döndürme
    const { password: _, ...userWithoutPassword } = user;

    return createSuccessResponse(
      { user: userWithoutPassword },
      'Giriş başarılı',
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}

