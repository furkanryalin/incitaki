import { NextRequest, NextResponse } from 'next/server';
import { handleApiError, createSuccessResponse, createErrorResponse } from '@/lib/apiHandler';
import { prisma } from '@/lib/prisma';

/**
 * Payment Gateway Callback Handler
 * iyzico veya diğer payment gateway'lerden gelen callback'leri işler
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Payment gateway'den gelen callback verilerini doğrula
    const { paymentId, status, orderNumber } = body;

    if (!paymentId || !status || !orderNumber) {
      return createErrorResponse('Geçersiz callback verisi', 400);
    }

    // Siparişi bul
    const order = await prisma.order.findUnique({
      where: { orderNumber },
    });

    if (!order) {
      return createErrorResponse('Sipariş bulunamadı', 404);
    }

    // Payment status'e göre sipariş durumunu güncelle
    let orderStatus = order.status;
    
    if (status === 'SUCCESS' || status === 'success') {
      orderStatus = 'processing';
    } else if (status === 'FAILURE' || status === 'failure') {
      orderStatus = 'cancelled';
    }

    // Sipariş durumunu güncelle
    await prisma.order.update({
      where: { orderNumber },
      data: { status: orderStatus },
    });

    return createSuccessResponse(
      { orderNumber, status: orderStatus },
      'Payment callback işlendi',
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}

// GET - Payment status check (webhook verification için)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get('orderNumber');

    if (!orderNumber) {
      return createErrorResponse('Order number gerekli', 400);
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      select: {
        orderNumber: true,
        status: true,
        totalPrice: true,
        shippingCost: true,
        createdAt: true,
      },
    });

    if (!order) {
      return createErrorResponse('Sipariş bulunamadı', 404);
    }

    return createSuccessResponse({ order });
  } catch (error) {
    return handleApiError(error);
  }
}

