'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import ProductCardSkeleton from '@/components/Skeleton/ProductCardSkeleton';
import Breadcrumb from '@/components/Breadcrumb';
import { Filter, X, ArrowUpDown } from 'lucide-react';
import { Product, Category, SubCategory } from '@/types';

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' | 'rating-desc';

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('default');

  // Load categories and subcategories
  useEffect(() => {
    fetch('/api/admin/categories')
      .then(res => res.json())
      .then(data => {
        // API response format: { success: true, data: { categories: [...] } }
        const categories = data.success && data.data?.categories ? data.data.categories : data.categories || [];
        if (categories.length > 0) {
          setCategories(categories);
          // Tüm alt kategorileri topla
          const allSubCategories: SubCategory[] = [];
          categories.forEach((cat: Category) => {
            if (cat.subCategories) {
              allSubCategories.push(...cat.subCategories);
            }
          });
          setSubCategories(allSubCategories);
        }
      })
      .catch(err => console.error('Error loading categories:', err));
  }, []);

  // Load products from API
  useEffect(() => {
    setLoading(true);
    const category = selectedCategory !== 'all' ? selectedCategory : null;
    const subCategory = selectedSubCategory !== 'all' ? selectedSubCategory : null;
    const search = searchQuery || null;
    
    let url = '/api/products?';
    if (category) {
      // Kategori ID veya slug bul
      const foundCategory = categories.find(cat => cat.slug === category || cat.id === category);
      if (foundCategory?.id) {
        url += `categoryId=${foundCategory.id}&`;
      } else {
        url += `category=${category}&`;
      }
    }
    if (subCategory && subCategory !== 'all') {
      url += `subCategoryId=${subCategory}&`;
    }
    if (search) url += `search=${encodeURIComponent(search)}&`;
    
    fetch(url)
      .then(res => res.json())
      .then(data => {
        const loadedProducts = data.products || [];
        setProducts(loadedProducts);
        // Maksimum fiyatı ürünlerden hesapla
        if (loadedProducts.length > 0) {
          const max = Math.max(...loadedProducts.map((p: Product) => p.price));
          setMaxPrice(Math.ceil(max / 100) * 100); // 100'ün katına yuvarla
          if (priceRange[1] > max) {
            setPriceRange([priceRange[0], Math.ceil(max / 100) * 100]);
          }
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading products:', err);
        setLoading(false);
      });
  }, [selectedCategory, selectedSubCategory, searchQuery, categories]);

  // Kategori değiştiğinde alt kategoriyi sıfırla
  useEffect(() => {
    setSelectedSubCategory('all');
  }, [selectedCategory]);

  // Filter products by price range (search and category already filtered by API)
  let filteredProducts = products.filter((product) => {
    const priceMatch = product.price >= priceRange[0] && product.price <= priceRange[1];
    return priceMatch;
  });

  // Sort products
  if (sortBy === 'price-asc') {
    filteredProducts = [...filteredProducts].sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-desc') {
    filteredProducts = [...filteredProducts].sort((a, b) => b.price - a.price);
  } else if (sortBy === 'name-asc') {
    filteredProducts = [...filteredProducts].sort((a, b) => a.name.localeCompare(b.name, 'tr'));
  } else if (sortBy === 'name-desc') {
    filteredProducts = [...filteredProducts].sort((a, b) => b.name.localeCompare(a.name, 'tr'));
  } else if (sortBy === 'rating-desc') {
    filteredProducts = [...filteredProducts].sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-4 sm:py-6 md:py-8">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-8">
          <Breadcrumb
            items={[
              { label: 'Ürünler', href: '/urunler' },
              ...(searchQuery ? [{ label: `Arama: ${searchQuery}` }] : []),
            ]}
          />
          
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                  {searchQuery ? `"${searchQuery}" için sonuçlar` : 'Tüm Ürünler'}
                </h1>
                <p className="text-sm sm:text-base text-gray-600">{filteredProducts.length} ürün bulundu</p>
              </div>
              
              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none bg-white text-sm sm:text-base"
                >
                  <option value="default">Varsayılan</option>
                  <option value="price-asc">Fiyat: Düşükten Yükseğe</option>
                  <option value="price-desc">Fiyat: Yüksekten Düşüğe</option>
                  <option value="name-asc">İsim: A-Z</option>
                  <option value="name-desc">İsim: Z-A</option>
                  <option value="rating-desc">En Yüksek Puan</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
            {/* Filters Sidebar */}
            <aside className={`lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 sticky top-20 sm:top-24">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Filtreler</h2>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="lg:hidden text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Category Filter */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Kategori</h3>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        value="all"
                        checked={selectedCategory === 'all'}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Tümü</span>
                    </label>
                    {categories.map((category) => (
                      <label key={category.id} className="flex items-center">
                        <input
                          type="radio"
                          name="category"
                          value={category.slug}
                          checked={selectedCategory === category.slug}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">{category.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* SubCategory Filter */}
                {selectedCategory !== 'all' && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Alt Kategori</h3>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="subCategory"
                          value="all"
                          checked={selectedSubCategory === 'all'}
                          onChange={(e) => setSelectedSubCategory(e.target.value)}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">Tümü</span>
                      </label>
                      {subCategories
                        .filter(subCat => {
                          const parentCategory = categories.find(cat => cat.id === subCat.categoryId);
                          return parentCategory?.slug === selectedCategory;
                        })
                        .map((subCategory) => (
                          <label key={subCategory.id} className="flex items-center">
                            <input
                              type="radio"
                              name="subCategory"
                              value={subCategory.id}
                              checked={selectedSubCategory === subCategory.id}
                              onChange={(e) => setSelectedSubCategory(e.target.value)}
                              className="mr-2"
                            />
                            <span className="text-sm text-gray-700">{subCategory.name}</span>
                          </label>
                        ))}
                    </div>
                  </div>
                )}

                {/* Price Filter */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Fiyat Aralığı</h3>
                  <div className="space-y-4">
                    {/* Minimum Fiyat */}
                    <div>
                      <label className="block text-xs text-gray-600 mb-2">Minimum Fiyat</label>
                      <input
                        type="range"
                        min="0"
                        max={maxPrice}
                        step="50"
                        value={priceRange[0]}
                        onChange={(e) => {
                          const min = parseInt(e.target.value);
                          if (min <= priceRange[1]) {
                            setPriceRange([min, priceRange[1]]);
                          }
                        }}
                        className="w-full"
                      />
                      <div className="mt-1 text-sm text-gray-700 font-medium">
                        {priceRange[0].toLocaleString('tr-TR')} ₺
                      </div>
                    </div>
                    
                    {/* Maksimum Fiyat */}
                    <div>
                      <label className="block text-xs text-gray-600 mb-2">Maksimum Fiyat</label>
                      <input
                        type="range"
                        min="0"
                        max={maxPrice}
                        step="50"
                        value={priceRange[1]}
                        onChange={(e) => {
                          const max = parseInt(e.target.value);
                          if (max >= priceRange[0]) {
                            setPriceRange([priceRange[0], max]);
                          }
                        }}
                        className="w-full"
                      />
                      <div className="mt-1 text-sm text-gray-700 font-medium">
                        {priceRange[1].toLocaleString('tr-TR')} ₺
                      </div>
                    </div>
                    
                    {/* Fiyat Aralığı Özeti */}
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Aralık:</span>
                        <span className="text-sm font-semibold text-orange-600">
                          {priceRange[0].toLocaleString('tr-TR')} ₺ - {priceRange[1].toLocaleString('tr-TR')} ₺
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setPriceRange([0, maxPrice]);
                        }}
                        className="mt-2 text-xs text-orange-600 hover:text-orange-700 underline"
                      >
                        Sıfırla
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* Products Grid */}
            <div className="flex-1">
              {/* Mobile Filter Button */}
              <button
                onClick={() => setShowFilters(true)}
                className="lg:hidden mb-4 flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors text-sm sm:text-base"
              >
                <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
                Filtrele
              </button>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {[...Array(6)].map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-6">
                    <span className="text-4xl">🔍</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Ürün bulunamadı</h2>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    {searchQuery
                      ? `"${searchQuery}" için arama kriterlerinize uygun ürün bulunamadı. Filtreleri değiştirmeyi deneyin.`
                      : 'Bu kriterlere uygun ürün bulunamadı. Filtreleri değiştirmeyi deneyin.'}
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setSelectedSubCategory('all');
                      setPriceRange([0, maxPrice]);
                    }}
                    className="inline-flex items-center px-6 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    Filtreleri Temizle
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

