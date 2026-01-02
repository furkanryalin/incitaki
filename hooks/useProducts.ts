import { useState, useEffect } from 'react';
import { Product } from '@/types';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // API'den ürünleri çek
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (data.products) {
          setProducts(data.products);
        } else {
          setProducts([]);
        }
      })
      .catch(err => {
        console.error('Error loading products:', err);
        setProducts([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return { products, loading };
}

