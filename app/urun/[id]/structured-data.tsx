'use client';

import { useEffect } from 'react';

interface ProductStructuredDataProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    originalPrice?: number;
    image?: string;
    images?: string[];
    rating?: number;
    reviews?: number;
    inStock: boolean;
    categoryRelation?: { name: string; slug: string } | null;
    subCategory?: { name: string } | null;
  };
  reviews?: Array<{
    id: string;
    userName: string;
    rating: number;
    comment: string;
    createdAt: string;
  }>;
}

export default function ProductStructuredData({ product, reviews = [] }: ProductStructuredDataProps) {
  useEffect(() => {
    const images = product.images && product.images.length > 0 
      ? product.images.filter(img => img && img.trim() !== '')
      : (product.image && product.image.trim() !== '' ? [product.image] : []);

    const mainImage = images.length > 0 ? images[0] : '/incitakilogo.png';
    
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    
    // Product Schema
    const productSchema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description,
      image: images.length > 0 ? images.map(img => `${baseUrl}${img}`) : [`${baseUrl}${mainImage}`],
      sku: product.id,
      mpn: product.id,
      brand: {
        '@type': 'Brand',
        name: 'İnci Takı',
      },
      category: product.categoryRelation?.name || product.subCategory?.name || 'Ürün',
      offers: {
        '@type': 'Offer',
        url: `${baseUrl}/urun/${product.id}`,
        priceCurrency: 'TRY',
        price: product.price,
        priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        availability: product.inStock 
          ? 'https://schema.org/InStock' 
          : 'https://schema.org/OutOfStock',
        itemCondition: 'https://schema.org/NewCondition',
        seller: {
          '@type': 'Organization',
          name: 'İnci Takı',
        },
      },
      ...(product.rating && product.reviews && product.reviews > 0 && {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: product.rating,
          reviewCount: product.reviews,
          bestRating: 5,
          worstRating: 1,
        },
      }),
      ...(reviews.length > 0 && {
        review: reviews.map((review) => ({
          '@type': 'Review',
          author: {
            '@type': 'Person',
            name: review.userName,
          },
          datePublished: review.createdAt,
          reviewBody: review.comment,
          reviewRating: {
            '@type': 'Rating',
            ratingValue: review.rating,
            bestRating: 5,
            worstRating: 1,
          },
        })),
      }),
    };

    // Breadcrumb Schema
    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Ana Sayfa',
          item: baseUrl,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Ürünler',
          item: `${baseUrl}/urunler`,
        },
        ...(product.categoryRelation ? [{
          '@type': 'ListItem',
          position: 3,
          name: product.categoryRelation.name,
          item: `${baseUrl}/kategoriler/${product.categoryRelation.slug}`,
        }] : []),
        {
          '@type': 'ListItem',
          position: product.categoryRelation ? 4 : 3,
          name: product.name,
          item: `${baseUrl}/urun/${product.id}`,
        },
      ],
    };

    // Script tags oluştur
    const script1 = document.createElement('script');
    script1.type = 'application/ld+json';
    script1.text = JSON.stringify(productSchema);
    script1.id = 'product-structured-data';

    const script2 = document.createElement('script');
    script2.type = 'application/ld+json';
    script2.text = JSON.stringify(breadcrumbSchema);
    script2.id = 'breadcrumb-structured-data';

    // Eski script'leri kaldır
    const oldScript1 = document.getElementById('product-structured-data');
    const oldScript2 = document.getElementById('breadcrumb-structured-data');
    if (oldScript1) oldScript1.remove();
    if (oldScript2) oldScript2.remove();

    // Yeni script'leri ekle
    document.head.appendChild(script1);
    document.head.appendChild(script2);

    return () => {
      if (script1.parentNode) script1.parentNode.removeChild(script1);
      if (script2.parentNode) script2.parentNode.removeChild(script2);
    };
  }, [product, reviews]);

  return null;
}

