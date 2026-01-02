import { Product } from '@/types';

/**
 * Product images string'ini JSON array'e çevirir
 */
export function parseProductImages(imagesString: string | null | undefined): string[] {
  if (!imagesString) {
    return [];
  }
  
  try {
    const parsed = JSON.parse(imagesString);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Error parsing product images:', e);
    return [];
  }
}

/**
 * Product stock ve inStock değerlerini tutarlı hale getirir
 */
export function normalizeProductStock(
  stock: number | null | undefined,
  inStock: boolean | null | undefined
): { stock: number; inStock: boolean } {
  const stockValue = stock ?? 0;
  const inStockValue = inStock ?? (stockValue > 0);
  
  return {
    stock: stockValue,
    inStock: inStockValue,
  };
}

/**
 * Product rating ve reviews değerlerini normalize eder
 */
export function normalizeProductRating(
  rating: number | null | undefined,
  reviews: number | null | undefined
): { rating: number | undefined; reviews: number | undefined } {
  const reviewCount = reviews ?? 0;
  const ratingValue = reviewCount > 0 && rating && rating > 0 
    ? rating 
    : undefined;
  
  return {
    rating: ratingValue,
    reviews: reviewCount > 0 ? reviewCount : undefined,
  };
}

/**
 * Product'ı frontend için formatlar
 * Images, stock, rating değerlerini normalize eder
 */
export function formatProductForResponse(product: any): any {
  const images = parseProductImages(product.images);
  const { stock, inStock } = normalizeProductStock(product.stock, product.inStock);
  const { rating, reviews } = normalizeProductRating(product.rating, product.reviews);
  
  return {
    ...product,
    images,
    stock,
    inStock,
    rating,
    reviews,
  };
}

/**
 * Product array'ini formatlar
 */
export function formatProductsForResponse(products: any[]): any[] {
  return products.map(formatProductForResponse);
}

