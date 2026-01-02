export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  category: string; // Legacy field for backward compatibility
  categoryId?: string;
  categoryData?: Category;
  categoryRelation?: Category; // Alias for categoryData (API response compatibility)
  subCategoryId?: string;
  subCategory?: SubCategory;
  inStock: boolean;
  stock?: number; // Stok miktarı
  rating?: number;
  reviews?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  subCategories?: SubCategory[];
}

export interface SubCategory {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  category?: Category;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  items: CartItem[];
  totalPrice: number;
  shippingCost: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface Review {
  id: string;
  productId: string;
  productName: string;
  userName: string;
  userEmail: string;
  rating: number;
  comment: string;
  reply?: string;
  createdAt: string;
  updatedAt: string;
  approved: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Şifre (hash'lenmiş olmalı)
  phone?: string;
  address?: string;
  createdAt: string;
  totalOrders: number;
  totalSpent: number;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

