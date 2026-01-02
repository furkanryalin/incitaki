import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/middleware/adminAuth';
import { parseProductImages } from '@/lib/utils/product';

// GET - Tüm siparişleri getir
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) {
    return auth.response!;
  }
  try {
    const orders = await prisma.order.findMany({
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
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Siparişler yüklenemedi' },
      { status: 500 }
    );
  }
}

// POST - Yeni sipariş ekle
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) {
    return auth.response!;
  }
  
  try {
    const data = await request.json();
    
    // Create order with items
    const order = await prisma.order.create({
      data: {
        orderNumber: data.orderNumber,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        customerAddress: data.customerAddress,
        totalPrice: data.totalPrice,
        shippingCost: data.shippingCost ?? 0,
        status: data.status ?? 'pending',
        notes: data.notes,
        userId: data.userId,
        items: {
          create: data.items.map((item: any) => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: item.product.price,
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
        where: { id: item.product.id },
      });

      if (product && product.stock !== null) {
        const newStock = Math.max(0, product.stock - item.quantity);
        await prisma.product.update({
          where: { id: item.product.id },
          data: {
            stock: newStock,
            inStock: newStock > 0,
          },
        });
      }
    }

    return NextResponse.json({ 
      success: true, 
      order: {
        ...order,
        items: order.items.map(item => ({
          product: {
            ...item.product,
            images: item.product.images ? JSON.parse(item.product.images) : [],
          },
          quantity: item.quantity,
        })),
      }
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Sipariş eklenemedi' },
      { status: 500 }
    );
  }
}

// PUT - Sipariş güncelle
export async function PUT(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) {
    return auth.response!;
  }
  
  try {
    const { id, ...updates } = await request.json();
    
    const order = await prisma.order.update({
      where: { id },
      data: updates,
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json({ 
      success: true, 
      order: {
        ...order,
        items: order.items.map(item => ({
          product: {
            ...item.product,
            images: item.product.images ? JSON.parse(item.product.images) : [],
          },
          quantity: item.quantity,
        })),
      }
    });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Sipariş güncellenemedi' },
      { status: 500 }
    );
  }
}

// DELETE - Sipariş sil
export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) {
    return auth.response!;
  }
  
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Sipariş ID gerekli' },
        { status: 400 }
      );
    }

    await prisma.order.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json(
      { error: 'Sipariş silinemedi' },
      { status: 500 }
    );
  }
}
