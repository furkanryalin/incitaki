'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumb from '@/components/Breadcrumb';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ToastContainer';
import { Package, ChevronLeft, Eye, Calendar, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Order } from '@/types';
import Image from 'next/image';

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'Beklemede', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  processing: { label: 'Hazırlanıyor', color: 'bg-blue-100 text-blue-800', icon: Package },
  shipped: { label: 'Kargoda', color: 'bg-purple-100 text-purple-800', icon: Truck },
  delivered: { label: 'Teslim Edildi', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  cancelled: { label: 'İptal Edildi', color: 'bg-red-100 text-red-800', icon: XCircle },
};

export default function OrdersPage() {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/giris');
      return;
    }

    if (user) {
      fetchOrders();
    }
  }, [user, isAuthenticated, router]);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`/api/user/orders?userId=${user?.id}`);
      const data = await response.json();
      if (data.orders) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      showToast('Siparişler yüklenirken bir hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow py-8 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[
              { label: 'Ana Sayfa', href: '/' },
              { label: 'Profilim', href: '/profil' },
              { label: 'Siparişlerim' },
            ]}
          />

          <div className="mt-8 flex items-center gap-4 mb-6">
            <Link
              href="/profil"
              className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Profilime Dön</span>
            </Link>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-8">Siparişlerim</h1>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow-md border border-gray-100 p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-1/4 mb-4" />
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-6" />
                  <div className="h-20 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-12 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Henüz siparişiniz yok</h2>
              <p className="text-gray-600 mb-6">İlk siparişinizi vermek için alışverişe başlayın!</p>
              <Link
                href="/urunler"
                className="inline-flex items-center px-6 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors"
              >
                Alışverişe Başla
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const status = statusConfig[order.status] || statusConfig.pending;
                const StatusIcon = status.icon;

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden"
                  >
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-gray-900">
                              Sipariş #{order.orderNumber}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${status.color}`}>
                              <StatusIcon className="w-3 h-3" />
                              {status.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(order.createdAt).toLocaleDateString('tr-TR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </div>
                            <div className="flex items-center gap-1">
                              <Package className="w-4 h-4" />
                              {order.items.length} Ürün
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-gray-900 mb-1">
                            {(order.totalPrice + order.shippingCost).toLocaleString('tr-TR')} ₺
                          </p>
                          <p className="text-sm text-gray-600">
                            Kargo: {order.shippingCost === 0 ? 'Ücretsiz' : `${order.shippingCost} ₺`}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="space-y-4 mb-6">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex gap-4">
                            <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                              <img
                                src={item.product.image}
                                alt={item.product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                                {item.product.name}
                              </h4>
                              <p className="text-sm text-gray-600 mb-2">
                                Adet: {item.quantity} × {item.product.price.toLocaleString('tr-TR')} ₺
                              </p>
                              <p className="text-sm font-semibold text-gray-900">
                                {(item.product.price * item.quantity).toLocaleString('tr-TR')} ₺
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="text-sm text-gray-600">
                            <p className="font-semibold text-gray-900 mb-1">Teslimat Adresi:</p>
                            <p>{order.customerAddress}</p>
                          </div>
                          <Link
                            href={`/profil/siparislerim/${order.id}`}
                            className="inline-flex items-center gap-2 px-4 py-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors font-medium"
                          >
                            <Eye className="w-4 h-4" />
                            Detayları Görüntüle
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

