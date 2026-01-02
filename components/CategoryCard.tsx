'use client';

import Link from 'next/link';
import Image from 'next/image';

interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    slug: string;
    image?: string;
  };
}

export default function CategoryCard({ category }: CategoryCardProps) {

  return (
    <Link
      href={`/kategoriler/${category.slug}`}
      className="group bg-white rounded-2xl shadow-lg p-4 sm:p-6 text-center hover:shadow-xl transition-shadow duration-200 overflow-hidden"
    >
      <div className="relative aspect-square mb-4 sm:mb-6 rounded-xl overflow-hidden bg-gradient-to-br from-orange-50 to-orange-100">
        {category.image ? (
          <Image
            src={category.image}
            alt={category.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            loading="lazy"
            quality={85}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              if (target.nextElementSibling) {
                (target.nextElementSibling as HTMLElement).style.display = 'flex';
              }
            }}
          />
        ) : null}
        <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 ${category.image ? 'hidden' : ''}`}>
          <span className="text-4xl sm:text-6xl">💎</span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors line-clamp-2 break-words">
        {category.name}
      </h2>
      <p className="text-sm sm:text-base text-gray-600 line-clamp-1">Koleksiyonumuzu keşfedin</p>
    </Link>
  );
}

