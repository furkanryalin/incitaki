import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { updateProductRating } from '@/lib/updateProductRating';
import { requireAdmin } from '@/lib/middleware/adminAuth';

// GET - Tüm yorumları getir
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) {
    return auth.response!;
  }
  try {
    const reviews = await prisma.review.findMany({
      include: {
        product: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedReviews = reviews.map(review => ({
      ...review,
      productName: review.product.name,
    }));

    return NextResponse.json({ reviews: formattedReviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Yorumlar yüklenemedi' },
      { status: 500 }
    );
  }
}

// POST - Yeni yorum ekle
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) {
    return auth.response!;
  }
  
  try {
    const data = await request.json();
    
    const review = await prisma.review.create({
      data: {
        productId: data.productId,
        userId: data.userId,
        userName: data.userName,
        userEmail: data.userEmail,
        rating: data.rating,
        comment: data.comment,
        approved: data.approved ?? false,
      },
      include: {
        product: true,
      },
    });

    // Eğer yorum onaylı olarak eklendiyse, ürün rating'ini güncelle
    if (review.approved) {
      try {
        await updateProductRating(review.productId);
      } catch (error) {
        console.error('Error updating product rating:', error);
        // Hata olsa bile yorum oluşturma başarılı, sadece log'la
      }
    }

    return NextResponse.json({ 
      success: true, 
      review: {
        ...review,
        productName: review.product.name,
      }
    });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Yorum eklenemedi' },
      { status: 500 }
    );
  }
}

// PUT - Yorum güncelle
export async function PUT(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) {
    return auth.response!;
  }
  
  try {
    const { id, ...updates } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Yorum ID gerekli', success: false },
        { status: 400 }
      );
    }

    // Güncellenecek veriyi hazırla
    const updateData: any = {};
    if (updates.approved !== undefined) updateData.approved = updates.approved;
    if (updates.reply !== undefined) updateData.reply = updates.reply;
    if (updates.rating !== undefined) updateData.rating = parseInt(updates.rating);
    if (updates.comment !== undefined) updateData.comment = updates.comment;
    
    const review = await prisma.review.update({
      where: { id },
      data: updateData,
      include: {
        product: true,
      },
    });

    // Eğer yorum onay durumu değiştiyse, ürün rating'ini güncelle
    if (updates.approved !== undefined) {
      try {
        await updateProductRating(review.productId);
      } catch (error) {
        console.error('Error updating product rating:', error);
        // Hata olsa bile yorum güncellemesi başarılı, sadece log'la
      }
    }

    return NextResponse.json({ 
      success: true, 
      review: {
        ...review,
        productName: review.product.name,
      }
    });
  } catch (error: any) {
    console.error('Error updating review:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Yorum bulunamadı', success: false },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Yorum güncellenemedi', 
        success: false,
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// DELETE - Yorum sil
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
        { error: 'Yorum ID gerekli', success: false },
        { status: 400 }
      );
    }

    // Önce yorumu al (productId için)
    const review = await prisma.review.findUnique({
      where: { id },
      select: { productId: true },
    });

    if (!review) {
      return NextResponse.json(
        { error: 'Yorum bulunamadı', success: false },
        { status: 404 }
      );
    }

    // Yorumu sil
    await prisma.review.delete({
      where: { id },
    });

    // Ürün rating'ini güncelle
    try {
      await updateProductRating(review.productId);
    } catch (error) {
      console.error('Error updating product rating:', error);
      // Hata olsa bile yorum silme başarılı, sadece log'la
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting review:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Yorum bulunamadı', success: false },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Yorum silinemedi', 
        success: false,
        details: error.message 
      },
      { status: 500 }
    );
  }
}
