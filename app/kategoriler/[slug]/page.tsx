'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import ProductCardSkeleton from '@/components/Skeleton/ProductCardSkeleton';
import Breadcrumb from '@/components/Breadcrumb';
import { Category, SubCategory, Product } from '@/types';

export default function CategoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  
  const [category, setCategory] = useState<Category | null>(null);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Kategori ve alt kategorileri yükle
    fetch('/api/admin/categories')
      .then(res => res.json())
      .then(data => {
        // API response format: { success: true, data: { categories: [...] } }
        const categories = data.success && data.data?.categories ? data.data.categories : data.categories || [];
        const foundCategory = categories.find((cat: Category) => cat.slug === slug);
        if (foundCategory) {
          setCategory(foundCategory);
          setSubCategories(foundCategory.subCategories || []);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading category:', err);
        setLoading(false);
      });
  }, [slug]);

  useEffect(() => {
    // URL'den subCategory parametresini kontrol et
    const subCategoryFromUrl = searchParams.get('subCategory');
    if (subCategoryFromUrl) {
      setSelectedSubCategory(subCategoryFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    // Ürünleri yükle
    setLoading(true);
    let url = '/api/products?';
    if (category?.id) {
      url += `categoryId=${category.id}&`;
    } else {
      url += `category=${slug}&`;
    }
    if (selectedSubCategory) {
      url += `subCategoryId=${selectedSubCategory}&`;
    }

    fetch(url)
      .then(res => res.json())
      .then(data => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading products:', err);
        setLoading(false);
      });
  }, [category, selectedSubCategory, slug]);

  if (loading && !category) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[...Array(6)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center py-16 max-w-md mx-auto">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
                <span className="text-4xl">📁</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Kategori bulunamadı</h1>
              <p className="text-gray-600 mb-6">Aradığınız kategori mevcut değil veya kaldırılmış olabilir.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link 
                  href="/kategoriler" 
                  className="inline-flex items-center justify-center px-6 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Tüm Kategorileri Gör
                </Link>
                <Link 
                  href="/" 
                  className="inline-flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Ana Sayfaya Dön
                </Link>
              </div>
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
      
      <main className="flex-grow py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[
              { label: 'Kategoriler', href: '/kategoriler' },
              { label: category.name },
            ]}
          />

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{category.name}</h1>
            <p className="text-gray-600">{products.length} ürün bulundu</p>
          </div>

          {/* Alt Kategoriler */}
          {subCategories.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Alt Kategoriler</h2>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setSelectedSubCategory(null)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedSubCategory === null
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Tümü
                </button>
                {subCategories.map((subCat) => (
                  <button
                    key={subCat.id}
                    onClick={() => setSelectedSubCategory(subCat.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedSubCategory === subCat.id
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {subCat.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-6">
                <span className="text-4xl">🔍</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {selectedSubCategory
                  ? 'Bu alt kategoride henüz ürün bulunmamaktadır'
                  : 'Bu kategoride henüz ürün bulunmamaktadır'}
              </h3>
              <p className="text-gray-600 mb-6">
                {selectedSubCategory
                  ? 'Yakında bu alt kategoriye yeni ürünler eklenecektir.'
                  : 'Yakında bu kategoriye yeni ürünler eklenecektir.'}
              </p>
              <Link
                href="/urunler"
                className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors"
              >
                Tüm Ürünleri Gör
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

