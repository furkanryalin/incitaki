'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types';
import { ShoppingCart, Star, Heart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useToast } from '@/components/ToastContainer';

interface ProductCardSmallProps {
  product: Product;
}

export default function ProductCardSmall({ product }: ProductCardSmallProps) {
  const { addToCart, cartItems, updateQuantity } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { showToast } = useToast();
  const favorite = isFavorite(product.id);
  const cartItem = cartItems.find(item => item.product.id === product.id);
  const inCart = cartItem !== undefined;
  const cartQuantity = cartItem?.quantity || 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      addToCart(product, 1);
      showToast(`${product.name} sepete eklendi!`, 'success');
    } catch (error: any) {
      showToast(error.message || 'Sepete eklenirken bir hata oluştu', 'error');
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product);
    showToast(
      favorite ? 'Favorilerden çıkarıldı' : 'Favorilere eklendi',
      'success'
    );
  };

  return (
    <Link href={`/urun/${product.id}`} className="group block">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 h-full flex flex-col">
        {/* Image */}
        <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              loading="lazy"
              quality={75}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-3xl">💎</span>
            </div>
          )}
          
          {/* Favorite Button */}
          <button
            onClick={handleToggleFavorite}
            className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors z-10"
            aria-label={favorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}
          >
            <Heart
              className={`w-3.5 h-3.5 ${
                favorite
                  ? 'fill-orange-600 text-orange-600'
                  : 'text-gray-400'
              }`}
            />
          </button>

          {/* Out of Stock Badge */}
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
              <span className="bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded">
                Stokta Yok
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-2.5 flex-1 flex flex-col min-w-0">
          {/* Name */}
          <h3 className="text-xs font-semibold text-gray-900 line-clamp-2 mb-1.5 break-words min-w-0">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-2 min-w-0">
            {product.rating && product.reviews && product.reviews > 0 ? (
              <>
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  <Star className="w-3 h-3 fill-orange-400 text-orange-400" />
                  <span className="text-xs font-semibold text-gray-900">
                    {product.rating.toFixed(1)}
                  </span>
                </div>
                <span className="text-xs text-gray-500 truncate">
                  ({product.reviews})
                </span>
              </>
            ) : (
              <div className="flex items-center gap-0.5 min-w-0 flex-1">
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="w-3 h-3 text-gray-300"
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-400 ml-1 truncate">
                  Henüz değerlendirilmedi
                </span>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-1.5 mb-2 min-w-0">
            <span className="text-sm font-bold text-orange-600 truncate">
              {product.price.toLocaleString('tr-TR')} ₺
            </span>
            {product.originalPrice && (
              <span className="text-xs text-gray-400 line-through truncate">
                {product.originalPrice.toLocaleString('tr-TR')} ₺
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          {!product.inStock ? (
            <div className="w-full flex items-center justify-center gap-1 bg-gray-200 text-gray-500 py-1.5 rounded text-xs font-semibold cursor-not-allowed overflow-hidden">
              <span className="truncate">Stokta Yok</span>
            </div>
          ) : inCart ? (
            <div className="flex items-center justify-between gap-1 bg-orange-50 border border-orange-200 rounded px-2 py-1.5">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (cartQuantity > 1) {
                    updateQuantity(product.id, cartQuantity - 1);
                  }
                }}
                className="w-5 h-5 flex items-center justify-center rounded hover:bg-orange-100 transition-colors"
                aria-label="Azalt"
              >
                <span className="text-orange-600 font-bold text-sm">−</span>
              </button>
              <span className="text-xs font-semibold text-orange-600 flex-1 text-center truncate">
                {cartQuantity}
              </span>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const availableStock = product.stock ?? 999;
                  if (cartQuantity + 1 > availableStock) {
                    showToast(`Stokta sadece ${availableStock} adet bulunmaktadır`, 'error');
                    return;
                  }
                  updateQuantity(product.id, cartQuantity + 1);
                }}
                className="w-5 h-5 flex items-center justify-center rounded hover:bg-orange-100 transition-colors"
                aria-label="Artır"
              >
                <span className="text-orange-600 font-bold text-sm">+</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              className="w-full flex items-center justify-center gap-1 bg-orange-600 text-white py-1.5 rounded text-xs font-semibold hover:bg-orange-700 transition-colors active:scale-95 overflow-hidden"
            >
              <ShoppingCart className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">Sepete Ekle</span>
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}

