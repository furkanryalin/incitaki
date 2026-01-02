'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Order, Review, User, Product, Category, SubCategory } from '@/types';

interface AdminContextType {
  isAuthenticated: boolean;
  mounted: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  deleteOrder: (orderId: string) => void;
  reviews: Review[];
  addReview: (review: Review) => void;
  updateReview: (reviewId: string, updates: Partial<Review>) => void;
  deleteReview: (reviewId: string) => void;
  replyToReview: (reviewId: string, reply: string) => void;
  users: User[];
  addUser: (user: User) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
  products: Product[];
  updateProduct: (productId: string, updates: Partial<Product>) => void;
  addProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  bulkDiscount: (productIds: string[], discountPercent: number) => void;
  categories: Category[];
  addCategory: (category: Partial<Category>) => Promise<void>;
  updateCategory: (categoryId: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;
  subCategories: SubCategory[];
  addSubCategory: (subCategory: SubCategory) => Promise<void>;
  updateSubCategory: (subCategoryId: string, updates: Partial<SubCategory>) => Promise<void>;
  deleteSubCategory: (subCategoryId: string) => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [mounted, setMounted] = useState(false);

  // Check admin session on mount
  useEffect(() => {
    setMounted(true);
    
    // Check if admin is authenticated via API
    const checkAdminSession = async () => {
      try {
        const response = await fetch('/api/admin/session', {
          credentials: 'include', // Include cookies
        });
        if (response.ok) {
          const data = await response.json();
          if (data.authenticated) {
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error('Error checking admin session:', error);
      }
    };
    
    checkAdminSession();
  }, []);

  // Load data from API on mount
  useEffect(() => {
    if (mounted) {
      // Load products from API
      fetch('/api/admin/products')
        .then(async res => {
          if (!res.ok) {
            // 401 is expected if not authenticated, don't throw
            if (res.status === 401) {
              return { products: [] };
            }
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          // API response format: { products: [...] }
          const products = data.products || [];
          if (products.length > 0) {
            // API'den gelen ürünleri normalize et - stok mantığı tutarlı olmalı
            const normalizedProducts = products.map((product: Product) => {
              const stockValue = product.stock ?? 0;
              const inStockValue = product.inStock ?? (stockValue > 0);
              return {
                ...product,
                stock: stockValue,
                inStock: inStockValue,
              };
            });
            setProducts(normalizedProducts);
          } else {
            setProducts([]);
          }
        })
        .catch(err => {
          // 401 is expected if not authenticated, don't log as error
          if (err.message?.includes('401')) {
            setProducts([]);
            return;
          }
          console.error('Error loading products:', err);
          setProducts([]);
        });

      // Load orders from API
      fetch('/api/admin/orders')
        .then(async res => {
          if (!res.ok) {
            // 401 is expected if not authenticated, don't throw
            if (res.status === 401) {
              return { orders: [] };
            }
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          // API response format kontrolü
          const orders = data.orders || data.data?.orders || [];
          setOrders(Array.isArray(orders) ? orders : []);
        })
        .catch(err => {
          // 401 is expected if not authenticated, don't log as error
          if (err.message?.includes('401')) {
            setOrders([]);
            return;
          }
          console.error('Error loading orders:', err);
          setOrders([]);
        });

      // Load reviews from API
      fetch('/api/admin/reviews')
        .then(async res => {
          if (!res.ok) {
            // 401 is expected if not authenticated, don't throw
            if (res.status === 401) {
              return { reviews: [] };
            }
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          // API response format kontrolü
          const reviews = data.reviews || data.data?.reviews || [];
          setReviews(Array.isArray(reviews) ? reviews : []);
        })
        .catch(err => {
          // 401 is expected if not authenticated, don't log as error
          if (err.message?.includes('401')) {
            setReviews([]);
            return;
          }
          console.error('Error loading reviews:', err);
          setReviews([]);
        });

      // Load users from API
      fetch('/api/admin/users')
        .then(async res => {
          if (!res.ok) {
            // 401 is expected if not authenticated, don't throw
            if (res.status === 401) {
              return { users: [] };
            }
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          // API response format kontrolü
          const users = data.users || data.data?.users || [];
          setUsers(Array.isArray(users) ? users : []);
        })
        .catch(err => {
          // 401 is expected if not authenticated, don't log as error
          if (err.message?.includes('401')) {
            setUsers([]);
            return;
          }
          console.error('Error loading users:', err);
          setUsers([]);
        });

      // Load categories from API (public endpoint, no auth needed)
      fetch('/api/admin/categories')
        .then(async res => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          // API response format: { success: true, data: { categories: [...] } }
          const categories = data.success && data.data?.categories 
            ? data.data.categories 
            : data.categories || [];
          
          if (categories.length > 0) {
            setCategories(categories);
            // Extract subcategories from categories
            const allSubCategories: SubCategory[] = [];
            categories.forEach((cat: Category) => {
              if (cat.subCategories) {
                allSubCategories.push(...cat.subCategories);
              }
            });
            setSubCategories(allSubCategories);
          } else {
            setCategories([]);
            setSubCategories([]);
          }
        })
        .catch(err => {
          console.error('Error loading categories:', err);
          // Hata durumunda boş array set et
          setCategories([]);
          setSubCategories([]);
        });

      // Load subcategories from API
      fetch('/api/admin/subcategories')
        .then(res => res.json())
        .then(data => {
          if (data.subCategories) {
            setSubCategories(data.subCategories);
          }
        })
        .catch(err => console.error('Error loading subcategories:', err));
    }
  }, [mounted, isAuthenticated]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (data.success && data.data?.user) {
        setIsAuthenticated(true);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Admin login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsAuthenticated(false);
    }
  };

  const addOrder = async (order: Order) => {
    try {
      // Stoktan düş
      for (const item of order.items) {
        const product = products.find(p => p.id === item.product.id);
        if (product && product.stock !== undefined) {
          const newStock = Math.max(0, product.stock - item.quantity);
          await updateProduct(product.id, { 
            stock: newStock,
            inStock: newStock > 0
          });
        }
      }

      const response = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });
      const data = await response.json();
      if (data.success) {
        setOrders((prev) => [data.order, ...prev]);
      }
    } catch (error) {
      console.error('Error adding order:', error);
      // Fallback to local state
      setOrders((prev) => [order, ...prev]);
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      const response = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status }),
      });
      const data = await response.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId ? data.order : order
          )
        );
      }
    } catch (error) {
      console.error('Error updating order:', error);
      // Fallback to local state
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? { ...order, status, updatedAt: new Date().toISOString() }
            : order
        )
      );
    }
  };

  const deleteOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/admin/orders?id=${orderId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        setOrders((prev) => prev.filter((order) => order.id !== orderId));
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      // Fallback to local state
      setOrders((prev) => prev.filter((order) => order.id !== orderId));
    }
  };

  // Review functions
  const addReview = async (review: Review) => {
    try {
      const response = await fetch('/api/admin/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(review),
      });
      const data = await response.json();
      if (data.success) {
        setReviews((prev) => [data.review, ...prev]);
      }
    } catch (error) {
      console.error('Error adding review:', error);
      setReviews((prev) => [review, ...prev]);
    }
  };

  const updateReview = async (reviewId: string, updates: Partial<Review>) => {
    try {
      const response = await fetch('/api/admin/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: reviewId, ...updates }),
      });
      const data = await response.json();
      if (data.success) {
        setReviews((prev) =>
          prev.map((review) =>
            review.id === reviewId ? data.review : review
          )
        );
      }
    } catch (error) {
      console.error('Error updating review:', error);
      setReviews((prev) =>
        prev.map((review) =>
          review.id === reviewId
            ? { ...review, ...updates, updatedAt: new Date().toISOString() }
            : review
        )
      );
    }
  };

  const deleteReview = async (reviewId: string) => {
    try {
      const response = await fetch(`/api/admin/reviews?id=${reviewId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        setReviews((prev) => prev.filter((review) => review.id !== reviewId));
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      setReviews((prev) => prev.filter((review) => review.id !== reviewId));
    }
  };

  const replyToReview = async (reviewId: string, reply: string) => {
    await updateReview(reviewId, { reply });
  };

  // User functions
  const addUser = (user: User) => {
    setUsers((prev) => [user, ...prev]);
  };

  const updateUser = (userId: string, updates: Partial<User>) => {
    setUsers((prev) =>
      prev.map((user) => (user.id === userId ? { ...user, ...updates } : user))
    );
  };

  // Product functions
  const updateProduct = async (productId: string, updates: Partial<Product>) => {
    try {
      // Stok değerlerini normalize et
      const normalizedUpdates = { ...updates };
      if (normalizedUpdates.stock !== undefined) {
        normalizedUpdates.stock = typeof normalizedUpdates.stock === 'string' 
          ? parseInt(normalizedUpdates.stock) || 0 
          : (normalizedUpdates.stock ?? 0);
        // Stock'a göre inStock'u otomatik ayarla
        if (normalizedUpdates.inStock === undefined) {
          normalizedUpdates.inStock = normalizedUpdates.stock > 0;
        }
      }
      if (normalizedUpdates.inStock !== undefined) {
        const inStockVal = normalizedUpdates.inStock;
        normalizedUpdates.inStock = String(inStockVal) === 'true' || String(inStockVal) === '1';
      }
      
      const response = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: productId, ...normalizedUpdates }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      if (data.success && data.product) {
        // API'den dönen product'ı kullan, ancak images formatını kontrol et
        const stockValue = data.product.stock ?? 0;
        const inStockValue = data.product.inStock ?? (stockValue > 0);
        const updatedProduct = {
          ...data.product,
          // Eğer images string ise parse et, array ise olduğu gibi kullan
          images: Array.isArray(data.product.images) 
            ? data.product.images 
            : (data.product.images ? JSON.parse(data.product.images) : []),
          // inStock ve stock değerlerini garantile
          inStock: inStockValue,
          stock: stockValue,
        };
        setProducts((prev) =>
          prev.map((product) =>
            product.id === productId ? updatedProduct : product
          )
        );
      } else {
        // API başarısız olursa hata fırlat
        throw new Error(data.error || 'Ürün güncellenemedi');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      // Hata durumunda hatayı fırlat ki form handle edebilsin
      throw error;
    }
  };

  const addProduct = async (product: Product) => {
    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      const data = await response.json();
      if (data.success && data.product) {
        // API'den dönen product'ı normalize et - stok mantığı tutarlı olmalı
        const stockValue = data.product.stock ?? 0;
        const inStockValue = data.product.inStock ?? (stockValue > 0);
        const newProduct = {
          ...data.product,
          images: Array.isArray(data.product.images) 
            ? data.product.images 
            : (data.product.images ? JSON.parse(data.product.images) : []),
          stock: stockValue,
          inStock: inStockValue,
        };
        setProducts((prev) => [newProduct, ...prev]);
      }
    } catch (error) {
      console.error('Error adding product:', error);
      // Fallback to local state
      setProducts((prev) => [product, ...prev]);
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      const response = await fetch(`/api/admin/products?id=${productId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        setProducts((prev) => prev.filter((product) => product.id !== productId));
        // localStorage'dan da kaldır
        if (typeof window !== 'undefined') {
          const savedProducts = localStorage.getItem('admin_products');
          if (savedProducts) {
            try {
              const products = JSON.parse(savedProducts);
              const filtered = products.filter((p: Product) => p.id !== productId);
              localStorage.setItem('admin_products', JSON.stringify(filtered));
            } catch (e) {
              console.error('Error updating localStorage:', e);
            }
          }
        }
      } else {
        throw new Error(data.error || 'Ürün silinemedi');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  };

  const bulkDiscount = async (productIds: string[], discountPercent: number) => {
    try {
      // Her ürünü ayrı ayrı güncelle
      for (const productId of productIds) {
        const product = products.find(p => p.id === productId);
        if (product) {
          const newPrice = Math.round(product.price * (1 - discountPercent / 100));
          await updateProduct(productId, {
            originalPrice: product.price,
            price: newPrice,
          });
        }
      }
    } catch (error) {
      console.error('Error applying bulk discount:', error);
      // Fallback to local state
      setProducts((prev) =>
        prev.map((product) => {
          if (productIds.includes(product.id)) {
            const newPrice = product.price * (1 - discountPercent / 100);
            return {
              ...product,
              originalPrice: product.price,
              price: Math.round(newPrice),
            };
          }
          return product;
        })
      );
    }
  };

  // Category functions
  const addCategory = async (category: Partial<Category>) => {
    try {
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category),
      });
      const data = await response.json();
      if (data.success) {
        // API'dan dönen response: { success: true, data: { category: ... } }
        const newCategory = data.data?.category || data.category;
        if (!newCategory || !newCategory.id) {
          throw new Error('API response: Kategori objesi eksik veya id yok');
        }
        setCategories((prev) => [newCategory, ...prev]);
      } else {
        throw new Error(data.error || 'Kategori eklenemedi');
      }
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  };

  const updateCategory = async (categoryId: string, updates: Partial<Category>) => {
    try {
      const response = await fetch('/api/admin/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: categoryId, ...updates }),
      });
      const data = await response.json();
      if (data.success) {
        setCategories((prev) =>
          prev.map((category) =>
            category.id === categoryId ? data.category : category
          )
        );
      } else {
        throw new Error(data.error || 'Kategori güncellenemedi');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  };

  const deleteCategory = async (categoryId: string) => {
    try {
      const response = await fetch(`/api/admin/categories?id=${categoryId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        setCategories((prev) => prev.filter((category) => category.id !== categoryId));
      } else {
        throw new Error(data.error || 'Kategori silinemedi');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  };

  // SubCategory functions
  const addSubCategory = async (subCategory: SubCategory) => {
    try {
      const response = await fetch('/api/admin/subcategories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subCategory),
      });
      const data = await response.json();
      if (data.success) {
        setSubCategories((prev) => [data.subCategory, ...prev]);
        // Update categories to include the new subcategory
        setCategories((prev) =>
          prev.map((cat) =>
            cat.id === subCategory.categoryId
              ? {
                  ...cat,
                  subCategories: [...(cat.subCategories || []), data.subCategory],
                }
              : cat
          )
        );
      } else {
        throw new Error(data.error || 'Alt kategori eklenemedi');
      }
    } catch (error) {
      console.error('Error adding subcategory:', error);
      throw error;
    }
  };

  const updateSubCategory = async (subCategoryId: string, updates: Partial<SubCategory>) => {
    try {
      const response = await fetch('/api/admin/subcategories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: subCategoryId, ...updates }),
      });
      const data = await response.json();
      if (data.success) {
        setSubCategories((prev) =>
          prev.map((subCat) =>
            subCat.id === subCategoryId ? data.subCategory : subCat
          )
        );
        // Update categories
        setCategories((prev) =>
          prev.map((cat) =>
            cat.id === data.subCategory.categoryId
              ? {
                  ...cat,
                  subCategories: (cat.subCategories || []).map((subCat) =>
                    subCat.id === subCategoryId ? data.subCategory : subCat
                  ),
                }
              : cat
          )
        );
      } else {
        throw new Error(data.error || 'Alt kategori güncellenemedi');
      }
    } catch (error) {
      console.error('Error updating subcategory:', error);
      throw error;
    }
  };

  const deleteSubCategory = async (subCategoryId: string) => {
    try {
      const response = await fetch(`/api/admin/subcategories?id=${subCategoryId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        const deletedSubCategory = subCategories.find((sc) => sc.id === subCategoryId);
        setSubCategories((prev) => prev.filter((subCat) => subCat.id !== subCategoryId));
        // Update categories
        if (deletedSubCategory) {
          setCategories((prev) =>
            prev.map((cat) =>
              cat.id === deletedSubCategory.categoryId
                ? {
                    ...cat,
                    subCategories: (cat.subCategories || []).filter(
                      (subCat) => subCat.id !== subCategoryId
                    ),
                  }
                : cat
            )
          );
        }
      } else {
        throw new Error(data.error || 'Alt kategori silinemedi');
      }
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      throw error;
    }
  };

  return (
    <AdminContext.Provider
      value={{
        isAuthenticated,
        mounted,
        login,
        logout,
        orders,
        addOrder,
        updateOrderStatus,
        deleteOrder,
        reviews,
        addReview,
        updateReview,
        deleteReview,
        replyToReview,
        users,
        addUser,
        updateUser,
        products,
        updateProduct,
        addProduct,
        deleteProduct,
        bulkDiscount,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        subCategories,
        addSubCategory,
        updateSubCategory,
        deleteSubCategory,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}

