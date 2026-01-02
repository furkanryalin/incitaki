'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import ProductCardSkeleton from '@/components/Skeleton/ProductCardSkeleton';
import Breadcrumb from '@/components/Breadcrumb';
import { useRecentProducts } from '@/hooks/useRecentProducts';
import { Trash2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function RecentProductsPage() {
  const { recentProducts, clearRecentProducts } = useRecentProducts();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Kısa bir delay ile loading state'i göster (smooth transition için)
    const timer = setTimeout(() => setLoading(false), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-4 sm:py-6 md:py-8">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-8">
          <Breadcrumb
            items={[
              { label: 'Ana Sayfa', href: '/' },
              { label: 'Son Baktıklarım' },
            ]}
          />

          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Son Baktıklarım
              </h1>
              <p className="text-gray-600">
                {recentProducts.length > 0 
                  ? `${recentProducts.length} ürün` 
                  : 'Henüz bakılan ürün yok'}
              </p>
            </div>
            {recentProducts.length > 0 && (
              <button
                onClick={clearRecentProducts}
                className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
              >
                <Trash2 className="w-4 h-4" />
                Temizle
              </button>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(4)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : recentProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                {recentProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <div className="sm:hidden flex justify-center">
                <button
                  onClick={clearRecentProducts}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                >
                  <Trash2 className="w-4 h-4" />
                  Tümünü Temizle
                </button>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-12 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
                <span className="text-4xl">👀</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Henüz baktığınız ürün yok
              </h2>
              <p className="text-gray-600 mb-6">
                Ürünlere göz atmaya başlayın, sonra buradan kolayca bulabilirsiniz.
              </p>
              <Link
                href="/urunler"
                className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors"
              >
                Ürünleri Keşfet
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

