'use client';

import { useAdmin } from '@/context/AdminContext';
import { Package, Edit, Trash2, Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Product } from '@/types';

export default function AdminProductsPage() {
  const { products: adminProducts, categories, updateProduct, deleteProduct } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    // Admin context'ten ürünleri kullan
    setProducts(adminProducts || []);
  }, [adminProducts]);

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || product.category === selectedCategory || product.categoryRelation?.slug === selectedCategory || product.categoryData?.slug === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryName = (slug: string) => {
    if (!categories || !Array.isArray(categories)) return slug;
    return categories.find((cat) => cat.slug === slug)?.name || slug;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ürünler</h1>
          <p className="text-gray-600 mt-2">Tüm ürünleri görüntüleyin ve yönetin</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Yeni Ürün Ekle
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Ürün ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="all">Tüm Kategoriler</option>
            {categories && Array.isArray(categories) && categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100">
        <div className="p-6">
          <div className="mb-4 text-sm text-gray-600">
            {filteredProducts.length} ürün bulundu
          </div>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Ürün bulunamadı</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Ürün
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Kategori
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Fiyat
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Stok
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Rating
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          {product.image && product.image.trim() !== '' ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded-lg"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                if (target.nextElementSibling) {
                                  (target.nextElementSibling as HTMLElement).style.display = 'flex';
                                }
                              }}
                            />
                          ) : null}
                          <div className={`w-12 h-12 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg flex items-center justify-center ${product.image && product.image.trim() !== '' ? 'hidden' : ''}`}>
                            <span className="text-lg">💎</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-gray-900 truncate break-words">{product.name}</div>
                            <div className="text-sm text-gray-500 line-clamp-1 break-words">
                              {product.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          {getCategoryName(product.category)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-900">
                            {product.price.toLocaleString('tr-TR')} ₺
                          </span>
                          {product.originalPrice && (
                            <span className="text-xs text-gray-400 line-through">
                              {product.originalPrice.toLocaleString('tr-TR')} ₺
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                            product.inStock
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {product.inStock ? 'Stokta' : 'Tükendi'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {product.rating ? (
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-gray-900">
                              {product.rating}
                            </span>
                            <span className="text-gray-500 text-sm">
                              ({product.reviews})
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/products/edit/${product.id}`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Düzenle"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={async () => {
                              if (confirm(`${product.name} ürününü silmek istediğinize emin misiniz?`)) {
                                try {
                                  await deleteProduct(product.id);
                                  // State zaten deleteProduct içinde güncelleniyor
                                  setProducts(prev => prev.filter(p => p.id !== product.id));
                                } catch (error: any) {
                                  alert(error.message || 'Ürün silinirken bir hata oluştu');
                                }
                              }
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

