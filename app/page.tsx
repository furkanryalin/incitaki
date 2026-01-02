'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import CategoryCardHome from '@/components/CategoryCardHome';
import ProductCardSkeleton from '@/components/Skeleton/ProductCardSkeleton';
import CategoryCardSkeleton from '@/components/Skeleton/CategoryCardSkeleton';
import { useState, useEffect } from 'react';
import { Product, Category } from '@/types';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, Shield, Truck, HeadphonesIcon, Star, TrendingUp, Gift, CheckCircle2, Mail, Percent } from 'lucide-react';
import NewsletterSection from '@/components/NewsletterSection';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [categories, setCategories] = useState<{ name: string; slug: string; image?: string }[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    
    // Load products and categories in parallel
    Promise.all([
      fetch('/api/products', { signal: controller.signal })
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
        .then(data => (data.products || []).slice(0, 8))
        .catch(err => {
          if (err.name !== 'AbortError') {
            console.error('Error loading products:', err);
          }
          return [];
        }),
      fetch('/api/admin/categories', { signal: controller.signal })
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
          // API response format: { success: true, data: { categories: [...] } }
          const categories = data.success && data.data?.categories ? data.data.categories : data.categories || [];
          if (categories.length > 0) {
            return categories.map((cat: Category) => ({
              name: cat.name,
              slug: cat.slug,
              image: cat.image,
            }));
          }
          return [];
        })
        .catch(err => {
          if (err.name !== 'AbortError') {
            console.error('Error loading categories:', err);
          }
          return [];
        }),
    ]).then(([products, categories]) => {
      setFeaturedProducts(products);
      setCategories(categories);
      setLoading(false);
      setCategoriesLoading(false);
    });

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section - Modern & Dynamic */}
        <section className="relative bg-gradient-to-br from-orange-50 via-white to-orange-50/30 py-16 sm:py-20 md:py-28 lg:py-36 overflow-hidden">
          {/* Animated Background Pattern */}
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 50m-20 0a20 20 0 1 1 40 0a20 20 0 1 1 -40 0' fill='%23ea580c'/%3E%3C/svg%3E")`,
              backgroundSize: '60px 60px',
              animation: 'float 20s ease-in-out infinite'
            }}
          ></div>
          
          {/* Gradient Orbs */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-300/20 rounded-full blur-3xl translate-y-1/2"></div>

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Text Content */}
              <div className="text-center lg:text-left space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100/80 backdrop-blur-sm rounded-full text-orange-700 font-semibold text-sm mb-4 border border-orange-200/50">
                  <Sparkles className="w-4 h-4" />
                  <span>Premium Kalite Ürünler</span>
                </div>
                
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-tight">
                  Hayatınıza Değer
                  <span className="block mt-2 bg-gradient-to-r from-orange-600 via-orange-500 to-orange-700 bg-clip-text text-transparent animate-gradient">
                    Katan Ürünler
                  </span>
                </h1>
                
                <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  Geniş ürün yelpazemizle ihtiyacınız olan her şeyi bulun. Kaliteli ve güvenilir ürünlerle yanınızdayız.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                  <Link
                    href="/urunler"
                    className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-orange-600 to-orange-700 text-white font-bold text-lg rounded-2xl hover:from-orange-700 hover:to-orange-800 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 transform"
                  >
                    Ürünleri Keşfet
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/kategoriler"
                    className="inline-flex items-center justify-center px-8 py-4 bg-white text-orange-600 font-bold text-lg rounded-2xl border-2 border-orange-600 hover:bg-orange-50 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Kategoriler
                  </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200/50">
                  <div className="text-center lg:text-left">
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900">1000+</div>
                    <div className="text-sm text-gray-600">Mutlu Müşteri</div>
                  </div>
                  <div className="text-center lg:text-left">
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900">500+</div>
                    <div className="text-sm text-gray-600">Ürün Çeşidi</div>
                  </div>
                  <div className="text-center lg:text-left">
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900">4.9</div>
                    <div className="text-sm text-gray-600 flex items-center justify-center lg:justify-start gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      Müşteri Puanı
                    </div>
                  </div>
                </div>
              </div>

              {/* Image Gallery - Modern Grid */}
              <div className="hidden lg:grid grid-cols-2 gap-4 h-full">
                <div className="space-y-4">
                  <div className="relative h-72 rounded-3xl overflow-hidden shadow-2xl group hover:shadow-3xl transition-all duration-500 border-4 border-white/50">
                    <Image 
                      src="/boynunagunesvurankadinveboynundakolye.jpg" 
                      alt="Takılar"
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      sizes="(max-width: 1024px) 50vw, 25vw"
                      loading="eager"
                      quality={90}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end p-6">
                      <div className="transform group-hover:translate-y-0 translate-y-2 transition-transform duration-300">
                        <span className="text-white font-bold text-xl drop-shadow-2xl">Takılar</span>
                        <p className="text-white/80 text-sm mt-1">Premium Koleksiyon</p>
                      </div>
                    </div>
                  </div>
                  <div className="relative h-56 rounded-3xl overflow-hidden shadow-2xl group hover:shadow-3xl transition-all duration-500 border-4 border-white/50">
                    <Image 
                      src="/tesbihkirmiziturkbayrakli.jpg" 
                      alt="Tesbihler"
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      sizes="(max-width: 1024px) 50vw, 25vw"
                      loading="eager"
                      quality={90}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end p-6">
                      <div className="transform group-hover:translate-y-0 translate-y-2 transition-transform duration-300">
                        <span className="text-white font-bold text-xl drop-shadow-2xl">Tesbihler</span>
                        <p className="text-white/80 text-sm mt-1">Geleneksel Tasarım</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="relative h-56 rounded-3xl overflow-hidden shadow-2xl group hover:shadow-3xl transition-all duration-500 border-4 border-white/50">
                    <Image 
                      src="/eliniyukariyadogrututanvebilekligiolangorsel.jpg" 
                      alt="Bilezikler"
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      sizes="(max-width: 1024px) 50vw, 25vw"
                      loading="eager"
                      quality={90}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end p-6">
                      <div className="transform group-hover:translate-y-0 translate-y-2 transition-transform duration-300">
                        <span className="text-white font-bold text-xl drop-shadow-2xl">Bilezikler</span>
                        <p className="text-white/80 text-sm mt-1">Şık Tasarımlar</p>
                      </div>
                    </div>
                  </div>
                  <div className="relative h-72 rounded-3xl overflow-hidden shadow-2xl group hover:shadow-3xl transition-all duration-500 border-4 border-white/50">
                    <Image 
                      src="/oyuncaklaricinoyuncakkutusununustundeoturanoyuncak.jpg" 
                      alt="Oyuncaklar"
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      sizes="(max-width: 1024px) 50vw, 25vw"
                      loading="eager"
                      quality={90}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end p-6">
                      <div className="transform group-hover:translate-y-0 translate-y-2 transition-transform duration-300">
                        <span className="text-white font-bold text-xl drop-shadow-2xl">Oyuncaklar</span>
                        <p className="text-white/80 text-sm mt-1">Eğlenceli Ürünler</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Special Offer Banner */}
        <section className="py-8 bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '40px 40px'
            }}></div>
                </div>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                  <Percent className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold">Özel İndirim Fırsatı!</h3>
                  <p className="text-orange-100 text-sm sm:text-base">500₺ ve üzeri alışverişlerde %15 indirim + Ücretsiz Kargo</p>
                </div>
              </div>
              <Link
                href="/urunler"
                className="flex items-center gap-2 px-6 py-3 bg-white text-orange-600 font-bold rounded-xl hover:bg-orange-50 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Hemen Alışveriş Yap
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section - Enhanced */}
        <section className="py-16 sm:py-20 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              <div className="group text-center p-6 rounded-2xl bg-gradient-to-br from-white to-orange-50/30 border border-orange-100 hover:border-orange-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-2">Garantili Ürünler</h3>
                <p className="text-xs sm:text-sm text-gray-600">Tüm ürünlerimiz sertifikalı ve garantilidir</p>
                  </div>
              <div className="group text-center p-6 rounded-2xl bg-gradient-to-br from-white to-orange-50/30 border border-orange-100 hover:border-orange-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Truck className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-2">Ücretsiz Kargo</h3>
                <p className="text-xs sm:text-sm text-gray-600">500₺ ve üzeri alışverişlerde ücretsiz kargo</p>
                  </div>
              <div className="group text-center p-6 rounded-2xl bg-gradient-to-br from-white to-orange-50/30 border border-orange-100 hover:border-orange-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <HeadphonesIcon className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-2">7/24 Destek</h3>
                <p className="text-xs sm:text-sm text-gray-600">Müşteri hizmetlerimiz her zaman yanınızda</p>
                  </div>
              <div className="group text-center p-6 rounded-2xl bg-gradient-to-br from-white to-orange-50/30 border border-orange-100 hover:border-orange-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-2">Özel Tasarım</h3>
                <p className="text-xs sm:text-sm text-gray-600">İstediğiniz tasarımda özel üretim</p>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section - Enhanced */}
        <section className="py-16 sm:py-20 bg-gradient-to-b from-white via-gray-50/30 to-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 md:mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-full text-orange-700 font-semibold text-sm mb-4">
                <TrendingUp className="w-4 h-4" />
                <span>Popüler Kategoriler</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Kategorilerimiz
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
                Geniş ürün yelpazemizden size en uygun olanı bulun
              </p>
            </div>
            {categoriesLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                {[...Array(5)].map((_, i) => (
                  <CategoryCardSkeleton key={i} />
                ))}
              </div>
            ) : categories.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                {categories.map((category) => (
                  <CategoryCardHome key={category.slug} name={category.name} slug={category.slug} image={category.image} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
                  <span className="text-4xl">📁</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Henüz kategori bulunmamaktadır</h3>
                <p className="text-gray-600">Yakında kategoriler eklenecektir.</p>
              </div>
            )}
          </div>
        </section>

        {/* Featured Products Section - Enhanced */}
        <section className="py-16 sm:py-20 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-12 md:mb-16 gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-full text-orange-700 font-semibold text-sm mb-4">
                  <Gift className="w-4 h-4" />
                  <span>Öne Çıkanlar</span>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  Öne Çıkan Ürünler
                </h2>
                <p className="text-lg sm:text-xl text-gray-600">En popüler ve özel tasarımlarımız</p>
              </div>
              <Link
                href="/urunler"
                className="group flex items-center justify-center sm:justify-start gap-2 px-6 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Tümünü Gör
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : featuredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-orange-100 rounded-full mb-6">
                  <span className="text-5xl">📦</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Henüz ürün bulunmamaktadır</h3>
                <p className="text-gray-600 mb-8 text-lg">Yakında yeni ürünler eklenecektir.</p>
                <Link
                  href="/kategoriler"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Kategorilere Göz At
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Trust Indicators Section */}
        <section className="py-16 sm:py-20 bg-gradient-to-br from-gray-50 to-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Neden Bizi Seçmelisiniz?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Müşteri memnuniyeti bizim önceliğimiz
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">%100 Güvenli Alışveriş</h3>
                <p className="text-gray-600">SSL sertifikası ile korumalı ödeme sistemi</p>
              </div>
              <div className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
                  <Star className="w-8 h-8 text-blue-600 fill-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">4.9/5 Müşteri Puanı</h3>
                <p className="text-gray-600">Binlerce mutlu müşterimizden aldığımız yüksek puan</p>
              </div>
              <div className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-6">
                  <Truck className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Hızlı Teslimat</h3>
                <p className="text-gray-600">Siparişleriniz 1-3 iş günü içinde kapınızda</p>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <NewsletterSection />
      </main>

      <Footer />
    </div>
  );
}
