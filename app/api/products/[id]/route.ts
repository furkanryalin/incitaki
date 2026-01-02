import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { formatProductForResponse } from '@/lib/utils/product';

// Cache duration: 60 seconds
export const revalidate = 60;

// GET - Tek ürün getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        productReviews: {
          where: { approved: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Ürün bulunamadı' },
        { status: 404 }
      );
    }

    // Product'ı formatla
    const formattedProduct = formatProductForResponse(product);
    
    const response = NextResponse.json({
      product: formattedProduct,
    });
    
    // Cache headers
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
    
    return response;
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Ürün yüklenemedi' },
      { status: 500 }
    );
  }
}

