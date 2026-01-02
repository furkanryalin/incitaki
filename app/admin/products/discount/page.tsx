'use client';

import { useAdmin } from '@/context/AdminContext';
import { useState, useEffect } from 'react';
import { ArrowLeft, Percent } from 'lucide-react';
import Link from 'next/link';
import { Product } from '@/types';

export default function BulkDiscountPage() {
  const { products: adminProducts, bulkDiscount } = useAdmin();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [discountPercent, setDiscountPercent] = useState(10);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    setProducts(adminProducts);
  }, [adminProducts]);

  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p.id));
    }
  };

  const handleToggleProduct = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleApplyDiscount = () => {
    if (selectedProducts.length === 0) {
      alert('Lütfen en az bir ürün seçin');
      return;
    }

    if (confirm(`${selectedProducts.length} ürüne %${discountPercent} indirim uygulamak istediğinize emin misiniz?`)) {
      setIsApplying(true);
      bulkDiscount(selectedProducts, discountPercent);
      setTimeout(() => {
        setIsApplying(false);
        alert('İndirim başarıyla uygulandı!');
        setSelectedProducts([]);
      }, 500);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/products"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Toplu İndirim</h1>
          <p className="text-gray-600 mt-1">Birden fazla ürüne toplu indirim uygulayın</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            İndirim Yüzdesi (%)
          </label>
          <div className="flex items-center gap-4">
            <input
              type="number"
              min="1"
              max="99"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(parseInt(e.target.value) || 0)}
              className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
            <span className="text-gray-600">%{discountPercent} indirim uygulanacak</span>
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">
              {selectedProducts.length} ürün seçildi
            </p>
          </div>
          <button
            onClick={handleSelectAll}
            className="text-sm text-orange-600 hover:text-orange-700 font-medium"
          >
            {selectedProducts.length === products.length ? 'Tümünü Kaldır' : 'Tümünü Seç'}
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === products.length && products.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Ürün</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Mevcut Fiyat</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">İndirimli Fiyat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((product) => {
                const isSelected = selectedProducts.includes(product.id);
                const discountedPrice = Math.round(product.price * (1 - discountPercent / 100));
                return (
                  <tr
                    key={product.id}
                    className={`hover:bg-gray-50 ${isSelected ? 'bg-orange-50' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleProduct(product.id)}
                        className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{product.name}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-900 font-semibold">
                        {product.price.toLocaleString('tr-TR')} ₺
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-orange-600 font-semibold">
                        {discountedPrice.toLocaleString('tr-TR')} ₺
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex gap-4">
          <button
            onClick={handleApplyDiscount}
            disabled={isApplying || selectedProducts.length === 0}
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
          >
            <Percent className="w-5 h-5" />
            {isApplying ? 'Uygulanıyor...' : 'İndirimi Uygula'}
          </button>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            İptal
          </Link>
        </div>
      </div>
    </div>
  );
}

