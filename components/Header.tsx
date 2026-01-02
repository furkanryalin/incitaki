'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useAuth } from '@/context/AuthContext';
import { ShoppingCart, Menu, X, Heart, User, LogOut, ChevronDown, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import SearchBar from './SearchBar';
import { useRouter } from 'next/navigation';
import { Category, SubCategory } from '@/types';

export default function Header() {
  const { getTotalItems } = useCart();
  const { favorites } = useFavorites();
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [categoriesMenuOpen, setCategoriesMenuOpen] = useState(false);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const totalItems = getTotalItems();
  const favoriteCount = favorites.length;

  // Load categories from API
  useEffect(() => {
    const controller = new AbortController();
    
    fetch('/api/admin/categories', { signal: controller.signal })
      .then(async res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Response is not JSON');
        }
        return res.json();
      })
      .then(data => {
        // API response format: { success: true, data: { categories: [...] } }
        const categories = data.success && data.data?.categories ? data.data.categories : data.categories || [];
        if (categories.length > 0) {
          setCategories(categories);
          // Varsayılan olarak tüm kategorileri açık yap
          const allCategoryIds = new Set<string>(categories.map((cat: Category) => cat.id));
          setExpandedCategories(allCategoryIds);
        }
      })
      .catch(err => {
        // AbortError'u ignore et (component unmount olduğunda)
        if (err.name !== 'AbortError') {
          console.error('Error loading categories:', err);
          // Hata durumunda boş array set et
          setCategories([]);
        }
      });
    
    return () => {
      controller.abort();
    };
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const navLinks = [
    { href: '/', label: 'Ana Sayfa' },
    { href: '/urunler', label: 'Ürünler' },
    { href: '/kategoriler', label: 'Kategoriler' },
    { href: '/son-baktiklarim', label: 'Son Baktıklarım' },
    { href: '/hakkimizda', label: 'Hakkımızda' },
    { href: '/iletisim', label: 'İletişim' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/98 backdrop-blur-md shadow-sm border-b border-gray-200/50">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-8">
        <div className="flex h-16 sm:h-20 items-center justify-between gap-2">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-1 sm:space-x-2 group flex-shrink-0">
            <img 
              src="/incitakilogo.png" 
              alt="İnci Takı" 
              className="h-10 sm:h-12 md:h-14 w-auto object-contain group-hover:opacity-90 transition-opacity"
              onError={(e) => {
                // Fallback to text if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                if (target.nextElementSibling) {
                  (target.nextElementSibling as HTMLElement).style.display = 'block';
                }
              }}
            />
            <div className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent group-hover:from-orange-700 group-hover:to-orange-800 transition-all hidden">
              💎 İnci Takı
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:block flex-1 max-w-2xl mx-4 lg:mx-8">
            <SearchBar />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex md:items-center md:space-x-1">
            {navLinks.map((link) => {
              if (link.href === '/kategoriler') {
                return (
                  <div
                    key={link.href}
                    className="relative"
                    onMouseEnter={() => setCategoriesMenuOpen(true)}
                    onMouseLeave={() => setCategoriesMenuOpen(false)}
                  >
                    <button
                      onClick={() => setCategoriesMenuOpen(!categoriesMenuOpen)}
                      className="flex items-center gap-1 px-2 sm:px-3 md:px-4 py-2 text-xs sm:text-sm font-semibold text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200 overflow-hidden"
                    >
                      <span className="truncate">{link.label}</span>
                      <ChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform flex-shrink-0 ${categoriesMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {categoriesMenuOpen && categories.length > 0 && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setCategoriesMenuOpen(false)}
                        />
                        <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                          <Link
                            href="/kategoriler"
                            className="block px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-orange-50 hover:text-orange-600 transition-colors border-b border-gray-100"
                            onClick={() => setCategoriesMenuOpen(false)}
                          >
                            Tüm Kategoriler
                          </Link>
                          <div className="max-h-96 overflow-y-auto">
                            {categories.map((category) => {
                              const isExpanded = expandedCategories.has(category.id);
                              const hasSubCategories = category.subCategories && category.subCategories.length > 0;
                              
                              return (
                                <div key={category.id} className="group">
                                  <div
                                    className={`flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors ${hasSubCategories ? 'cursor-pointer' : ''}`}
                                    onClick={(e) => {
                                      if (hasSubCategories) {
                                        e.preventDefault();
                                        const newExpanded = new Set(expandedCategories);
                                        if (isExpanded) {
                                          newExpanded.delete(category.id);
                                        } else {
                                          newExpanded.add(category.id);
                                        }
                                        setExpandedCategories(newExpanded);
                                      }
                                    }}
                                  >
                                    <Link
                                      href={`/kategoriler/${category.slug}`}
                                      className="flex-1 min-w-0"
                                      onClick={(e) => {
                                        if (!hasSubCategories) {
                                          setCategoriesMenuOpen(false);
                                        }
                                      }}
                                    >
                                      <span className="truncate break-words">{category.name}</span>
                                    </Link>
                                    {hasSubCategories && (
                                      <ChevronDown className={`w-4 h-4 text-gray-400 group-hover:text-orange-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                    )}
                                  </div>
                                  {hasSubCategories && isExpanded && (
                                    <div className="pl-4 bg-gray-50">
                                      {category.subCategories!.map((subCat) => (
                                        <Link
                                          key={subCat.id}
                                          href={`/kategoriler/${category.slug}?subCategory=${subCat.id}`}
                                          className="block px-4 py-2 text-xs text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-colors truncate break-words"
                                          onClick={() => setCategoriesMenuOpen(false)}
                                        >
                                          {subCat.name}
                                        </Link>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );
              }
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-2 sm:px-3 md:px-4 py-2 text-xs sm:text-sm font-semibold text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200 truncate"
                >
                  <span className="truncate">{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Cart, Favorites, User & Mobile Menu */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Link
              href="/favoriler"
              className="relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-200"
            >
              <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
              {favoriteCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-red-600 text-[10px] sm:text-xs font-bold text-white shadow-lg">
                  {favoriteCount > 9 ? '9+' : favoriteCount}
                </span>
              )}
            </Link>
            <Link
              href="/sepet"
              className="relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-all duration-200"
            >
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-gradient-to-r from-orange-600 to-orange-700 text-[10px] sm:text-xs font-bold text-white shadow-lg animate-pulse">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-all duration-200"
                >
                  <User className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-semibold text-gray-900 truncate break-words">{user?.name}</p>
                        <p className="text-xs text-gray-500 truncate break-words">{user?.email}</p>
                      </div>
                      <Link
                        href="/profil"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        Profilim
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Çıkış Yap
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                href="/giris"
                className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-all duration-200"
                title="Giriş Yap"
              >
                <User className="w-5 h-5 sm:w-6 sm:h-6" />
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-gray-700 hover:text-orange-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t bg-white">
            {/* Mobile Search */}
            <div className="px-4 mb-4">
              <SearchBar />
            </div>
            <nav>
              {navLinks.map((link) => {
                if (link.href === '/kategoriler') {
                  return (
                    <div key={link.href}>
                      <button
                        onClick={() => setMobileCategoriesOpen(!mobileCategoriesOpen)}
                        className="w-full flex items-center justify-between py-3 px-4 text-sm font-semibold text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
                      >
                        <span className="truncate break-words flex-1">{link.label}</span>
                        <ChevronDown className={`w-4 h-4 transition-transform flex-shrink-0 ${mobileCategoriesOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {mobileCategoriesOpen && categories.length > 0 && (
                        <div className="bg-gray-50">
                          <Link
                            href="/kategoriler"
                            className="block py-2 px-8 text-sm font-medium text-gray-900 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                            onClick={() => {
                              setMobileMenuOpen(false);
                              setMobileCategoriesOpen(false);
                            }}
                          >
                            Tüm Kategoriler
                          </Link>
                          {categories.map((category) => (
                            <div key={category.id}>
                              <Link
                                href={`/kategoriler/${category.slug}`}
                                className="block py-2 px-8 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                                onClick={() => {
                                  setMobileMenuOpen(false);
                                  setMobileCategoriesOpen(false);
                                }}
                              >
                                {category.name}
                              </Link>
                              {category.subCategories && category.subCategories.length > 0 && (
                                <div className="bg-gray-100">
                                  {category.subCategories.map((subCat) => (
                                    <Link
                                      key={subCat.id}
                                      href={`/kategoriler/${category.slug}?subCategory=${subCat.id}`}
                                      className="block py-2 px-12 text-xs text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                                      onClick={() => {
                                        setMobileMenuOpen(false);
                                        setMobileCategoriesOpen(false);
                                      }}
                                    >
                                      {subCat.name}
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block py-3 px-4 text-sm font-semibold text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="truncate">{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

