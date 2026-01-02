/**
 * Ürünün rating ve reviews değerlerini onaylanmış yorumlardan otomatik hesaplar ve günceller
 */

import { prisma } from './prisma';

export async function updateProductRating(productId: string) {
  try {
    // Onaylanmış yorumları getir
    const approvedReviews = await prisma.review.findMany({
      where: {
        productId,
        approved: true,
      },
      select: {
        rating: true,
      },
    });

    // Rating ve reviews hesapla
    const reviewCount = approvedReviews.length;
    const averageRating = reviewCount > 0
      ? approvedReviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
      : 0;

    // Ürünü güncelle
    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: Math.round(averageRating * 10) / 10, // 1 ondalık basamak
        reviews: reviewCount,
      },
    });

    return {
      rating: Math.round(averageRating * 10) / 10,
      reviews: reviewCount,
    };
  } catch (error) {
    console.error('Error updating product rating:', error);
    throw error;
  }
}

