'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumb from '@/components/Breadcrumb';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ToastContainer';
import { User, Package, MapPin, Settings, LogOut, ShoppingBag, CreditCard, Heart, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [profileData, setProfileData] = useState<{
    totalOrders: number;
    totalSpent: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/giris');
      return;
    }

    if (user) {
      fetchUserProfile();
    }
  }, [user, isAuthenticated, router]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`/api/user/profile?userId=${user?.id}`);
      const data = await response.json();
      if (data.user) {
        setProfileData({
          totalOrders: data.user.totalOrders || 0,
          totalSpent: data.user.totalSpent || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    showToast('Başarıyla çıkış yaptınız', 'success');
    router.push('/');
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  const menuItems = [
    {
      title: 'Siparişlerim',
      description: 'Tüm siparişlerinizi görüntüleyin ve takip edin',
      icon: Package,
      href: '/profil/siparislerim',
      color: 'text-blue-600 bg-blue-50',
    },
    {
      title: 'Adreslerim',
      description: 'Kayıtlı adreslerinizi yönetin',
      icon: MapPin,
      href: '/profil/adreslerim',
      color: 'text-green-600 bg-green-50',
    },
    {
      title: 'Favorilerim',
      description: 'Beğendiğiniz ürünleri görüntüleyin',
      icon: Heart,
      href: '/favoriler',
      color: 'text-red-600 bg-red-50',
    },
    {
      title: 'Profil Ayarları',
      description: 'Kişisel bilgilerinizi ve şifrenizi güncelleyin',
      icon: Settings,
      href: '/profil/ayarlar',
      color: 'text-purple-600 bg-purple-50',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow py-8 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[
              { label: 'Ana Sayfa', href: '/' },
              { label: 'Profilim' },
            ]}
          />

          <div className="mt-8">
            {/* Profile Header */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 sm:p-8 mb-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white text-3xl sm:text-4xl font-bold shadow-lg">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{user.name}</h1>
                  <p className="text-gray-600 mb-1">{user.email}</p>
                  {user.phone && (
                    <p className="text-gray-600">{user.phone}</p>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="hidden sm:inline">Çıkış Yap</span>
                </button>
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Toplam Sipariş</p>
                    {loading ? (
                      <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
                    ) : (
                      <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                        {profileData?.totalOrders || 0}
                      </p>
                    )}
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Toplam Harcama</p>
                    {loading ? (
                      <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
                    ) : (
                      <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                        {(profileData?.totalSpent || 0).toLocaleString('tr-TR')} ₺
                      </p>
                    )}
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-all group"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${item.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-orange-600 transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-orange-600 transition-colors flex-shrink-0 mt-1" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

