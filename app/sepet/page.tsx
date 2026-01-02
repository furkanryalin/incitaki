'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/components/ToastContainer';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCart();
  const { showToast } = useToast();
  const totalPrice = getTotalPrice();

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Sepetiniz Boş</h1>
              <p className="text-gray-600 mb-8">Sepetinize henüz ürün eklemediniz.</p>
              <Link
                href="/urunler"
                className="inline-flex items-center px-6 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors"
              >
                Alışverişe Başla
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-4 sm:py-6 md:py-8">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8">Sepetim</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.product.id}
                  className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 hover:shadow-xl transition-all duration-300 border border-gray-100"
                >
                  {/* Product Image */}
                  <div className="w-full sm:w-28 md:w-32 h-28 sm:h-32 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg sm:rounded-xl overflow-hidden flex-shrink-0 relative">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        if (target.nextElementSibling) {
                          (target.nextElementSibling as HTMLElement).style.display = 'flex';
                        }
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 hidden">
                      <span className="text-5xl">💎</span>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="flex-grow min-w-0">
                    <Link href={`/urun/${item.product.id}`}>
                      <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-1 sm:mb-2 hover:text-orange-600 transition-colors line-clamp-2 break-words">
                        {item.product.name}
                      </h3>
                    </Link>
                    <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2 break-words">{item.product.description}</p>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="text-base sm:text-lg font-bold text-orange-600">
                        {item.product.price.toLocaleString('tr-TR')} ₺
                      </div>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 sm:gap-3">
                        <button
                          onClick={() => {
                            try {
                              updateQuantity(item.product.id, item.quantity - 1);
                            } catch (error: any) {
                              showToast(error.message || 'Bir hata oluştu', 'error');
                            }
                          }}
                          className="w-8 h-8 sm:w-9 sm:h-9 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                        <span className="w-8 sm:w-10 text-center font-semibold text-sm sm:text-base">{item.quantity}</span>
                        <button
                          onClick={() => {
                            try {
                              const availableStock = (item.product.stock ?? 0) ?? (item.product.inStock ? 999 : 0);
                              if (item.quantity + 1 > availableStock) {
                                showToast(`Stokta sadece ${availableStock} adet bulunmaktadır`, 'error');
                                return;
                              }
                              updateQuantity(item.product.id, item.quantity + 1);
                            } catch (error: any) {
                              showToast(error.message || 'Bir hata oluştu', 'error');
                            }
                          }}
                          className="w-8 h-8 sm:w-9 sm:h-9 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={!item.product.inStock || ((item.product.stock ?? 0) !== null && item.quantity >= (item.product.stock ?? 0))}
                        >
                          <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <div className="flex items-start">
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}

              <button
                onClick={clearCart}
                className="text-red-600 hover:text-red-700 font-medium"
              >
                Sepeti Temizle
              </button>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg sm:rounded-xl shadow-md p-4 sm:p-6 sticky top-20 sm:top-24">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Sipariş Özeti</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-700">
                    <span>Ara Toplam</span>
                    <span>{totalPrice.toLocaleString('tr-TR')} ₺</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Kargo</span>
                    <span className={totalPrice >= 500 ? 'text-green-600' : ''}>
                      {totalPrice >= 500 ? 'Ücretsiz' : '50 ₺'}
                    </span>
                  </div>
                  <div className="border-t pt-4 flex justify-between text-lg font-bold text-gray-900">
                    <span>Toplam</span>
                    <span>{(totalPrice + (totalPrice >= 500 ? 0 : 50)).toLocaleString('tr-TR')} ₺</span>
                  </div>
                </div>

                {totalPrice < 500 && (
                  <p className="text-sm text-orange-600 mb-4">
                    Ücretsiz kargo için {Math.ceil(500 - totalPrice)} ₺ daha alışveriş yapın!
                  </p>
                )}

                <Link
                  href="/odeme"
                  className="block w-full text-center py-2.5 sm:py-3 bg-orange-600 text-white font-semibold text-sm sm:text-base rounded-lg hover:bg-orange-700 transition-colors mb-3 sm:mb-4"
                >
                  Ödemeye Geç
                </Link>
                
                <Link
                  href="/urunler"
                  className="block w-full text-center py-2.5 sm:py-3 border border-gray-300 text-gray-700 font-semibold text-sm sm:text-base rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Alışverişe Devam Et
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

