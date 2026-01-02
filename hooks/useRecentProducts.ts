'use client';

import { useState, useEffect, useCallback } from 'react';
import { Product } from '@/types';

const RECENT_PRODUCTS_KEY = 'recent_products';
const MAX_RECENT_PRODUCTS = 10;

export function useRecentProducts() {
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(RECENT_PRODUCTS_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setRecentProducts(parsed);
          }
        }
      } catch (error) {
        console.error('Error loading recent products:', error);
      }
    }
  }, []);

  const addRecentProduct = useCallback((product: Product) => {
    if (typeof window !== 'undefined') {
      try {
        setRecentProducts((prev) => {
          // Mevcut ürünü listeden çıkar (varsa)
          const filtered = prev.filter((p) => p.id !== product.id);
          // Yeni ürünü başa ekle
          const updated = [product, ...filtered].slice(0, MAX_RECENT_PRODUCTS);
          
          // localStorage'a kaydet
          localStorage.setItem(RECENT_PRODUCTS_KEY, JSON.stringify(updated));
          return updated;
        });
      } catch (error) {
        console.error('Error saving recent products:', error);
      }
    }
  }, []);

  const clearRecentProducts = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(RECENT_PRODUCTS_KEY);
      setRecentProducts([]);
    }
  };

  return {
    recentProducts,
    addRecentProduct,
    clearRecentProducts,
  };
}

