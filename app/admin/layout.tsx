'use client';

import { useAdmin } from '@/context/AdminContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  LogOut, 
  Menu,
  X,
  FolderTree,
  MessageSquare,
  Users,
  Plus,
  Percent
} from 'lucide-react';
import { useState } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Tüm hook'ları her zaman aynı sırada çağır
  const pathname = usePathname();
  const { isAuthenticated, mounted, logout } = useAdmin();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    // Sadece mounted olduktan sonra ve authenticated değilse yönlendir
    // Böylece sayfa yenilendiğinde mevcut sayfada kalır
    if (mounted && !isLoginPage && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [mounted, isAuthenticated, router, isLoginPage]);

  // Login sayfasında layout'u bypass et (hook çağrılarından sonra)
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Authentication state yüklenene kadar loading göster
  // Böylece sayfa yenilendiğinde mevcut sayfada kalır
  if (!mounted || (!isAuthenticated && !isLoginPage)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  const menuItems = [
    { href: '/admin', icon: LayoutDashboard, label: 'Dashboard', group: 'main' },
    { href: '/admin/products', icon: Package, label: 'Ürünler', group: 'main' },
    { href: '/admin/products/new', icon: Plus, label: 'Yeni Ürün', group: 'products' },
    { href: '/admin/products/discount', icon: Percent, label: 'Toplu İndirim', group: 'products' },
    { href: '/admin/categories', icon: FolderTree, label: 'Kategoriler', group: 'main' },
    { href: '/admin/orders', icon: ShoppingCart, label: 'Siparişler', group: 'main' },
    { href: '/admin/reviews', icon: MessageSquare, label: 'Yorumlar', group: 'main' },
    { href: '/admin/users', icon: Users, label: 'Kullanıcılar', group: 'main' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
        <div className="fixed left-0 top-0 bottom-0 w-64 bg-white shadow-xl">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-bold text-gray-900">Admin Panel</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href));
              const isSubmenu = item.group === 'products';
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors ${
                    isSubmenu ? 'pl-8 text-sm ml-4 border-l-2 border-orange-200' : ''
                  } ${isActive ? 'bg-orange-50 text-orange-600 font-semibold' : ''}`}
                >
                  <Icon className={`${isSubmenu ? 'w-4 h-4' : 'w-5 h-5'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Çıkış Yap</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:bg-white lg:border-r lg:border-gray-200 lg:z-30">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Admin Panel</h2>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href));
              const isSubmenu = item.group === 'products';
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors ${
                    isSubmenu ? 'pl-8 text-sm ml-4 border-l-2 border-orange-200' : ''
                  } ${isActive ? 'bg-orange-50 text-orange-600 font-semibold' : ''}`}
                >
                  <Icon className={`${isSubmenu ? 'w-4 h-4' : 'w-5 h-5'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Çıkış Yap</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex-1" />
            <div className="text-sm text-gray-600">
              Yönetim Paneli
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

