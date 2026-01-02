'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product } from '@/types';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount - sadece bir kez çalışmalı
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          const parsed = JSON.parse(savedCart);
          if (Array.isArray(parsed)) {
            setCartItems(parsed);
          }
        }
      } catch (error) {
        console.error('Error parsing cart from localStorage:', error);
        localStorage.removeItem('cart');
        setCartItems([]);
      }
    }
  }, []); // Sadece mount'ta çalış

  // Save cart to localStorage whenever it changes - debounce ile
  useEffect(() => {
    if (typeof window !== 'undefined' && cartItems.length >= 0) {
      const timeoutId = setTimeout(() => {
        try {
          localStorage.setItem('cart', JSON.stringify(cartItems));
        } catch (error) {
          console.error('Error saving cart to localStorage:', error);
          // Quota exceeded hatası için eski verileri temizle
          try {
            localStorage.removeItem('cart');
            localStorage.setItem('cart', JSON.stringify(cartItems));
          } catch (e) {
            console.error('Could not save cart to localStorage:', e);
          }
        }
      }, 100); // 100ms debounce

      return () => clearTimeout(timeoutId);
    }
  }, [cartItems]);

  const addToCart = (product: Product, quantity: number = 1) => {
    // Stok kontrolü - stok mantığı tutarlı olmalı
    const stockValue = product.stock ?? 0;
    const inStockValue = product.inStock ?? (stockValue > 0);
    
    // Eğer ürün stokta değilse, sepete eklenemez
    if (!inStockValue || stockValue === 0) {
      throw new Error('Bu ürün stokta bulunmamaktadır');
    }
    
    const existingItem = cartItems.find((item) => item.product.id === product.id);
    const currentQuantity = existingItem ? existingItem.quantity : 0;
    const requestedQuantity = currentQuantity + quantity;

    if (requestedQuantity > stockValue) {
      throw new Error(
        `Stokta sadece ${stockValue} adet bulunmaktadır`
      );
    }

    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.product.id === product.id);
      
      if (existingItem) {
        return prevItems.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      
      return [...prevItems, { product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    // Stok kontrolü - stok mantığı tutarlı olmalı
    const item = cartItems.find((item) => item.product.id === productId);
    if (item) {
      const stockValue = item.product.stock ?? 0;
      const inStockValue = item.product.inStock ?? (stockValue > 0);
      
      // Eğer ürün stokta değilse, miktar artırılamaz
      if (!inStockValue || stockValue === 0) {
        throw new Error('Bu ürün stokta bulunmamaktadır');
      }
      
      if (quantity > stockValue) {
        throw new Error(
          `Stokta sadece ${stockValue} adet bulunmaktadır`
        );
      }
    }
    
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

