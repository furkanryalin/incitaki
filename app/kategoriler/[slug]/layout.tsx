import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    const category = await prisma.category.findFirst({
      where: { slug },
      include: {
        subCategories: true,
        products: {
          take: 1,
        },
      },
    });

    if (!category) {
      return {
        title: 'Kategori Bulunamadı',
      };
    }

    const description = `İnci Takı'da ${category.name} kategorisindeki ürünleri keşfedin. ${category.subCategories?.length ? category.subCategories.length + ' alt kategori' : ''} ve geniş ürün yelpazesi ile kaliteli alışveriş.`;
    
    const url = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/kategoriler/${slug}`;
    const image = category.image || '/incitakilogo.png';

    return {
      title: category.name,
      description: description.substring(0, 160),
      keywords: [
        category.name,
        ...(category.subCategories?.map(sub => sub.name) || []),
        'takı',
        'online alışveriş',
        'e-ticaret',
      ],
      openGraph: {
        type: 'website',
        title: category.name,
        description: description.substring(0, 160),
        url,
        siteName: 'İnci Takı',
        images: [
          {
            url: image,
            width: 1200,
            height: 630,
            alt: category.name,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: category.name,
        description: description.substring(0, 160),
        images: [image],
      },
      alternates: {
        canonical: url,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Kategori',
    };
  }
}

export default function CategoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

