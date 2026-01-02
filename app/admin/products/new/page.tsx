'use client';

import { useAdmin } from '@/context/AdminContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Upload, X, Plus, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { Product, Category, SubCategory } from '@/types';

export default function NewProductPage() {
  const { addProduct, categories: adminCategories } = useAdmin();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>(adminCategories || []);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string>('');
  const [availableSubCategories, setAvailableSubCategories] = useState<SubCategory[]>([]);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    originalPrice: undefined,
    image: '',
    category: '',
    categoryId: '',
    subCategoryId: '',
    inStock: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>(['']); // Birden fazla URL için
  const [showUrlInputs, setShowUrlInputs] = useState(false);
  const DRAFT_KEY = 'admin_new_product_draft';

  // Load draft from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedDraft = localStorage.getItem(DRAFT_KEY);
        if (savedDraft) {
          const draft = JSON.parse(savedDraft);
          if (draft.formData) {
            setFormData(draft.formData);
            setSelectedCategoryId(draft.selectedCategoryId || '');
            setSelectedSubCategoryId(draft.selectedSubCategoryId || '');
            setImageUrls(draft.imageUrls || ['']);
            setUploadedImages(draft.uploadedImages || []);
            setShowUrlInputs(draft.showUrlInputs || false);
          }
        }
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
  }, []);

  // Save draft to localStorage whenever form data changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const timeoutId = setTimeout(() => {
        try {
          const draft = {
            formData,
            selectedCategoryId,
            selectedSubCategoryId,
            imageUrls,
            uploadedImages,
            showUrlInputs,
            timestamp: Date.now(),
          };
          localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
        } catch (error) {
          console.error('Error saving draft:', error);
        }
      }, 500); // 500ms debounce

      return () => clearTimeout(timeoutId);
    }
  }, [formData, selectedCategoryId, selectedSubCategoryId, imageUrls, uploadedImages, showUrlInputs]);

  useEffect(() => {
    if (adminCategories.length > 0) {
      setCategories(adminCategories);
    } else {
      setCategories(adminCategories || []);
    }
  }, [adminCategories]);

  useEffect(() => {
    if (selectedCategoryId) {
      const category = categories.find((cat) => cat.id === selectedCategoryId);
      if (category && category.subCategories) {
        setAvailableSubCategories(category.subCategories);
      } else {
        setAvailableSubCategories([]);
      }
      setSelectedSubCategoryId('');
      setFormData((prev) => ({
        ...prev,
        categoryId: selectedCategoryId,
        subCategoryId: '',
      }));
    } else {
      setAvailableSubCategories([]);
      setSelectedSubCategoryId('');
      setFormData((prev) => ({
        ...prev,
        categoryId: '',
        subCategoryId: '',
      }));
    }
  }, [selectedCategoryId, categories]);

  useEffect(() => {
    if (selectedSubCategoryId) {
      setFormData((prev) => ({
        ...prev,
        subCategoryId: selectedSubCategoryId,
      }));
    }
  }, [selectedSubCategoryId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const uploadPromises = Array.from(files).map(async (file) => {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
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
        image: newImages[0] || prev.image,
        images: newImages
      }));
    }
    setIsUploading(false);
  };

  const removeImage = (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(newImages);
    setFormData(prev => ({ 
      ...prev, 
      image: newImages[0] || '',
      images: newImages
    }));
  };

  const handleUrlChange = (index: number, url: string) => {
    const newUrls = [...imageUrls];
    newUrls[index] = url;
    setImageUrls(newUrls);
  };

  const addUrlInput = () => {
    setImageUrls([...imageUrls, '']);
  };

  const removeUrlInput = (index: number) => {
    const newUrls = imageUrls.filter((_, i) => i !== index);
    setImageUrls(newUrls);
  };

  const addUrlsToImages = () => {
    const validUrls = imageUrls.filter(url => url.trim() !== '');
    if (validUrls.length > 0) {
      const combinedImages = [...uploadedImages, ...validUrls];
      setUploadedImages(combinedImages);
      setFormData(prev => ({
        ...prev,
        image: combinedImages[0] || prev.image || '',
        images: combinedImages
      }));
      setImageUrls(['']);
      setShowUrlInputs(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const selectedCategory = categories.find((cat) => cat.id === selectedCategoryId);
    const categorySlug = selectedCategory?.slug || formData.category || '';

    const newProduct: Product = {
      id: `product-${Date.now()}`,
      name: formData.name!,
      description: formData.description!,
      price: formData.price!,
      originalPrice: formData.originalPrice,
      image: uploadedImages[0] || formData.image || '',
      images: uploadedImages.length > 0 ? uploadedImages : (formData.images || []),
      category: categorySlug,
      categoryId: selectedCategoryId || undefined,
      subCategoryId: selectedSubCategoryId || undefined,
      // Stok mantığı: stock ve inStock tutarlı olmalı
      stock: formData.stock ?? (formData.inStock ? 10 : 0),
      inStock: formData.stock !== undefined 
        ? (formData.stock > 0) 
        : (formData.inStock ?? true),
      // Rating ve reviews otomatik olarak yorumlardan hesaplanacak, başlangıçta 0
      rating: 0,
      reviews: 0,
    };

    await addProduct(newProduct);
    router.push('/admin/products');
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
          <h1 className="text-3xl font-bold text-gray-900">Yeni Ürün Ekle</h1>
          <p className="text-gray-600 mt-1">Yeni ürün bilgilerini girin</p>
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
                value={formData.name}
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
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">Kategori Seçin</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {availableSubCategories.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alt Kategori (Opsiyonel)
                </label>
                <select
                  value={selectedSubCategoryId}
                  onChange={(e) => setSelectedSubCategoryId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Alt Kategori Seçin</option>
                  {availableSubCategories.map((subCat) => (
                    <option key={subCat.id} value={subCat.id}>
                      {subCat.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Açıklama *
            </label>
            <textarea
              required
              rows={4}
              value={formData.description}
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
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Orijinal Fiyat (₺) - İndirim için
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
                        {isUploading ? 'Yükleniyor...' : 'Dosya Seç veya Sürükle (Çoklu)'}
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

                {/* URL ile Görsel Ekleme */}
                <div className="border-t pt-3 mt-3">
                  <button
                    type="button"
                    onClick={() => setShowUrlInputs(!showUrlInputs)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors"
                  >
                    <LinkIcon className="w-4 h-4" />
                    {showUrlInputs ? 'URL Ekleme Kapat' : 'URL ile Görsel Ekle'}
                  </button>

                  {showUrlInputs && (
                    <div className="mt-3 space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Görsel URL'leri Girin
                        </label>
                        <button
                          type="button"
                          onClick={addUrlInput}
                          className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-orange-600 hover:text-orange-700 hover:bg-orange-100 rounded transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                          URL Ekle
                        </button>
                      </div>
                      
                      <div className="space-y-2">
                        {imageUrls.map((url, index) => (
                          <div key={index} className="flex gap-2 items-center">
                            <div className="flex-1 relative">
                              <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <input
                                type="text"
                                value={url}
                                onChange={(e) => handleUrlChange(index, e.target.value)}
                                placeholder="https://example.com/image.jpg veya /products/image.jpg"
                                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                              />
                              {url.trim() !== '' && (
                                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                  <img
                                    src={url}
                                    alt={`Preview ${index + 1}`}
                                    className="w-8 h-8 object-cover rounded border border-gray-200"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                            {imageUrls.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeUrlInput(index)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={addUrlsToImages}
                        disabled={imageUrls.every(url => url.trim() === '')}
                        className="w-full px-4 py-2 bg-orange-600 text-white text-sm font-semibold rounded-lg hover:bg-orange-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        URL'leri Görsellere Ekle
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.inStock}
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
              <p className="text-xs text-gray-500 mt-1">Stok miktarı girilmezse varsayılan olarak 10 adet kabul edilir</p>
            </div>

          </div>

          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {isSubmitting ? 'Kaydediliyor...' : 'Ürünü Kaydet'}
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

