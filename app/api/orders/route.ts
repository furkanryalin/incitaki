import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { orderSchema } from '@/lib/validations';
import { validateRequest, handleApiError, createSuccessResponse, createErrorResponse } from '@/lib/apiHandler';
import { getSession } from '@/lib/session';
import { parseProductImages } from '@/lib/utils/product';

// POST - Yeni sipariş oluştur (Public endpoint - kullanıcılar sipariş verebilir)
export async function POST(request: NextRequest) {
  try {
    // Validate request body
    const validation = await validateRequest(request, orderSchema);
    if (!validation.success) {
      return validation.response;
    }

    const data = validation.data;
    
    // Session'dan user ID al (varsa)
    const session = await getSession();
    const userId = session?.userId || null;

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // Create order with items
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        customerAddress: data.shippingAddress,
        totalPrice: data.totalPrice,
        shippingCost: data.shippingCost ?? 0,
        status: 'pending',
        notes: data.notes,
        userId,
        items: {
          create: data.items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Update product stocks
    for (const item of data.items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (product && product.stock !== null && product.stock !== undefined) {
        const newStock = Math.max(0, product.stock - item.quantity);
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: newStock,
            inStock: newStock > 0,
          },
        });
      }
    }

    // Format order for response
    const formattedOrder = {
      ...order,
      items: order.items.map(item => ({
        ...item,
        product: {
          ...item.product,
          images: parseProductImages(item.product.images),
        },
      })),
    };

    // Send order confirmation email
    try {
      const { sendOrderConfirmationEmail, sendAdminOrderNotification } = await import('@/lib/email');
      await sendOrderConfirmationEmail(formattedOrder);
      await sendAdminOrderNotification(formattedOrder);
    } catch (emailError) {
      console.error('Email gönderme hatası:', emailError);
      // Email hatası siparişi engellemez
    }

    return createSuccessResponse(
      { order: formattedOrder },
      'Siparişiniz başarıyla oluşturuldu',
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}

// GET - Kullanıcının siparişlerini getir (Authenticated)
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return createErrorResponse('Giriş yapmanız gerekiyor', 401);
    }

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id');

    if (orderId) {
      // Get single order
      const order = await prisma.order.findFirst({
        where: {
          id: orderId,
          userId: session.userId,
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!order) {
        return createErrorResponse('Sipariş bulunamadı', 404);
      }

      return createSuccessResponse({ order });
    } else {
      // Get all user orders
      const orders = await prisma.order.findMany({
        where: { userId: session.userId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return createSuccessResponse({ orders });
    }
  } catch (error) {
    return handleApiError(error);
  }
}

