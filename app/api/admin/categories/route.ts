import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { categorySchema, createSlug } from '@/lib/validations';
import { validateRequest, handleApiError, createSuccessResponse, createErrorResponse, validateSearchParams } from '@/lib/apiHandler';
import { requireAdmin } from '@/lib/middleware/adminAuth';
import { z } from 'zod';

// Cache duration: 5 minutes (kategoriler daha az değişir)
export const revalidate = 300;

// GET - Tüm kategorileri getir (Public - herkes görebilir)
export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.category.findMany({
      include: {
        subCategories: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    
    const response = createSuccessResponse({ categories });
    // Cache headers - kategoriler daha az değiştiği için daha uzun cache
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}

// POST - Yeni kategori ekle
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) {
    return auth.response!;
  }
  
  try {
    const validation = await validateRequest(request, categorySchema);
    if (!validation.success) {
      return validation.response;
    }

    const { name, slug, image } = validation.data;
    
    // Slug yoksa name'den oluştur
    const finalSlug = slug || createSlug(name);

    const category = await prisma.category.create({
      data: {
        name,
        slug: finalSlug,
        image: image || null,
      },
    });

    return createSuccessResponse({ category }, 'Kategori başarıyla oluşturuldu', 201);
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT - Kategori güncelle
export async function PUT(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) {
    return auth.response!;
  }
  
  try {
    const updateCategorySchema = categorySchema
      .extend({
        id: z.string().min(1, 'Kategori ID gerekli'),
      })
      .partial()
      .required({ id: true });
    
    const validation = await validateRequest(request, updateCategorySchema);
    if (!validation.success) {
      return validation.response;
    }

    const { id, name, slug, image } = validation.data;
    
    // Eğer name güncelleniyorsa ama slug belirtilmemişse, slug'ı name'den oluştur
    let finalSlug = slug;
    if (name && !slug) {
      // Mevcut kategoriyi al
      const currentCategory = await prisma.category.findUnique({
        where: { id },
        select: { name: true },
      });
      if (currentCategory && currentCategory.name !== name) {
        finalSlug = createSlug(name);
      }
    }
    
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (finalSlug !== undefined) updateData.slug = finalSlug;
    if (image !== undefined) updateData.image = image;

    const category = await prisma.category.update({
      where: { id },
      data: updateData,
    });

    return createSuccessResponse({ category }, 'Kategori başarıyla güncellendi');
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE - Kategori sil
export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) {
    return auth.response!;
  }
  
  try {
    const { searchParams } = new URL(request.url);
    
    const idSchema = z.object({
      id: z.string().min(1, 'Kategori ID gerekli'),
    });
    
    const validation = validateSearchParams(searchParams, idSchema);
    if (!validation.success) {
      return validation.response;
    }
    
    const { id } = validation.data;

    // Önce kategoriyi bul
    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      return createErrorResponse('Kategori bulunamadı', 404);
    }

    // Bu kategoriye bağlı ürünleri kontrol et
    const productsWithCategory = await prisma.product.findMany({
      where: { category: category.slug },
      take: 1,
    });

    if (productsWithCategory.length > 0) {
      return createErrorResponse(
        'Bu kategoriye bağlı ürünler bulunmaktadır. Önce ürünleri silin veya başka bir kategoriye taşıyın.',
        400
      );
    }

    await prisma.category.delete({
      where: { id },
    });

    return createSuccessResponse(undefined, 'Kategori başarıyla silindi');
  } catch (error) {
    return handleApiError(error);
  }
}
