'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types';
import { ShoppingCart, Star, Heart, Plus, Minus } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useToast } from '@/components/ToastContainer';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, cartItems, updateQuantity, removeFromCart } = useCart();
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

  const handleIncreaseQuantity = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (cartItem) {
      try {
        const availableStock = product.stock ?? (product.inStock ? 999 : 0);
        if (cartQuantity + 1 > availableStock) {
          showToast(`Stokta sadece ${availableStock} adet bulunmaktadır`, 'error');
          return;
        }
        updateQuantity(product.id, cartQuantity + 1);
        showToast('Miktar artırıldı', 'success');
      } catch (error: any) {
        showToast(error.message || 'Bir hata oluştu', 'error');
      }
    }
  };

  const handleDecreaseQuantity = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (cartItem && cartQuantity > 1) {
      try {
        updateQuantity(product.id, cartQuantity - 1);
        showToast('Miktar azaltıldı', 'success');
      } catch (error: any) {
        showToast(error.message || 'Bir hata oluştu', 'error');
      }
    } else if (cartItem && cartQuantity === 1) {
      removeFromCart(product.id);
      showToast('Ürün sepetten çıkarıldı', 'success');
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product);
    showToast(
      favorite ? 'Favorilerden kaldırıldı' : 'Favorilere eklendi',
      'success'
    );
  };

  return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-200 border border-gray-200/50 group">
      {/* Product Image - Clickable Link */}
      <Link href={`/urun/${product.id}`} className="block">
        <div className="relative aspect-square bg-gradient-to-br from-orange-50 via-orange-100 to-orange-50 overflow-hidden">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                if (target.nextElementSibling) {
                  (target.nextElementSibling as HTMLElement).style.display = 'flex';
                }
              }}
            />
          ) : null}
          <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 ${product.image ? 'hidden' : ''}`}>
            <span className="text-6xl">💎</span>
          </div>
          {product.originalPrice && (
            <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
              %{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)} İndirim
            </div>
          )}
          <button
            onClick={handleToggleFavorite}
            className={`absolute top-3 left-3 p-2 rounded-full shadow-lg transition-all ${
              favorite
                ? 'bg-red-500 text-white'
                : 'bg-white text-gray-600 hover:bg-red-50'
            }`}
          >
            <Heart className={`w-5 h-5 ${favorite ? 'fill-current' : ''}`} />
          </button>
          {!product.inStock && (
            <div className="absolute inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center backdrop-blur-sm rounded-xl">
              <span className="text-white font-bold text-lg">Stokta Yok</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-3 sm:p-4 md:p-5">
        <Link href={`/urun/${product.id}`}>
          <h3 className="font-bold text-gray-900 mb-1 sm:mb-2 group-hover:text-orange-600 transition-colors line-clamp-2 text-base sm:text-lg break-words">
            {product.name}
          </h3>
          
          <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2 leading-relaxed break-words">
            {product.description}
          </p>
        </Link>

          {/* Rating */}
          {product.reviews && product.reviews > 0 && product.rating && product.rating > 0 ? (
            <div className="flex items-center gap-1.5 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating!) 
                        ? 'fill-orange-400 text-orange-400' 
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-gray-700">{product.rating.toFixed(1)}</span>
              <span className="text-sm text-gray-500">({product.reviews})</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 text-gray-300"
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">Henüz değerlendirilmedi</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-baseline gap-1 sm:gap-2">
              <span className="text-lg sm:text-xl md:text-2xl font-bold text-orange-600">
                {product.price.toLocaleString('tr-TR')} ₺
              </span>
              {product.originalPrice && (
                <span className="text-sm text-gray-400 line-through">
                  {product.originalPrice.toLocaleString('tr-TR')} ₺
                </span>
              )}
            </div>
          </div>

        {/* Add to Cart Button or Quantity Controls */}
        {!inCart ? (
          !product.inStock ? (
            <div className="w-full flex items-center justify-center gap-2 bg-gray-300 text-gray-600 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base cursor-not-allowed overflow-hidden">
              <span className="truncate">Stokta Yok</span>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base hover:from-orange-700 hover:to-orange-800 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
            >
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="hidden sm:inline truncate">Sepete Ekle</span>
              <span className="sm:hidden truncate">Ekle</span>
            </button>
          )
        ) : (
          <div className="flex items-center gap-2 bg-orange-50 border-2 border-orange-600 rounded-lg sm:rounded-xl p-2">
            <button
              onClick={handleDecreaseQuantity}
              className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center bg-white border border-orange-600 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={cartQuantity <= 1}
            >
              <Minus className="w-4 h-4" />
            </button>
            <div className="flex-1 text-center">
              <div className="text-xs text-gray-600 mb-0.5">Sepette</div>
              <div className="text-base sm:text-lg font-bold text-orange-600">{cartQuantity}</div>
            </div>
            <button
              onClick={handleIncreaseQuantity}
              className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center bg-white border border-orange-600 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!product.inStock || (product.stock != null && cartQuantity >= product.stock)}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

