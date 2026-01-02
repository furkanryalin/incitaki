import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/middleware/adminAuth';

// GET - Tüm alt kategorileri getir
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) {
    return auth.response!;
  }
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');

    const where = categoryId ? { categoryId } : {};

    const subCategories = await prisma.subCategory.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ subCategories });
  } catch (error: any) {
    console.error('Error fetching subcategories:', error);
    return NextResponse.json(
      { error: 'Alt kategoriler yüklenemedi', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Yeni alt kategori ekle
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) {
    return auth.response!;
  }
  
  try {
    const data = await request.json();

    if (!data.name || !data.slug || !data.categoryId) {
      return NextResponse.json(
        { error: 'Ad, slug ve kategori ID gerekli' },
        { status: 400 }
      );
    }

    const subCategory = await prisma.subCategory.create({
      data: {
        name: data.name,
        slug: data.slug,
        categoryId: data.categoryId,
        image: data.image,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({ success: true, subCategory });
  } catch (error: any) {
    console.error('Error creating subcategory:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Bu alt kategori adı veya slug zaten kullanılıyor' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Alt kategori eklenemedi' },
      { status: 500 }
    );
  }
}

// PUT - Alt kategori güncelle
export async function PUT(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) {
    return auth.response!;
  }
  
  try {
    const { id, ...updates } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Alt kategori ID gerekli' },
        { status: 400 }
      );
    }

    const subCategory = await prisma.subCategory.update({
      where: { id },
      data: updates,
      include: {
        category: true,
      },
    });

    return NextResponse.json({ success: true, subCategory });
  } catch (error: any) {
    console.error('Error updating subcategory:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Bu alt kategori adı veya slug zaten kullanılıyor' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Alt kategori güncellenemedi' },
      { status: 500 }
    );
  }
}

// DELETE - Alt kategori sil
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
        { error: 'Alt kategori ID gerekli' },
        { status: 400 }
      );
    }

    // Bu alt kategoriye bağlı ürünleri kontrol et
    const productsWithSubCategory = await prisma.product.findMany({
      where: { subCategoryId: id },
      take: 1,
    });

    if (productsWithSubCategory.length > 0) {
      return NextResponse.json(
        { error: 'Bu alt kategoriye bağlı ürünler bulunmaktadır. Önce ürünleri silin veya başka bir alt kategoriye taşıyın.' },
        { status: 400 }
      );
    }

    await prisma.subCategory.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting subcategory:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Alt kategori bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Alt kategori silinemedi' },
      { status: 500 }
    );
  }
}

