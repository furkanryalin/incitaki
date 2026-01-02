'use client';

import Link from 'next/link';
import Image from 'next/image';

interface CategoryCardHomeProps {
  name: string;
  slug: string;
  image?: string;
}

export default function CategoryCardHome({ name, slug, image }: CategoryCardHomeProps) {

  return (
    <Link
      href={`/kategoriler/${slug}`}
      className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center hover:shadow-xl transition-shadow duration-200 border border-gray-200/50 group overflow-hidden"
    >
      <div className="relative aspect-square mb-3 sm:mb-4 rounded-lg sm:rounded-xl overflow-hidden bg-gradient-to-br from-orange-50 to-orange-100">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
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
        <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 ${image ? 'hidden' : ''}`}>
          <span className="text-3xl sm:text-5xl">💎</span>
        </div>
      </div>
      <h3 className="font-bold text-sm sm:text-base md:text-lg text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-2 break-words">
        {name}
      </h3>
    </Link>
  );
}

