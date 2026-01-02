import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { rateLimit, getClientIP } from '@/lib/rateLimit';
import { registerSchema } from '@/lib/validations';
import { validateRequest, handleApiError, createSuccessResponse, createErrorResponse } from '@/lib/apiHandler';
import { setSession } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - 15 dakikada maksimum 3 kayıt
    const clientIP = getClientIP(request);
    const rateLimitResult = rateLimit(`register:${clientIP}`, {
      windowMs: 15 * 60 * 1000, // 15 dakika
      maxRequests: 3,
    });

    if (!rateLimitResult.allowed) {
      return createErrorResponse(
        'Çok fazla kayıt denemesi. Lütfen bir süre sonra tekrar deneyin.',
        429
      );
    }

    // Validate request body with Zod
    const validation = await validateRequest(request, registerSchema);
    if (!validation.success) {
      return validation.response;
    }

    const { name, email, password, phone } = validation.data;

    // E-posta kontrolü - kullanıcı zaten var mı?
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return createErrorResponse('Bu e-posta adresi zaten kullanılıyor', 409);
    }

    // Şifreyi hash'le
    const hashedPassword = await hashPassword(password);

    // Yeni kullanıcı oluştur
    const newUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        phone: phone || null,
        isAdmin: false, // Yeni kullanıcılar admin değil
      },
    });

    // Session oluştur (JWT)
    await setSession(
      {
        userId: newUser.id,
        email: newUser.email,
        isAdmin: newUser.isAdmin || false,
      },
      false // Normal kullanıcı session
    );

    // Şifreyi döndürme
    const { password: _, ...userWithoutPassword } = newUser;

    return createSuccessResponse(
      { user: userWithoutPassword },
      'Kayıt başarılı',
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}

