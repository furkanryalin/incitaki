export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { formatProductsForResponse } from '@/lib/utils/product';

// Cache duration: 60 seconds
export const revalidate = 60;

// GET - Tüm ürünleri getir (public endpoint)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category'); // Legacy slug
    const categoryId = searchParams.get('categoryId');
    const subCategoryId = searchParams.get('subCategoryId');
    const search = searchParams.get('search');

    const where: any = {};
    
    // Category filter - önce categoryId, sonra legacy category slug
    if (categoryId) {
      where.categoryId = categoryId;
    } else if (category && category !== 'all') {
      // Legacy category slug ile filtreleme
      where.OR = [
        { category: category },
        { categoryRelation: { slug: category } },
      ];
    }
    
    // SubCategory filter
    if (subCategoryId) {
      where.subCategoryId = subCategoryId;
    }
    
    // Search filter - ayrı bir where koşulu olarak ekle
    const searchWhere: any = {};
    if (search) {
      searchWhere.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }
    
    // Where koşullarını birleştir
    const finalWhere: any = {};
    if (where.categoryId) {
      finalWhere.categoryId = where.categoryId;
    }
    if (where.subCategoryId) {
      finalWhere.subCategoryId = where.subCategoryId;
    }
    if (where.OR) {
      finalWhere.OR = where.OR;
    }
    if (searchWhere.OR) {
      if (finalWhere.OR) {
        // Eğer hem category OR hem de search OR varsa, AND ile birleştir
        finalWhere.AND = [
          { OR: where.OR },
          { OR: searchWhere.OR },
        ];
        delete finalWhere.OR;
      } else {
        finalWhere.OR = searchWhere.OR;
      }
    }

    let products = await prisma.product.findMany({
      where: Object.keys(finalWhere).length > 0 ? finalWhere : {},
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

    // SQLite case-insensitive search için manuel filtreleme
    if (search) {
      const searchLower = search.toLowerCase();
      products = products.filter(product => 
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower) ||
        product.category.toLowerCase().includes(searchLower) ||
        product.categoryRelation?.name.toLowerCase().includes(searchLower) ||
        product.subCategory?.name.toLowerCase().includes(searchLower)
      );
    }

    // Product'ları formatla
    const formattedProducts = formatProductsForResponse(products).map(product => ({
      ...product,
      categoryData: product.categoryRelation,
      subCategory: product.subCategory,
    }));

    const response = NextResponse.json({ products: formattedProducts });
    
    // Cache headers
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
    
    return response;
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Ürünler yüklenemedi', details: error.message },
      { status: 500 }
    );
  }
}

