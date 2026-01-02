'use client';

import { useAdmin } from '@/context/AdminContext';
import { Edit, Plus, Trash2, X, Save, ChevronDown, ChevronUp, Upload } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Category, SubCategory } from '@/types';
import { useToast } from '@/components/ToastContainer';

export default function CategoriesPage() {
  const {
    categories: adminCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    addSubCategory,
    updateSubCategory,
    deleteSubCategory,
  } = useAdmin();
  const { showToast } = useToast();
  const [categoryList, setCategoryList] = useState<Category[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [editingSubCategoryId, setEditingSubCategoryId] = useState<string | null>(null);
  const [addingSubCategoryTo, setAddingSubCategoryTo] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState<Partial<Category>>({
    name: '',
    slug: '',
  });
  const [editData, setEditData] = useState<Partial<Category>>({});
  const [newSubCategory, setNewSubCategory] = useState<Partial<SubCategory>>({
    name: '',
    slug: '',
    categoryId: '',
  });
  const [editSubCategoryData, setEditSubCategoryData] = useState<Partial<SubCategory>>({});
  const [isUploadingCategory, setIsUploadingCategory] = useState(false);
  const [isUploadingSubCategory, setIsUploadingSubCategory] = useState(false);
  const [isUploadingEditCategory, setIsUploadingEditCategory] = useState(false);
  const DRAFT_KEY = 'admin_categories_draft';

  // Load draft from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedDraft = localStorage.getItem(DRAFT_KEY);
        if (savedDraft) {
          const draft = JSON.parse(savedDraft);
          if (draft.newCategory) setNewCategory(draft.newCategory);
          if (draft.newSubCategory) setNewSubCategory(draft.newSubCategory);
          if (draft.editData && draft.editingId) {
            setEditData(draft.editData);
            setEditingId(draft.editingId);
          }
          if (draft.editSubCategoryData && draft.editingSubCategoryId) {
            setEditSubCategoryData(draft.editSubCategoryData);
            setEditingSubCategoryId(draft.editingSubCategoryId);
          }
          if (draft.addingSubCategoryTo) setAddingSubCategoryTo(draft.addingSubCategoryTo);
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
            newCategory,
            newSubCategory,
            editData,
            editingId,
            editSubCategoryData,
            editingSubCategoryId,
            addingSubCategoryTo,
            timestamp: Date.now(),
          };
          localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
        } catch (error) {
          console.error('Error saving draft:', error);
        }
      }, 500); // 500ms debounce

      return () => clearTimeout(timeoutId);
    }
  }, [newCategory, newSubCategory, editData, editingId, editSubCategoryData, editingSubCategoryId, addingSubCategoryTo]);

  useEffect(() => {
    if (adminCategories && Array.isArray(adminCategories) && adminCategories.length > 0) {
      setCategoryList(adminCategories);
    }
  }, [adminCategories]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const handleAdd = async () => {
    if (!newCategory.name || !newCategory.slug) {
      showToast('Lütfen tüm alanları doldurun', 'error');
      return;
    }

    try {
      const category: Category = {
        id: `category-${Date.now()}`,
        name: newCategory.name,
        slug: newCategory.slug,
        image: newCategory.image,
      };
      await addCategory(category);
      setNewCategory({ name: '', slug: '' });
      setIsAdding(false);
      // Clear draft after successful submission
      if (typeof window !== 'undefined') {
        const savedDraft = localStorage.getItem(DRAFT_KEY);
        if (savedDraft) {
          const draft = JSON.parse(savedDraft);
          draft.newCategory = { name: '', slug: '' };
          localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
        }
      }
      showToast('Kategori başarıyla eklendi', 'success');
    } catch (error: any) {
      showToast(error.message || 'Kategori eklenirken bir hata oluştu', 'error');
    }
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setEditData({ ...category });
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;

    try {
      await updateCategory(editingId, editData);
      setEditingId(null);
      setEditData({});
      // Clear draft after successful submission
      if (typeof window !== 'undefined') {
        const savedDraft = localStorage.getItem(DRAFT_KEY);
        if (savedDraft) {
          const draft = JSON.parse(savedDraft);
          draft.editData = {};
          draft.editingId = null;
          localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
        }
      }
      showToast('Kategori başarıyla güncellendi', 'success');
    } catch (error: any) {
      showToast(error.message || 'Kategori güncellenirken bir hata oluştu', 'error');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`${name} kategorisini silmek istediğinize emin misiniz?`)) {
      return;
    }

    try {
      await deleteCategory(id);
      showToast('Kategori başarıyla silindi', 'success');
    } catch (error: any) {
      showToast(error.message || 'Kategori silinirken bir hata oluştu', 'error');
    }
  };

  const handleAddSubCategory = async (categoryId: string) => {
    if (!newSubCategory.name || !newSubCategory.slug) {
      showToast('Lütfen tüm alanları doldurun', 'error');
      return;
    }

    try {
      const subCategory: SubCategory = {
        id: `subcategory-${Date.now()}`,
        name: newSubCategory.name,
        slug: newSubCategory.slug,
        categoryId,
        image: newSubCategory.image,
      };
      await addSubCategory(subCategory);
      setNewSubCategory({ name: '', slug: '', categoryId: '' });
      setAddingSubCategoryTo(null);
      // Clear draft after successful submission
      if (typeof window !== 'undefined') {
        const savedDraft = localStorage.getItem(DRAFT_KEY);
        if (savedDraft) {
          const draft = JSON.parse(savedDraft);
          draft.newSubCategory = { name: '', slug: '', categoryId: '' };
          draft.addingSubCategoryTo = null;
          localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
        }
      }
      showToast('Alt kategori başarıyla eklendi', 'success');
    } catch (error: any) {
      showToast(error.message || 'Alt kategori eklenirken bir hata oluştu', 'error');
    }
  };

  const handleEditSubCategory = (subCategory: SubCategory) => {
    setEditingSubCategoryId(subCategory.id);
    setEditSubCategoryData({ ...subCategory });
  };

  const handleSaveSubCategoryEdit = async () => {
    if (!editingSubCategoryId) return;

    try {
      await updateSubCategory(editingSubCategoryId, editSubCategoryData);
      setEditingSubCategoryId(null);
      setEditSubCategoryData({});
      // Clear draft after successful submission
      if (typeof window !== 'undefined') {
        const savedDraft = localStorage.getItem(DRAFT_KEY);
        if (savedDraft) {
          const draft = JSON.parse(savedDraft);
          draft.editSubCategoryData = {};
          draft.editingSubCategoryId = null;
          localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
        }
      }
      showToast('Alt kategori başarıyla güncellendi', 'success');
    } catch (error: any) {
      showToast(error.message || 'Alt kategori güncellenirken bir hata oluştu', 'error');
    }
  };

  const handleDeleteSubCategory = async (id: string, name: string) => {
    if (!confirm(`${name} alt kategorisini silmek istediğinize emin misiniz?`)) {
      return;
    }

    try {
      await deleteSubCategory(id);
      showToast('Alt kategori başarıyla silindi', 'success');
    } catch (error: any) {
      showToast(error.message || 'Alt kategori silinirken bir hata oluştu', 'error');
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kategoriler ve Alt Kategoriler</h1>
          <p className="text-gray-600 mt-2">Tüm kategorileri ve alt kategorileri görüntüleyin ve yönetin</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Yeni Kategori
        </button>
      </div>

      {/* Add Category Form */}
      {isAdding && (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Yeni Kategori Ekle</h2>
            <button
              onClick={() => {
                setIsAdding(false);
                setNewCategory({ name: '', slug: '' });
              }}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategori Adı *
              </label>
              <input
                type="text"
                value={newCategory.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setNewCategory({
                    ...newCategory,
                    name,
                    slug: newCategory.slug || generateSlug(name),
                  });
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Örn: Takılar"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slug *
              </label>
              <input
                type="text"
                value={newCategory.slug}
                onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Örn: takilar"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Görsel (Opsiyonel)
              </label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategory.image || ''}
                    onChange={(e) => setNewCategory({ ...newCategory, image: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="/images/category.jpg veya dosya seçin"
                  />
                  <label className="px-4 py-2 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors cursor-pointer flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Dosya Seç
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        
                        setIsUploadingCategory(true);
                        try {
                          const formData = new FormData();
                          formData.append('file', file);
                          
                          const response = await fetch('/api/upload', {
                            method: 'POST',
                            body: formData,
                          });
                          
                          const data = await response.json();
                          
                          if (data.success && data.url) {
                            setNewCategory({ ...newCategory, image: data.url });
                            showToast('Görsel başarıyla yüklendi', 'success');
                          } else {
                            showToast(data.error || 'Görsel yüklenirken bir hata oluştu', 'error');
                          }
                        } catch (error) {
                          console.error('Upload error:', error);
                          showToast('Görsel yüklenirken bir hata oluştu', 'error');
                        } finally {
                          setIsUploadingCategory(false);
                        }
                      }}
                      disabled={isUploadingCategory}
                    />
                  </label>
                </div>
                {isUploadingCategory && (
                  <p className="text-sm text-gray-500">Yükleniyor...</p>
                )}
                {newCategory.image && (
                  <div className="mt-2">
                    <img
                      src={newCategory.image}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded-lg border border-gray-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Kaydet
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setNewCategory({ name: '', slug: '' });
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              İptal
            </button>
          </div>
        </div>
      )}

      {/* Categories List */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100">
        <div className="p-6">
          <div className="space-y-4">
            {categoryList.map((category) => {
              const isExpanded = expandedCategories.has(category.id);
              const subCategories = category.subCategories || [];

              return (
                <div
                  key={category.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  {editingId === category.id ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Ad
                        </label>
                        <input
                          type="text"
                          value={editData.name || ''}
                          onChange={(e) => {
                            const name = e.target.value;
                            setEditData({
                              ...editData,
                              name,
                              slug: editData.slug || generateSlug(name),
                            });
                          }}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Slug
                        </label>
                        <input
                          type="text"
                          value={editData.slug || ''}
                          onChange={(e) => setEditData({ ...editData, slug: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Görsel
                        </label>
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={editData.image || ''}
                              onChange={(e) => setEditData({ ...editData, image: e.target.value })}
                              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                              placeholder="/images/category.jpg veya dosya seçin"
                            />
                            <label className="px-3 py-2 bg-orange-600 text-white text-xs font-semibold rounded-lg hover:bg-orange-700 transition-colors cursor-pointer flex items-center gap-1">
                              <Upload className="w-3 h-3" />
                              Dosya
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  
                                  setIsUploadingEditCategory(true);
                                  try {
                                    const formData = new FormData();
                                    formData.append('file', file);
                                    
                                    const response = await fetch('/api/upload', {
                                      method: 'POST',
                                      body: formData,
                                    });
                                    
                                    const data = await response.json();
                                    
                                    if (data.success && data.url) {
                                      setEditData({ ...editData, image: data.url });
                                      showToast('Görsel başarıyla yüklendi', 'success');
                                    } else {
                                      showToast(data.error || 'Görsel yüklenirken bir hata oluştu', 'error');
                                    }
                                  } catch (error) {
                                    console.error('Upload error:', error);
                                    showToast('Görsel yüklenirken bir hata oluştu', 'error');
                                  } finally {
                                    setIsUploadingEditCategory(false);
                                  }
                                }}
                                disabled={isUploadingEditCategory}
                              />
                            </label>
                          </div>
                          {isUploadingEditCategory && (
                            <p className="text-xs text-gray-500">Yükleniyor...</p>
                          )}
                          {editData.image && (
                            <div className="mt-2">
                              <img
                                src={editData.image}
                                alt="Preview"
                                className="w-full h-24 object-cover rounded-lg border border-gray-300"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveEdit}
                          className="flex-1 px-3 py-2 bg-orange-600 text-white text-sm font-semibold rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-1"
                        >
                          <Save className="w-3 h-3" />
                          Kaydet
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setEditData({});
                          }}
                          className="px-3 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          İptal
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3 flex-1">
                          <button
                            onClick={() => toggleCategory(category.id)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-gray-600" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-600" />
                            )}
                          </button>
                          <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                          <span className="text-xs text-gray-500">
                            ({subCategories.length} alt kategori)
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setAddingSubCategoryTo(category.id);
                              setNewSubCategory({
                                name: '',
                                slug: '',
                                categoryId: category.id,
                              });
                            }}
                            className="px-3 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
                            title="Alt Kategori Ekle"
                          >
                            <Plus className="w-3 h-3 inline mr-1" />
                            Alt Kategori
                          </button>
                          <button
                            onClick={() => handleEdit(category)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Düzenle"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(category.id, category.name)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">Slug: {category.slug}</p>
                      {category.image && (
                        <div className="mb-2">
                          <img
                            src={category.image}
                            alt={category.name}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                        </div>
                      )}

                      {/* Add SubCategory Form */}
                      {addingSubCategoryTo === category.id && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-gray-900">Yeni Alt Kategori Ekle</h4>
                            <button
                              onClick={() => {
                                setAddingSubCategoryTo(null);
                                setNewSubCategory({ name: '', slug: '', categoryId: '' });
                              }}
                              className="p-1 hover:bg-gray-200 rounded"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Alt Kategori Adı *
                              </label>
                              <input
                                type="text"
                                value={newSubCategory.name}
                                onChange={(e) => {
                                  const name = e.target.value;
                                  setNewSubCategory({
                                    ...newSubCategory,
                                    name,
                                    slug: newSubCategory.slug || generateSlug(name),
                                    categoryId: category.id,
                                  });
                                }}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                placeholder="Örn: Kolye"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Slug *
                              </label>
                              <input
                                type="text"
                                value={newSubCategory.slug}
                                onChange={(e) =>
                                  setNewSubCategory({
                                    ...newSubCategory,
                                    slug: e.target.value,
                                    categoryId: category.id,
                                  })
                                }
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                placeholder="Örn: kolye"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Görsel
                              </label>
                              <div className="space-y-2">
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    value={newSubCategory.image || ''}
                                    onChange={(e) =>
                                      setNewSubCategory({
                                        ...newSubCategory,
                                        image: e.target.value,
                                        categoryId: category.id,
                                      })
                                    }
                                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    placeholder="/images/subcategory.jpg veya dosya seçin"
                                  />
                                  <label className="px-3 py-2 bg-orange-600 text-white text-xs font-semibold rounded-lg hover:bg-orange-700 transition-colors cursor-pointer flex items-center gap-1">
                                    <Upload className="w-3 h-3" />
                                    Dosya
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        
                                        setIsUploadingSubCategory(true);
                                        try {
                                          const formData = new FormData();
                                          formData.append('file', file);
                                          
                                          const response = await fetch('/api/upload', {
                                            method: 'POST',
                                            body: formData,
                                          });
                                          
                                          const data = await response.json();
                                          
                                          if (data.success && data.url) {
                                            setNewSubCategory({
                                              ...newSubCategory,
                                              image: data.url,
                                              categoryId: category.id,
                                            });
                                            showToast('Görsel başarıyla yüklendi', 'success');
                                          } else {
                                            showToast(data.error || 'Görsel yüklenirken bir hata oluştu', 'error');
                                          }
                                        } catch (error) {
                                          console.error('Upload error:', error);
                                          showToast('Görsel yüklenirken bir hata oluştu', 'error');
                                        } finally {
                                          setIsUploadingSubCategory(false);
                                        }
                                      }}
                                      disabled={isUploadingSubCategory}
                                    />
                                  </label>
                                </div>
                                {isUploadingSubCategory && (
                                  <p className="text-xs text-gray-500">Yükleniyor...</p>
                                )}
                                {newSubCategory.image && (
                                  <div className="mt-2">
                                    <img
                                      src={newSubCategory.image}
                                      alt="Preview"
                                      className="w-full h-24 object-cover rounded-lg border border-gray-300"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                      }}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => handleAddSubCategory(category.id)}
                              className="px-3 py-2 bg-orange-600 text-white text-sm font-semibold rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-1"
                            >
                              <Save className="w-3 h-3" />
                              Kaydet
                            </button>
                            <button
                              onClick={() => {
                                setAddingSubCategoryTo(null);
                                setNewSubCategory({ name: '', slug: '', categoryId: '' });
                              }}
                              className="px-3 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              İptal
                            </button>
                          </div>
                        </div>
                      )}

                      {/* SubCategories List */}
                      {isExpanded && subCategories.length > 0 && (
                        <div className="mt-4 space-y-2 pl-6 border-l-2 border-gray-200">
                          {subCategories.map((subCategory) => (
                            <div
                              key={subCategory.id}
                              className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                            >
                              {editingSubCategoryId === subCategory.id ? (
                                <div className="space-y-2">
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      Ad
                                    </label>
                                    <input
                                      type="text"
                                      value={editSubCategoryData.name || ''}
                                      onChange={(e) => {
                                        const name = e.target.value;
                                        setEditSubCategoryData({
                                          ...editSubCategoryData,
                                          name,
                                          slug:
                                            editSubCategoryData.slug || generateSlug(name),
                                        });
                                      }}
                                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      Slug
                                    </label>
                                    <input
                                      type="text"
                                      value={editSubCategoryData.slug || ''}
                                      onChange={(e) =>
                                        setEditSubCategoryData({
                                          ...editSubCategoryData,
                                          slug: e.target.value,
                                        })
                                      }
                                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      Görsel
                                    </label>
                                    <div className="space-y-2">
                                      <div className="flex gap-2">
                                        <input
                                          type="text"
                                          value={editSubCategoryData.image || ''}
                                          onChange={(e) =>
                                            setEditSubCategoryData({
                                              ...editSubCategoryData,
                                              image: e.target.value,
                                            })
                                          }
                                          className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                          placeholder="/images/subcategory.jpg veya dosya seçin"
                                        />
                                        <label className="px-2 py-1 bg-orange-600 text-white text-xs font-semibold rounded hover:bg-orange-700 transition-colors cursor-pointer flex items-center gap-1">
                                          <Upload className="w-3 h-3" />
                                          Dosya
                                          <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={async (e) => {
                                              const file = e.target.files?.[0];
                                              if (!file) return;
                                              
                                              setIsUploadingSubCategory(true);
                                              try {
                                                const formData = new FormData();
                                                formData.append('file', file);
                                                
                                                const response = await fetch('/api/upload', {
                                                  method: 'POST',
                                                  body: formData,
                                                });
                                                
                                                const data = await response.json();
                                                
                                                if (data.success && data.url) {
                                                  setEditSubCategoryData({
                                                    ...editSubCategoryData,
                                                    image: data.url,
                                                  });
                                                  showToast('Görsel başarıyla yüklendi', 'success');
                                                } else {
                                                  showToast(data.error || 'Görsel yüklenirken bir hata oluştu', 'error');
                                                }
                                              } catch (error) {
                                                console.error('Upload error:', error);
                                                showToast('Görsel yüklenirken bir hata oluştu', 'error');
                                              } finally {
                                                setIsUploadingSubCategory(false);
                                              }
                                            }}
                                            disabled={isUploadingSubCategory}
                                          />
                                        </label>
                                      </div>
                                      {isUploadingSubCategory && (
                                        <p className="text-xs text-gray-500">Yükleniyor...</p>
                                      )}
                                      {editSubCategoryData.image && (
                                        <div className="mt-2">
                                          <img
                                            src={editSubCategoryData.image}
                                            alt="Preview"
                                            className="w-full h-20 object-cover rounded border border-gray-300"
                                            onError={(e) => {
                                              const target = e.target as HTMLImageElement;
                                              target.style.display = 'none';
                                            }}
                                          />
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={handleSaveSubCategoryEdit}
                                      className="flex-1 px-2 py-1 bg-orange-600 text-white text-xs font-semibold rounded hover:bg-orange-700 transition-colors"
                                    >
                                      Kaydet
                                    </button>
                                    <button
                                      onClick={() => {
                                        setEditingSubCategoryId(null);
                                        setEditSubCategoryData({});
                                      }}
                                      className="px-2 py-1 border border-gray-300 text-gray-700 text-xs font-semibold rounded hover:bg-gray-50 transition-colors"
                                    >
                                      İptal
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-medium text-gray-900 text-sm">
                                      {subCategory.name}
                                    </p>
                                    <p className="text-xs text-gray-500">Slug: {subCategory.slug}</p>
                                  </div>
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => handleEditSubCategory(subCategory)}
                                      className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                      title="Düzenle"
                                    >
                                      <Edit className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteSubCategory(subCategory.id, subCategory.name)
                                      }
                                      className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                      title="Sil"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
