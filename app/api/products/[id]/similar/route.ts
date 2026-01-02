import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { formatProductsForResponse } from '@/lib/utils/product';

// Cache duration: 60 seconds
export const revalidate = 60;

// GET - Benzer ürünleri getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Mevcut ürünü getir
    const currentProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        categoryRelation: true,
        subCategory: true,
      },
    });

    if (!currentProduct) {
      return NextResponse.json(
        { error: 'Ürün bulunamadı' },
        { status: 404 }
      );
    }

    // Benzerlik kriterleri için where clause oluştur
    const where: any = {
      id: { not: id }, // Mevcut ürünü hariç tut
      inStock: true, // Sadece stokta olan ürünler
    };

    // Öncelik sırası:
    // 1. Aynı alt kategori (en yüksek öncelik)
    // 2. Aynı kategori
    // 3. Benzer fiyat aralığı (±%30)

    let similarProducts: any[] = [];

    // 1. Önce aynı alt kategorideki ürünleri ara
    if (currentProduct.subCategoryId) {
      const sameSubCategory = await prisma.product.findMany({
        where: {
          subCategoryId: currentProduct.subCategoryId,
          id: { not: id },
          inStock: true,
        },
        include: {
          categoryRelation: true,
          subCategory: true,
        },
        take: 8,
        orderBy: { createdAt: 'desc' },
      });

      if (sameSubCategory.length > 0) {
        similarProducts = sameSubCategory;
      }
    }

    // 2. Eğer yeterli ürün yoksa, aynı kategorideki ürünleri ekle
    if (similarProducts.length < 8 && currentProduct.categoryId) {
      const sameCategory = await prisma.product.findMany({
        where: {
          categoryId: currentProduct.categoryId,
          id: { not: id },
          inStock: true,
          ...(currentProduct.subCategoryId && {
            subCategoryId: { not: currentProduct.subCategoryId }, // Alt kategori farklı olanlar
          }),
        },
        include: {
          categoryRelation: true,
          subCategory: true,
        },
        take: 8 - similarProducts.length,
        orderBy: { createdAt: 'desc' },
      });

      similarProducts = [...similarProducts, ...sameCategory];
    }

    // 3. Eğer hala yeterli ürün yoksa, benzer fiyat aralığındaki ürünleri ekle
    if (similarProducts.length < 8) {
      const priceRange = currentProduct.price * 0.3; // ±%30
      const minPrice = currentProduct.price - priceRange;
      const maxPrice = currentProduct.price + priceRange;

      const similarPrice = await prisma.product.findMany({
        where: {
          price: {
            gte: minPrice,
            lte: maxPrice,
          },
          id: {
            notIn: [id, ...similarProducts.map(p => p.id)],
          },
          inStock: true,
        },
        include: {
          categoryRelation: true,
          subCategory: true,
        },
        take: 8 - similarProducts.length,
        orderBy: { createdAt: 'desc' },
      });

      similarProducts = [...similarProducts, ...similarPrice];
    }

    // 4. Eğer hala yeterli ürün yoksa, herhangi bir stokta olan ürün ekle
    if (similarProducts.length < 8) {
      const anyProducts = await prisma.product.findMany({
        where: {
          id: {
            notIn: [id, ...similarProducts.map(p => p.id)],
          },
          inStock: true,
        },
        include: {
          categoryRelation: true,
          subCategory: true,
        },
        take: 8 - similarProducts.length,
        orderBy: { createdAt: 'desc' },
      });

      similarProducts = [...similarProducts, ...anyProducts];
    }

    // Ürünleri formatla
    const formattedProducts = formatProductsForResponse(similarProducts.slice(0, 8)).map(product => ({
      ...product,
      categoryData: product.categoryRelation,
      subCategory: product.subCategory,
    }));

    const response = NextResponse.json({
      products: formattedProducts,
    });
    
    // Cache headers
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
    
    return response;
  } catch (error) {
    console.error('Error fetching similar products:', error);
    return NextResponse.json(
      { error: 'Benzer ürünler yüklenemedi', products: [] },
      { status: 500 }
    );
  }
}

