'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/types';

interface FavoritesContextType {
  favorites: Product[];
  addToFavorites: (product: Product) => void;
  removeFromFavorites: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (product: Product) => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<Product[]>([]);

  // Load favorites from localStorage on mount - sadece bir kez çalışmalı
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedFavorites = localStorage.getItem('favorites');
        if (savedFavorites) {
          const parsed = JSON.parse(savedFavorites);
          if (Array.isArray(parsed)) {
            setFavorites(parsed);
          }
        }
      } catch (error) {
        console.error('Error parsing favorites from localStorage:', error);
        localStorage.removeItem('favorites');
        setFavorites([]);
      }
    }
  }, []); // Sadece mount'ta çalış

  // Save favorites to localStorage whenever it changes - debounce ile
  useEffect(() => {
    if (typeof window !== 'undefined' && favorites.length >= 0) {
      const timeoutId = setTimeout(() => {
        try {
          localStorage.setItem('favorites', JSON.stringify(favorites));
        } catch (error) {
          console.error('Error saving favorites to localStorage:', error);
          // Quota exceeded hatası için eski verileri temizle
          try {
            localStorage.removeItem('favorites');
            localStorage.setItem('favorites', JSON.stringify(favorites));
          } catch (e) {
            console.error('Could not save favorites to localStorage:', e);
          }
        }
      }, 100); // 100ms debounce

      return () => clearTimeout(timeoutId);
    }
  }, [favorites]);

  const addToFavorites = (product: Product) => {
    setFavorites((prev) => {
      if (prev.find((p) => p.id === product.id)) {
        return prev;
      }
      return [...prev, product];
    });
  };

  const removeFromFavorites = (productId: string) => {
    setFavorites((prev) => prev.filter((p) => p.id !== productId));
  };

  const isFavorite = (productId: string) => {
    return favorites.some((p) => p.id === productId);
  };

  const toggleFavorite = (product: Product) => {
    if (isFavorite(product.id)) {
      removeFromFavorites(product.id);
    } else {
      addToFavorites(product);
    }
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addToFavorites,
        removeFromFavorites,
        isFavorite,
        toggleFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}

