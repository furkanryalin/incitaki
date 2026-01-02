'use client';

import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumb from '@/components/Breadcrumb';
import { products } from '@/data/products';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useToast } from '@/components/ToastContainer';
import { ShoppingCart, Star, Check, Truck, Shield, RotateCcw, ChevronLeft, ChevronRight, AlertCircle, MessageSquare, Send, Heart, Plus, Minus } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import ProductStructuredData from './structured-data';
import { useRecentProducts } from '@/hooks/useRecentProducts';
import ProductDetailSkeleton from '@/components/Skeleton/ProductDetailSkeleton';
import Image from 'next/image';
import ProductCardSmall from '@/components/ProductCardSmall';
import ProductCardSkeleton from '@/components/Skeleton/ProductCardSkeleton';

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params?.id as string;
  const [product, setProduct] = useState(products.find((p) => p.id === productId));
  const { addToCart, cartItems, updateQuantity, removeFromCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { showToast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const favorite = product ? isFavorite(product.id) : false;
  const cartItem = product ? cartItems.find(item => item.product.id === product.id) : undefined;
  const inCart = cartItem !== undefined;
  const cartQuantity = cartItem?.quantity || 0;
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: '',
    userName: '',
    userEmail: '',
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [productLoading, setProductLoading] = useState(true);
  const { addRecentProduct } = useRecentProducts();
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [loadingSimilar, setLoadingSimilar] = useState(true);

  // Load product from API
  useEffect(() => {
    if (!productId) return;
    
    setProductLoading(true);
    let cancelled = false;
    
    fetch(`/api/products/${productId}`)
      .then(async res => {
        if (cancelled) return null;
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Response is not JSON');
        }
        return res.json();
      })
      .then(data => {
        if (cancelled) return;
        if (data?.product) {
          setProduct(data.product);
          // Son bakılan ürünlere ekle
          addRecentProduct(data.product);
        }
        setProductLoading(false);
      })
      .catch(err => {
        if (cancelled) return;
        console.error('Error loading product:', err);
        setProductLoading(false);
      });
    
    return () => {
      cancelled = true;
    };
  }, [productId, addRecentProduct]);

  // Load reviews
  useEffect(() => {
    if (productId) {
      fetch(`/api/products/${productId}/reviews`)
        .then(async res => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          const contentType = res.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Response is not JSON');
          }
          return res.json();
        })
        .then(data => {
          setReviews(data.reviews || []);
          setLoadingReviews(false);
        })
        .catch(err => {
          console.error('Error loading reviews:', err);
          setLoadingReviews(false);
        });
    }
  }, [productId]);

  // Load similar products
  useEffect(() => {
    if (!productId) return;
    
    setLoadingSimilar(true);
    let cancelled = false;
    
    fetch(`/api/products/${productId}/similar`)
      .then(async res => {
        if (cancelled) return null;
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Response is not JSON');
        }
        return res.json();
      })
      .then(data => {
        if (cancelled) return;
        setSimilarProducts(data.products || []);
        setLoadingSimilar(false);
      })
      .catch(err => {
        if (cancelled) return;
        console.error('Error loading similar products:', err);
        setSimilarProducts([]);
        setLoadingSimilar(false);
      });
    
    return () => {
      cancelled = true;
    };
  }, [productId]);

  // Update review form when user changes
  useEffect(() => {
    if (user) {
      setReviewForm(prev => ({
        ...prev,
        userName: user.name || '',
        userEmail: user.email || '',
      }));
    }
  }, [user]);

  if (productLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow py-4 sm:py-6 md:py-8">
          <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-8">
            <ProductDetailSkeleton />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center py-12">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
              <span className="text-4xl">⚠️</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Ürün bulunamadı</h1>
            <p className="text-gray-600 mb-6">Aradığınız ürün mevcut değil veya kaldırılmış olabilir.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link 
                href="/urunler" 
                className="inline-flex items-center justify-center px-6 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors"
              >
                Tüm Ürünleri Gör
              </Link>
              <Link 
                href="/" 
                className="inline-flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
              >
                Ana Sayfaya Dön
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Tüm görselleri al - boş stringleri filtrele
  const allImages = product.images && product.images.length > 0 
    ? product.images.filter(img => img && img.trim() !== '')
    : (product.image && product.image.trim() !== '' ? [product.image] : []);
  
  // Stok kontrolü - sadece azaldığında göster
  const availableStock = product ? (product.stock ?? (product.inStock ? 999 : 0)) : 0;
  const isLowStock = availableStock > 0 && availableStock <= 3; // Son 3 ürün
  const isOutOfStock = availableStock === 0;
  const showStockWarning = isLowStock || isOutOfStock; // Sadece uyarı durumunda göster

  const handleAddToCart = () => {
    if (!product) {
      showToast('Ürün bulunamadı', 'error');
      return;
    }
    try {
      if (inCart) {
        // Eğer ürün zaten sepetteyse, miktarı artır
        const newQuantity = cartQuantity + quantity;
        const availableStock = product.stock ?? (product.inStock ? 999 : 0);
        if (newQuantity > availableStock) {
          showToast(`Stokta sadece ${availableStock} adet bulunmaktadır. Sepette zaten ${cartQuantity} adet var.`, 'error');
          return;
        }
        updateQuantity(product.id, newQuantity);
        showToast(`${product.name} sepete eklendi! (Toplam: ${newQuantity} adet)`, 'success');
      } else {
        addToCart(product, quantity);
        setAddedToCart(true);
        showToast(`${product.name} sepete eklendi!`, 'success');
        setTimeout(() => setAddedToCart(false), 2000);
      }
    } catch (error: any) {
      showToast(error.message || 'Sepete eklenirken bir hata oluştu', 'error');
    }
  };

  const nextImage = () => {
    if (allImages.length > 0) {
      setSelectedImageIndex((prev) => (prev + 1) % allImages.length);
    }
  };

  const prevImage = () => {
    if (allImages.length > 0) {
      setSelectedImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      showToast('Yorum yapmak için giriş yapmalısınız', 'error');
      return;
    }

    if (!reviewForm.comment.trim()) {
      showToast('Lütfen yorumunuzu yazın', 'error');
      return;
    }

    setSubmittingReview(true);
    try {
      const response = await fetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...reviewForm,
          userId: user?.id || null,
        }),
      });

      // Response body'yi güvenli şekilde oku
      let data: any = {};
      try {
        const text = await response.text();
        if (text) {
          try {
            data = JSON.parse(text);
          } catch (parseError) {
            console.error('Error parsing JSON response:', parseError);
            console.error('Response text:', text);
            showToast(`Yorum gönderilemedi: ${response.status} ${response.statusText}`, 'error');
            return;
          }
        }
      } catch (readError) {
        console.error('Error reading response:', readError);
        showToast(`Yorum gönderilemedi: ${response.status} ${response.statusText}`, 'error');
        return;
      }
      
      if (!response.ok) {
        // HTTP hata durumları
        const errorMessage = data?.error || data?.message || `Yorum gönderilemedi (${response.status})`;
        showToast(errorMessage, 'error');
        console.error('Review submission error:', {
          status: response.status,
          statusText: response.statusText,
          data: data
        });
        return;
      }
      
      if (data.success) {
        showToast(data.message || 'Yorumunuz gönderildi. Admin onayından sonra yayınlanacaktır.', 'success');
        setReviewForm({ rating: 5, comment: '', userName: user?.name || '', userEmail: user?.email || '' });
        // Reload reviews
        try {
          const reviewsRes = await fetch(`/api/products/${productId}/reviews`);
          if (reviewsRes.ok) {
            const reviewsData = await reviewsRes.json();
            setReviews(reviewsData.reviews || []);
          }
        } catch (err) {
          console.error('Error reloading reviews:', err);
        }
      } else {
        showToast(data.error || 'Yorum gönderilemedi', 'error');
      }
    } catch (error: any) {
      console.error('Error submitting review:', error);
      const errorMessage = error?.message || 'Yorum gönderilirken bir hata oluştu. Lütfen tekrar deneyin.';
      showToast(errorMessage, 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-4 sm:py-6 md:py-8">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-8">
          <Breadcrumb
            items={[
              { label: 'Ürünler', href: '/urunler' },
              { label: product.name },
            ]}
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
            {/* Product Image Gallery */}
            <div className="space-y-4">
              <div className="aspect-square bg-gradient-to-br from-orange-50 via-orange-100 to-orange-50 rounded-2xl overflow-hidden shadow-xl relative group">
                {allImages.length > 0 && allImages[selectedImageIndex] ? (
                  <Image
                    src={allImages[selectedImageIndex]}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority={selectedImageIndex === 0}
                    quality={90}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      if (target.nextElementSibling) {
                        (target.nextElementSibling as HTMLElement).style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 ${allImages.length > 0 && allImages[selectedImageIndex] ? 'hidden' : ''}`}>
                  <span className="text-9xl">💎</span>
                </div>
                
                {/* Navigation Buttons */}
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition-colors opacity-0 group-hover:opacity-100"
                      aria-label="Önceki görsel"
                    >
                      <ChevronLeft className="w-6 h-6 text-gray-800" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition-colors opacity-0 group-hover:opacity-100"
                      aria-label="Sonraki görsel"
                    >
                      <ChevronRight className="w-6 h-6 text-gray-800" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {allImages.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            index === selectedImageIndex ? 'bg-white w-6' : 'bg-white/50'
                          }`}
                          aria-label={`Görsel ${index + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
                
                {product.originalPrice && (
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-bold px-4 py-2 rounded-full shadow-xl">
                    %{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)} İndirim
                  </div>
                )}
              </div>
              
              {/* Thumbnail Gallery */}
              {allImages.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {allImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        index === selectedImageIndex 
                          ? 'border-orange-600 ring-2 ring-orange-200' 
                          : 'border-gray-200 hover:border-orange-300'
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`${product.name} ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 25vw, 12.5vw"
                        loading="lazy"
                        quality={75}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight break-words">{product.name}</h1>
              
              {/* Rating */}
              {product.rating && product.reviews && product.reviews > 0 ? (
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 ${
                          i < Math.floor(product.rating!) ? 'fill-orange-400 text-orange-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-base sm:text-lg font-semibold text-gray-700">{product.rating.toFixed(1)}</span>
                  <span className="text-base sm:text-lg text-gray-500">({product.reviews} değerlendirme)</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-300"
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">Henüz değerlendirilmemiş</span>
                </div>
              )}

              {/* Price */}
              <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl sm:rounded-2xl">
                <div className="flex items-baseline gap-2 sm:gap-4 mb-2">
                  <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-orange-600">
                    {product.price.toLocaleString('tr-TR')} ₺
                  </span>
                  {product.originalPrice && (
                    <span className="text-2xl text-gray-400 line-through">
                      {product.originalPrice.toLocaleString('tr-TR')} ₺
                    </span>
                  )}
                </div>
                {product.originalPrice && (
                  <span className="inline-block text-base text-red-600 font-bold bg-white px-3 py-1 rounded-full">
                    %{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)} indirim
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="mb-6 sm:mb-8">
                <h3 className="font-bold text-lg sm:text-xl text-gray-900 mb-2 sm:mb-3">Ürün Açıklaması</h3>
                <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed break-words whitespace-pre-wrap">{product.description}</p>
              </div>

              {/* Stock Warning - Sadece azaldığında göster */}
              {showStockWarning && (
                <>
                  {isOutOfStock && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-red-800">Stokta Yok</p>
                        <p className="text-sm text-red-600">Bu ürün şu anda stokta bulunmamaktadır.</p>
                      </div>
                    </div>
                  )}
                  {isLowStock && !isOutOfStock && (
                    <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-orange-800">Son {availableStock} Adet! ⚡</p>
                        <p className="text-sm text-orange-600">Stokta sadece {availableStock} adet kaldı. Kaçırmayın!</p>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Quantity Selector */}
              <div className="mb-6 sm:mb-8">
                <label className="block font-bold text-gray-900 mb-2 sm:mb-3 text-base sm:text-lg">
                  Adet
                </label>
                <div className="flex items-center gap-3 sm:gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-gray-300 rounded-lg sm:rounded-xl hover:bg-orange-50 hover:border-orange-600 transition-all font-bold text-base sm:text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    −
                  </button>
                  <span className="text-xl sm:text-2xl font-bold w-12 sm:w-16 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                    disabled={quantity >= availableStock}
                    className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-gray-300 rounded-lg sm:rounded-xl hover:bg-orange-50 hover:border-orange-600 transition-all font-bold text-base sm:text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Favorite and Add to Cart Buttons */}
              <div className="flex gap-3 sm:gap-4 mb-6 sm:mb-8">
                <button
                  onClick={() => {
                    if (product) {
                      toggleFavorite(product);
                      showToast(
                        favorite ? 'Favorilerden kaldırıldı' : 'Favorilere eklendi',
                        'success'
                      );
                    }
                  }}
                  className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] ${
                    favorite
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-red-500 hover:text-red-500'
                  }`}
                >
                  <Heart className={`w-5 h-5 sm:w-6 sm:h-6 ${favorite ? 'fill-current' : ''}`} />
                  <span className="hidden sm:inline">{favorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}</span>
                </button>
                
                {inCart ? (
                  <div className="flex-1 flex items-center gap-3 bg-orange-50 border-2 border-orange-600 rounded-xl p-3 sm:p-4">
                    <button
                      onClick={() => {
                        if (cartQuantity > 1) {
                          try {
                            updateQuantity(product.id, cartQuantity - 1);
                            showToast('Miktar azaltıldı', 'success');
                          } catch (error: any) {
                            showToast(error.message || 'Bir hata oluştu', 'error');
                          }
                        } else {
                          removeFromCart(product.id);
                          showToast('Ürün sepetten çıkarıldı', 'success');
                        }
                      }}
                      className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-white border border-orange-600 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={cartQuantity <= 1}
                    >
                      <Minus className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                    <div className="flex-1 text-center">
                      <div className="text-xs text-gray-600 mb-1">Sepette</div>
                      <div className="text-xl sm:text-2xl font-bold text-orange-600">{cartQuantity} adet</div>
                    </div>
                    <button
                      onClick={() => {
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
                      }}
                      className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-white border border-orange-600 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!product.inStock || (product.stock !== null && product.stock !== undefined && cartQuantity >= product.stock)}
                    >
                      <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                  </div>
                ) : isOutOfStock ? (
                  <div className="flex-1 flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg bg-gray-300 text-gray-600 cursor-not-allowed">
                    <span>Stokta Yok</span>
                  </div>
                ) : (
                  <button
                    onClick={handleAddToCart}
                    disabled={addedToCart}
                    className={`flex-1 flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg text-white transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${
                      addedToCart
                        ? 'bg-gradient-to-r from-green-600 to-green-700'
                        : 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800'
                    }`}
                  >
                    {addedToCart ? (
                      <>
                        <Check className="w-6 h-6" />
                        Sepete Eklendi!
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-6 h-6" />
                        Sepete Ekle
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Features */}
              <div className="border-t pt-6 space-y-4">
                <div className="flex items-start gap-3">
                  <Truck className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Ücretsiz Kargo</h4>
                    <p className="text-sm text-gray-600">500₺ ve üzeri alışverişlerde</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Garantili Ürün</h4>
                    <p className="text-sm text-gray-600">Sertifikalı ve garantili</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <RotateCcw className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Kolay İade</h4>
                    <p className="text-sm text-gray-600">14 gün içinde iade garantisi</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mt-12 border-t pt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-orange-600" />
                Müşteri Yorumları
              </h2>
              {reviews.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => {
                      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
                      return (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.floor(avgRating) ? 'fill-orange-400 text-orange-400' : 'text-gray-300'
                          }`}
                        />
                      );
                    })}
                  </div>
                  <span className="text-lg font-semibold text-gray-900">
                    {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)}
                  </span>
                  <span className="text-sm text-gray-500">({reviews.length} değerlendirme)</span>
                </div>
              )}
            </div>

            {/* Rating Distribution - Sadece yorumlar varsa göster */}
            {reviews.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Değerlendirme Dağılımı</h3>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = reviews.filter(r => r.rating === star).length;
                    const percentage = (count / reviews.length) * 100;
                    return (
                      <div key={star} className="flex items-center gap-3">
                        <div className="flex items-center gap-1 w-20">
                          <span className="text-sm text-gray-600">{star}</span>
                          <Star className="w-4 h-4 fill-orange-400 text-orange-400" />
                        </div>
                        <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-orange-500 h-full rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Review Form */}
            {isAuthenticated ? (
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Yorum Yap</h3>
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Puanınız
                    </label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= reviewForm.rating
                                ? 'fill-orange-400 text-orange-400'
                                : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Yorumunuz
                    </label>
                    <textarea
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Ürün hakkındaki düşüncelerinizi paylaşın..."
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="px-6 py-2 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {submittingReview ? 'Gönderiliyor...' : 'Yorumu Gönder'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-8">
                <p className="text-sm text-orange-800">
                  Yorum yapmak için{' '}
                  <Link href="/giris" className="font-semibold underline hover:text-orange-900">
                    giriş yapın
                  </Link>
                </p>
              </div>
            )}

            {/* Reviews List */}
            {loadingReviews ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
              </div>
            ) : reviews.length === 0 ? (
              <div className="bg-gradient-to-br from-orange-50 via-white to-orange-50 rounded-xl border-2 border-dashed border-orange-200 p-12 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-4">
                  <MessageSquare className="w-10 h-10 text-orange-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Henüz Değerlendirme Yok</h3>
                <p className="text-gray-600 mb-4 max-w-md mx-auto">
                  Bu ürün için henüz müşteri yorumu bulunmuyor. İlk değerlendirmeyi siz yaparak diğer müşterilere yardımcı olabilirsiniz!
                </p>
                {isAuthenticated ? (
                  <div className="flex items-center justify-center gap-2 text-orange-600">
                    <Star className="w-5 h-5 fill-orange-400 text-orange-400" />
                    <span className="font-semibold">İlk yorumu siz yapın!</span>
                  </div>
                ) : (
                  <Link
                    href="/giris"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    Giriş Yap ve Yorum Yap
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.map((review) => {
                  // Tarih formatı - "2 gün önce" gibi relative time
                  const reviewDate = new Date(review.createdAt);
                  const now = new Date();
                  const diffTime = Math.abs(now.getTime() - reviewDate.getTime());
                  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                  let dateText = '';
                  if (diffDays === 0) {
                    dateText = 'Bugün';
                  } else if (diffDays === 1) {
                    dateText = 'Dün';
                  } else if (diffDays < 7) {
                    dateText = `${diffDays} gün önce`;
                  } else if (diffDays < 30) {
                    const weeks = Math.floor(diffDays / 7);
                    dateText = `${weeks} hafta önce`;
                  } else {
                    dateText = reviewDate.toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    });
                  }

                  return (
                    <div key={review.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-4 mb-4">
                        {/* Kullanıcı Avatar */}
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                          <span className="text-white font-bold text-lg">
                            {review.userName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-semibold text-gray-900 text-lg">{review.userName}</p>
                              <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                <span>{dateText}</span>
                                {diffDays < 30 && (
                                  <span className="text-orange-600 font-medium">• Doğrulanmış Alıcı</span>
                                )}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-5 h-5 ${
                                    star <= review.rating
                                      ? 'fill-orange-400 text-orange-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          
                          <p className="text-gray-700 leading-relaxed mb-4">{review.comment}</p>
                          
                          {/* Mağaza Yanıtı */}
                          {review.reply && (
                            <div className="mt-4 pl-4 border-l-4 border-orange-400 bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">M</span>
                                </div>
                                <p className="text-sm font-semibold text-orange-900">Mağaza Yanıtı</p>
                              </div>
                              <p className="text-sm text-orange-800 leading-relaxed">{review.reply}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Benzer Ürünler */}
          {similarProducts.length > 0 && (
            <div className="mt-16 border-t border-gray-200 pt-8">
              <div className="mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                  Benzer Ürünler
                </h2>
                <p className="text-sm text-gray-600">
                  Bu ürüne benzer diğer seçeneklerimizi keşfedin
                </p>
              </div>

              {loadingSimilar ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-gray-100 rounded-lg aspect-square animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3">
                  {similarProducts.map((similarProduct) => (
                    <ProductCardSmall key={similarProduct.id} product={similarProduct} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

