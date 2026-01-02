import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError, createSuccessResponse, createErrorResponse } from '@/lib/apiHandler';

// GET - Ürün yorumlarını getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const reviews = await prisma.review.findMany({
      where: {
        productId: id,
        approved: true,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return createSuccessResponse({ reviews });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST - Yeni yorum ekle
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Rate limiting - 10 dakikada maksimum 3 yorum
    const { rateLimit, getClientIP } = await import('@/lib/rateLimit');
    const clientIP = getClientIP(request);
    const rateLimitResult = rateLimit(`review:${clientIP}:${id}`, {
      windowMs: 10 * 60 * 1000, // 10 dakika
      maxRequests: 3,
    });

    if (!rateLimitResult.allowed) {
      return createErrorResponse(
        'Çok fazla yorum denemesi. Lütfen bir süre sonra tekrar deneyin.',
        429
      );
    }
    
    // Validate request body with Zod
    const { validateRequest } = await import('@/lib/apiHandler');
    const { reviewSchema } = await import('@/lib/validations');
    const validation = await validateRequest(request, reviewSchema);
    if (!validation.success) {
      return validation.response;
    }

    const { userName, userEmail, rating, comment, userId } = validation.data;
    
    // Ürünün var olup olmadığını kontrol et
    const product = await prisma.product.findUnique({
      where: { id },
    });
    
    if (!product) {
      return createErrorResponse('Ürün bulunamadı', 404);
    }
    
    // userId kontrolü - eğer varsa geçerli olup olmadığını kontrol et
    let validUserId: string | undefined = undefined;
    if (userId) {
      const userExists = await prisma.user.findUnique({
        where: { id: userId },
      });
      if (userExists) {
        validUserId = userId;
      } else {
        console.warn('Invalid userId provided, creating review without userId');
      }
    }
    
    const review = await prisma.review.create({
      data: {
        productId: id,
        userId: validUserId || null,
        userName,
        userEmail,
        rating,
        comment,
        approved: false, // Admin onayı bekliyor
      },
    });

    return createSuccessResponse(
      { review },
      'Yorumunuz admin onayından sonra yayınlanacaktır.'
    );
  } catch (error) {
    return handleApiError(error);
  }
}

