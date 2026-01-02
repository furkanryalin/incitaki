'use client';

import { useAdmin } from '@/context/AdminContext';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Upload, X } from 'lucide-react';
import Link from 'next/link';
import { Product } from '@/types';

export default function EditProductPage() {
  const { products: adminProducts, updateProduct, categories } = useAdmin();
  const params = useParams();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const DRAFT_KEY = `admin_edit_product_draft_${params.id}`;

  useEffect(() => {
    setProducts(adminProducts);
  }, [adminProducts]);

  useEffect(() => {
    const foundProduct = products.find(p => p.id === params.id);
    if (foundProduct) {
      setProduct(foundProduct);
      
      // Stok mantığı: stock ve inStock tutarlı olmalı
      const stockValue = foundProduct.stock ?? 0;
      const inStockValue = foundProduct.inStock ?? (stockValue > 0);
      
      const normalizedProduct = {
        ...foundProduct,
        stock: stockValue,
        inStock: inStockValue,
      };
      
      // Load draft if exists, otherwise use product data
      if (typeof window !== 'undefined' && isInitialLoad) {
        try {
          const savedDraft = localStorage.getItem(DRAFT_KEY);
          if (savedDraft) {
            const draft = JSON.parse(savedDraft);
            if (draft.formData) {
              // Draft'teki stok değerlerini de normalize et
              const draftStock = draft.formData.stock ?? 0;
              const draftInStock = draft.formData.inStock ?? (draftStock > 0);
              setFormData({
                ...draft.formData,
                stock: draftStock,
                inStock: draftInStock,
              });
              setUploadedImages(draft.uploadedImages || foundProduct.images || [foundProduct.image]);
              setIsInitialLoad(false);
              return;
            }
          }
        } catch (error) {
          console.error('Error loading draft:', error);
        }
      }
      
      setFormData(normalizedProduct);
      setUploadedImages(foundProduct.images || [foundProduct.image]);
      setIsInitialLoad(false);
    }
  }, [products, params.id, isInitialLoad]);

  // Save draft to localStorage whenever form data changes
  useEffect(() => {
    if (typeof window !== 'undefined' && !isInitialLoad && formData && Object.keys(formData).length > 0) {
      const timeoutId = setTimeout(() => {
        try {
          const draft = {
            formData,
            uploadedImages,
            timestamp: Date.now(),
          };
          localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
        } catch (error) {
          console.error('Error saving draft:', error);
        }
      }, 500); // 500ms debounce

      return () => clearTimeout(timeoutId);
    }
  }, [formData, uploadedImages, isInitialLoad]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const uploadPromises = Array.from(files).map(async (file) => {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData,
        });

        const data = await response.json();
        if (data.success) {
          return data.url;
        }
        return null;
      } catch (error) {
        console.error('Upload error:', error);
        return null;
      }
    });

    const uploadedUrls = (await Promise.all(uploadPromises)).filter(Boolean) as string[];
    if (uploadedUrls.length > 0) {
      const newImages = [...uploadedImages, ...uploadedUrls];
      setUploadedImages(newImages);
      setFormData(prev => ({ 
        ...prev, 
        image: newImages[0] || prev.image || product?.image,
        images: newImages
      }));
    }
    setIsUploading(false);
  };

  const removeImage = (index: number) => {
    if (!product) return;
    const newImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(newImages);
    setFormData(prev => ({ 
      ...prev, 
      image: newImages[0] || product.image,
      images: newImages
    }));
  };

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Ürün bulunamadı</p>
        <Link href="/admin/products" className="mt-4 inline-block text-orange-600">
          Ürünlere Dön
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Stok değerlerini normalize et
      const stockValue = formData.stock ?? 0;
      const inStockValue = formData.inStock ?? (stockValue > 0);
      
      // Sadece güncellenebilir alanları gönder
      const updatedData: any = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        originalPrice: formData.originalPrice,
        image: uploadedImages[0] || formData.image || product.image,
        images: uploadedImages.length > 0 ? uploadedImages : (formData.images || product.images || [product.image]),
        category: formData.category,
        categoryId: formData.categoryId,
        subCategoryId: formData.subCategoryId,
        stock: stockValue,
        inStock: inStockValue,
        // Rating ve reviews otomatik olarak yorumlardan hesaplanacak, manuel güncelleme yapılmamalı
      };
      
      // Undefined değerleri temizle
      Object.keys(updatedData).forEach(key => {
        if (updatedData[key] === undefined) {
          delete updatedData[key];
        }
      });

      await updateProduct(product.id, updatedData);
      
      // Clear draft after successful submission
      if (typeof window !== 'undefined') {
        localStorage.removeItem(DRAFT_KEY);
      }
      
      router.push('/admin/products');
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Ürün güncellenirken bir hata oluştu. Lütfen tekrar deneyin.');
      setIsSubmitting(false);
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
          <h1 className="text-3xl font-bold text-gray-900">Ürün Düzenle</h1>
          <p className="text-gray-600 mt-1">{product.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ürün Adı *
              </label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategori *
              </label>
              <select
                required
                value={formData.category || ''}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Açıklama *
            </label>
            <textarea
              required
              rows={4}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fiyat (₺) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.price || 0}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Orijinal Fiyat (₺)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.originalPrice || ''}
                onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ürün Görselleri (Birden fazla seçebilirsiniz)
              </label>
              <div className="space-y-3">
                {/* Dosya Yükleme */}
                <div className="flex items-center gap-4">
                  <label className="flex-1 cursor-pointer">
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/heic,image/HEIC"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={isUploading}
                      multiple
                    />
                    <div className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors">
                      <Upload className={`w-5 h-5 text-gray-400 ${isUploading ? 'animate-pulse' : ''}`} />
                      <span className="text-sm font-medium text-gray-700">
                        {isUploading ? 'Yükleniyor...' : 'Yeni Dosya Seç veya Sürükle (Çoklu)'}
                      </span>
                    </div>
                  </label>
                </div>

                {/* Yüklenen Görseller Önizleme */}
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {uploadedImages.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={img}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                        />
                        {index === 0 && (
                          <span className="absolute top-1 left-1 px-2 py-1 bg-orange-600 text-white text-xs rounded">
                            Ana Görsel
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Manuel URL Girişi */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Veya ana görsel URL girin
                  </label>
                  <input
                    type="text"
                    value={formData.image || ''}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="/products/image.jpg"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.inStock ?? true}
                  onChange={(e) => {
                    const newInStock = e.target.checked;
                    // Eğer inStock false yapılıyorsa, stock'u 0 yap
                    // Eğer inStock true yapılıyorsa ve stock 0 ise, stock'u 1 yap
                    const newStock = newInStock 
                      ? (formData.stock && formData.stock > 0 ? formData.stock : 1)
                      : 0;
                    setFormData({ 
                      ...formData, 
                      inStock: newInStock,
                      stock: newStock
                    });
                  }}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="text-sm font-medium text-gray-700">Stokta Var</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stok Miktarı
              </label>
              <input
                type="number"
                min="0"
                value={formData.stock ?? 0}
                onChange={(e) => {
                  const stockValue = parseInt(e.target.value) || 0;
                  // Stok mantığı: stock > 0 ise inStock = true, stock = 0 ise inStock = false
                  const newInStock = stockValue > 0;
                  setFormData({ 
                    ...formData, 
                    stock: stockValue,
                    inStock: newInStock
                  });
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

          </div>

          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {isSubmitting ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
            </button>
            <Link
              href="/admin/products"
              className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              İptal
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}

