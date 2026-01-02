import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/middleware/adminAuth';
import { formatProductForResponse, formatProductsForResponse } from '@/lib/utils/product';

// GET - Tüm ürünleri getir
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) {
    return auth.response!;
  }
  try {
    const products = await prisma.product.findMany({
      include: {
        categoryRelation: true,
        subCategory: {
          include: {
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Product'ları formatla
    const formattedProducts = formatProductsForResponse(products).map(product => ({
      ...product,
      categoryData: product.categoryRelation,
      subCategory: product.subCategory,
    }));

    return NextResponse.json({ products: formattedProducts });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Ürünler yüklenemedi', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Yeni ürün ekle
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) {
    return auth.response!;
  }
  
  try {
    const data = await request.json();
    
    // Stok mantığı: stock ve inStock tutarlı olmalı
    let stockValue = data.stock;
    let inStockValue = data.inStock;
    
    // Eğer stock belirtilmişse, inStock'u buna göre ayarla
    if (stockValue !== undefined && stockValue !== null) {
      stockValue = typeof stockValue === 'string' ? parseInt(stockValue) : stockValue;
      inStockValue = stockValue > 0;
    } else if (inStockValue !== undefined) {
      // Eğer sadece inStock belirtilmişse, stock'u buna göre ayarla
      stockValue = inStockValue ? (data.stock ?? 10) : 0;
    } else {
      // Hiçbiri belirtilmemişse varsayılan değerler
      stockValue = 10;
      inStockValue = true;
    }
    
    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        originalPrice: data.originalPrice,
        image: data.image,
        images: data.images ? JSON.stringify(data.images) : null,
        category: data.category || data.categoryRelation?.slug || '',
        categoryId: data.categoryId || null,
        subCategoryId: data.subCategoryId || null,
        inStock: inStockValue,
        stock: stockValue,
        // Rating ve reviews otomatik olarak yorumlardan hesaplanacak, başlangıçta 0
        rating: 0,
        reviews: 0,
      },
      include: {
        categoryRelation: true,
        subCategory: {
          include: {
            category: true,
          },
        },
      },
    });

    // Product'ı formatla
    const formattedProduct = formatProductForResponse(product);
    
    return NextResponse.json({ 
      success: true, 
      product: {
        ...formattedProduct,
        categoryData: product.categoryRelation,
        subCategory: product.subCategory,
      }
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Ürün eklenemedi' },
      { status: 500 }
    );
  }
}

// PUT - Ürün güncelle
export async function PUT(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) {
    return auth.response!;
  }
  
  try {
    const { id, ...updates } = await request.json();
    
    const updateData: any = { ...updates };
    
    // Prisma'da güncellenemeyen alanları temizle
    delete updateData.id;
    delete updateData.categoryData;
    delete updateData.categoryRelation;
    delete updateData.subCategory;
    delete updateData.createdAt;
    delete updateData.updatedAt;
    delete updateData.orderItems;
    delete updateData.productReviews;
    
    // categoryData yerine categoryId kullan
    if (updates.categoryData) {
      updateData.categoryId = updates.categoryData.id;
    }
    
    // images'i string'e çevir (eğer array ise)
    if (updateData.images && Array.isArray(updateData.images)) {
      updateData.images = JSON.stringify(updateData.images);
    }

    // Stok mantığı: stock ve inStock her zaman tutarlı olmalı
    // Önce mevcut ürünü al
    const currentProduct = await prisma.product.findUnique({
      where: { id },
      select: { stock: true, inStock: true }
    });
    
    if (!currentProduct) {
      return NextResponse.json(
        { error: 'Ürün bulunamadı' },
        { status: 404 }
      );
    }
    
    // Stok güncelleme mantığı - null değerleri handle et
    let finalStock = currentProduct.stock ?? 0;
    let finalInStock = currentProduct.inStock ?? (finalStock > 0);
    
    // Eğer stock güncelleniyorsa
    if (updateData.stock !== undefined && updateData.stock !== null) {
      const stockValue = typeof updateData.stock === 'string' ? parseInt(updateData.stock) : updateData.stock;
      finalStock = isNaN(stockValue) ? 0 : Math.max(0, stockValue); // Negatif değerleri 0 yap
      // Stock'a göre inStock'u otomatik ayarla
      finalInStock = finalStock > 0;
    }
    
    // Eğer inStock güncelleniyorsa
    if (updateData.inStock !== undefined) {
      finalInStock = updateData.inStock === true || updateData.inStock === 'true' || updateData.inStock === 1;
      // Eğer inStock false yapılıyorsa ama stock > 0 ise, stock'u 0 yap
      if (!finalInStock && finalStock > 0) {
        finalStock = 0;
      }
      // Eğer inStock true yapılıyorsa ama stock 0 ise, stock'u 1 yap
      if (finalInStock && finalStock === 0) {
        finalStock = 1;
      }
    }
    
    // Güncellenmiş değerleri updateData'ya ekle (her zaman number olarak)
    updateData.stock = finalStock;
    updateData.inStock = finalInStock;

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        categoryRelation: true,
        subCategory: {
          include: {
            category: true,
          },
        },
      },
    });

    let images = [];
    if (product.images) {
      try {
        images = JSON.parse(product.images);
      } catch (e) {
        console.error('Error parsing images for product:', product.id, e);
        images = [];
      }
    }
    
    // inStock ve stock değerlerini garantile (tutarlılık için)
    const stockValue = product.stock ?? 0;
    const inStockValue = product.inStock ?? (stockValue > 0);
    
    // Rating ve reviews - yorum yoksa null/undefined döndür
    const reviewCount = product.reviews ?? 0;
    const ratingValue = reviewCount > 0 && product.rating && product.rating > 0 
      ? product.rating 
      : undefined;
    
    return NextResponse.json({ 
      success: true, 
      product: {
        ...product,
        images,
        categoryData: product.categoryRelation,
        subCategory: product.subCategory,
        stock: stockValue,
        inStock: inStockValue,
        rating: ratingValue,
        reviews: reviewCount > 0 ? reviewCount : undefined,
      }
    });
  } catch (error: any) {
    console.error('Error updating product:', error);
    // Daha detaylı hata mesajı
    const errorMessage = error.message || 'Ürün güncellenemedi';
    const errorCode = error.code || 'UNKNOWN_ERROR';
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error.message,
        code: errorCode,
        success: false
      },
      { status: 500 }
    );
  }
}

// DELETE - Ürün sil
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
        { error: 'Ürün ID gerekli', success: false },
        { status: 400 }
      );
    }

    // Önce ürünün var olup olmadığını kontrol et
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Ürün bulunamadı', success: false },
        { status: 404 }
      );
    }

    // Ürünü sil - OrderItem'lar ve Review'lar otomatik silinecek (onDelete: Cascade)
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    
    // Prisma hata kodlarını kontrol et
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Ürün bulunamadı', success: false },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Ürün silinemedi', success: false },
      { status: 500 }
    );
  }
}
