import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseProductImages } from '@/lib/utils/product';

// GET - Kullanıcının siparişlerini getir
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Kullanıcı ID gerekli' },
        { status: 400 }
      );
    }

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Format orders for frontend
    const formattedOrders = orders.map(order => ({
      ...order,
      items: order.items.map(item => ({
        product: {
          ...item.product,
          images: parseProductImages(item.product.images),
        },
        quantity: item.quantity,
      })),
    }));

    return NextResponse.json({ orders: formattedOrders });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return NextResponse.json(
      { error: 'Siparişler yüklenemedi' },
      { status: 500 }
    );
  }
}

