import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword } from '@/lib/auth';
import { setSession } from '@/lib/session';
import { rateLimit, getClientIP } from '@/lib/rateLimit';
import { validateRequest, handleApiError, createSuccessResponse, createErrorResponse } from '@/lib/apiHandler';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Geçersiz e-posta formatı'),
  password: z.string().min(1, 'Şifre gerekli'),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - 5 dakikada maksimum 5 deneme
    const clientIP = getClientIP(request);
    const rateLimitResult = rateLimit(`admin-login:${clientIP}`, {
      windowMs: 5 * 60 * 1000, // 5 dakika
      maxRequests: 5,
    });

    if (!rateLimitResult.allowed) {
      return createErrorResponse(
        'Çok fazla giriş denemesi. Lütfen bir süre sonra tekrar deneyin.',
        429
      );
    }

    // Validate request body
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
      // Güvenlik: Timing attack koruması için aynı süre
      await comparePassword(password, '$2a$10$dummyHashForTimingProtection');
      return createErrorResponse('E-posta veya şifre hatalı', 401);
    }

    // Admin kontrolü
    if (!user.isAdmin) {
      // Güvenlik: Timing attack koruması için aynı süre
      await comparePassword(password, '$2a$10$dummyHashForTimingProtection');
      return createErrorResponse('Admin yetkisi bulunmuyor', 403);
    }

    // Şifre kontrolü
    const isPasswordValid = await comparePassword(password, user.password);
    
    if (!isPasswordValid) {
      return createErrorResponse('E-posta veya şifre hatalı', 401);
    }

    // Session oluştur
    await setSession(
      {
        userId: user.id,
        email: user.email,
        isAdmin: true,
      },
      true // Admin session
    );

    // Şifreyi döndürme
    const { password: _, ...userWithoutPassword } = user;

    return createSuccessResponse(
      { 
        user: userWithoutPassword,
        isAdmin: true,
      },
      'Admin girişi başarılı',
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}

