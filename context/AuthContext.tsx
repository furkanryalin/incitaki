'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser } from '@/types';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (updates: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load user from localStorage
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('auth_user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          console.error('Error parsing saved user:', e);
        }
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      // API response format: { success: true, data: { user: {...} } }
      const userData = data.data?.user || data.user;
      
      if (data.success && userData) {
        const authUser: AuthUser = {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          address: userData.address,
        };
        setUser(authUser);
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_user', JSON.stringify(authUser));
        }
        return { success: true };
      }
      
      // Hata mesajını döndür
      return {
        success: false,
        error: data.error || 'E-posta veya şifre hatalı',
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Giriş yapılırken bir hata oluştu',
      };
    }
  };

  const register = async (name: string, email: string, password: string, phone?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone }),
      });

      const data = await response.json();
      
      // API response format: { success: true, data: { user: {...} } }
      const userData = data.data?.user || data.user;
      
      if (data.success && userData) {
        const authUser: AuthUser = {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          address: userData.address,
        };
        setUser(authUser);
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_user', JSON.stringify(authUser));
        }
        return { success: true };
      }
      
      // Hata mesajını döndür
      return {
        success: false,
        error: data.error || 'Kayıt başarısız',
      };
    } catch (error) {
      console.error('Register error:', error);
      return {
        success: false,
        error: 'Kayıt yapılırken bir hata oluştu',
      };
    }
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_user');
    }
  };

  const updateUser = (updates: Partial<AuthUser>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_user', JSON.stringify(updatedUser));
      }
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

