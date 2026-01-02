import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        categoryRelation: true,
        subCategory: true,
      },
    });

    if (!product) {
      return {
        title: 'Ürün Bulunamadı',
      };
    }

    const images = product.images 
      ? (() => {
          try {
            const parsed = JSON.parse(product.images);
            return Array.isArray(parsed) ? parsed.filter(img => img && img.trim() !== '') : [];
          } catch {
            return [];
          }
        })()
      : [];
    
    const mainImage = product.image || (images.length > 0 ? images[0] : '/incitakilogo.png');
    const description = product.description || `${product.name} - İnci Takı'da keşfedin. Kaliteli ürünlerle hayatınıza değer katın.`;
    
    const price = product.price;
    const originalPrice = (product as any).originalPrice || null;
    const availability = product.inStock ? 'InStock' : 'OutOfStock';
    
    const url = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/urun/${id}`;

    return {
      title: product.name,
      description: description.substring(0, 160),
      keywords: [
        product.name,
        product.categoryRelation?.name || product.category || '',
        product.subCategory?.name || '',
        'takı',
        'online alışveriş',
        'e-ticaret',
      ].filter(Boolean),
      openGraph: {
        type: 'website',
        title: product.name,
        description: description.substring(0, 160),
        url,
        siteName: 'İnci Takı',
        images: [
          {
            url: mainImage,
            width: 1200,
            height: 630,
            alt: product.name,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: product.name,
        description: description.substring(0, 160),
        images: [mainImage],
      },
      alternates: {
        canonical: url,
      },
      other: {
        'product:price:amount': price.toString(),
        'product:price:currency': 'TRY',
        'product:availability': availability,
        'product:condition': 'new',
        ...(originalPrice && {
          'product:original_price:amount': originalPrice.toString(),
          'product:original_price:currency': 'TRY',
        }),
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Ürün',
    };
  }
}

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

