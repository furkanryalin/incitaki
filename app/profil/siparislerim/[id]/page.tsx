'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumb from '@/components/Breadcrumb';
import { useAuth } from '@/context/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Order } from '@/types';
import { ChevronLeft, Package, Calendar, Truck, MapPin, Phone, Mail, CheckCircle, XCircle, Clock } from 'lucide-react';
import Link from 'next/link';

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'Beklemede', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  processing: { label: 'Hazırlanıyor', color: 'bg-blue-100 text-blue-800', icon: Package },
  shipped: { label: 'Kargoda', color: 'bg-purple-100 text-purple-800', icon: Truck },
  delivered: { label: 'Teslim Edildi', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  cancelled: { label: 'İptal Edildi', color: 'bg-red-100 text-red-800', icon: XCircle },
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const orderId = params?.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/giris');
      return;
    }

    if (orderId) {
      fetchOrder();
    }
  }, [orderId, isAuthenticated, router]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/user/orders?userId=${user?.id}`);
      const data = await response.json();
      if (data.orders) {
        const foundOrder = data.orders.find((o: Order) => o.id === orderId);
        if (foundOrder) {
          setOrder(foundOrder);
        }
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-grow py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-12 animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8" />
              <div className="h-64 bg-gray-200 rounded" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-grow py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-12 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Sipariş bulunamadı</h2>
              <Link
                href="/profil/siparislerim"
                className="text-orange-600 hover:text-orange-700 font-medium"
              >
                Siparişlerime Dön
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const status = statusConfig[order.status] || statusConfig.pending;
  const StatusIcon = status.icon;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow py-8 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[
              { label: 'Ana Sayfa', href: '/' },
              { label: 'Profilim', href: '/profil' },
              { label: 'Siparişlerim', href: '/profil/siparislerim' },
              { label: `Sipariş #${order.orderNumber}` },
            ]}
          />

          <div className="mt-8 mb-6">
            <Link
              href="/profil/siparislerim"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Siparişlerime Dön</span>
            </Link>
          </div>

          {/* Order Header */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Sipariş #{order.orderNumber}
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(order.createdAt).toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 w-fit ${status.color}`}>
                <StatusIcon className="w-4 h-4" />
                {status.label}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Order Items */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Sipariş Detayları</h2>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex gap-4 pb-4 border-b border-gray-200 last:border-0">
                      <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
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
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 break-words">{item.product.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">
                          Adet: {item.quantity} × {item.product.price.toLocaleString('tr-TR')} ₺
                        </p>
                        <p className="text-lg font-bold text-gray-900">
                          {(item.product.price * item.quantity).toLocaleString('tr-TR')} ₺
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Müşteri Bilgileri</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Package className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Ad Soyad</p>
                      <p className="font-semibold text-gray-900">{order.customerName}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">E-posta</p>
                      <p className="font-semibold text-gray-900">{order.customerEmail}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Telefon</p>
                      <p className="font-semibold text-gray-900">{order.customerPhone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Teslimat Adresi</p>
                      <p className="font-semibold text-gray-900">{order.customerAddress}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Sipariş Özeti</h2>
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-700">
                    <span>Ara Toplam</span>
                    <span className="font-semibold">{order.totalPrice.toLocaleString('tr-TR')} ₺</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Kargo</span>
                    <span className="font-semibold">
                      {order.shippingCost === 0 ? 'Ücretsiz' : `${order.shippingCost.toLocaleString('tr-TR')} ₺`}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex justify-between font-bold text-gray-900 text-lg">
                      <span>Toplam</span>
                      <span className="text-orange-600">
                        {(order.totalPrice + order.shippingCost).toLocaleString('tr-TR')} ₺
                      </span>
                    </div>
                  </div>
                </div>
                {order.notes && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">Notlar:</p>
                    <p className="text-sm text-gray-900">{order.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

