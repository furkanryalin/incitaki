'use client';

import { useAdmin } from '@/context/AdminContext';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Phone, Mail, Package } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { orders, updateOrderStatus, deleteOrder } = useAdmin();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const order = orders.find((o) => o.id === params.id);

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Sipariş bulunamadı</p>
        <Link
          href="/admin/orders"
          className="mt-4 inline-block text-orange-600 hover:text-orange-700"
        >
          Siparişlere Dön
        </Link>
      </div>
    );
  }

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const statusLabels = {
    pending: 'Beklemede',
    processing: 'İşleniyor',
    shipped: 'Kargoda',
    delivered: 'Teslim Edildi',
    cancelled: 'İptal Edildi',
  };

  const handleStatusChange = (newStatus: string) => {
    updateOrderStatus(
      order.id,
      newStatus as 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
    );
  };

  const handleDelete = () => {
    deleteOrder(order.id);
    router.push('/admin/orders');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/orders"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sipariş Detayı</h1>
          <p className="text-gray-600 mt-1">Sipariş No: {order.orderNumber}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Sipariş Ürünleri</h2>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate break-words">{item.product.name}</h3>
                    <p className="text-sm text-gray-600 truncate">Adet: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">
                      {(item.product.price * item.quantity).toLocaleString('tr-TR')} ₺
                    </div>
                    <div className="text-sm text-gray-500">
                      {item.product.price.toLocaleString('tr-TR')} ₺ / adet
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Müşteri Bilgileri</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Package className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{order.customerName}</div>
                  <div className="text-sm text-gray-600">{order.customerEmail}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Phone className="w-5 h-5 text-gray-600" />
                </div>
                <div className="text-gray-900">{order.customerPhone}</div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <MapPin className="w-5 h-5 text-gray-600" />
                </div>
                <div className="text-gray-900">{order.customerAddress}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Status */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Sipariş Durumu</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durum
                </label>
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className={`w-full px-4 py-2 text-sm font-semibold rounded-lg border-0 focus:ring-2 focus:ring-orange-500 ${
                    statusColors[order.status]
                  }`}
                >
                  <option value="pending">Beklemede</option>
                  <option value="processing">İşleniyor</option>
                  <option value="shipped">Kargoda</option>
                  <option value="delivered">Teslim Edildi</option>
                  <option value="cancelled">İptal Edildi</option>
                </select>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600 mb-1">Oluşturulma</div>
                <div className="font-medium text-gray-900">
                  {new Date(order.createdAt).toLocaleString('tr-TR')}
                </div>
              </div>
              {order.updatedAt !== order.createdAt && (
                <div>
                  <div className="text-sm text-gray-600 mb-1">Son Güncelleme</div>
                  <div className="font-medium text-gray-900">
                    {new Date(order.updatedAt).toLocaleString('tr-TR')}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Sipariş Özeti</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-gray-700">
                <span>Ara Toplam</span>
                <span>{order.totalPrice.toLocaleString('tr-TR')} ₺</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Kargo</span>
                <span>
                  {order.shippingCost === 0
                    ? 'Ücretsiz'
                    : `${order.shippingCost.toLocaleString('tr-TR')} ₺`}
                </span>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <div className="flex justify-between font-bold text-gray-900">
                  <span>Toplam</span>
                  <span>
                    {(order.totalPrice + order.shippingCost).toLocaleString('tr-TR')} ₺
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">İşlemler</h2>
            <div className="space-y-3">
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                >
                  Siparişi Sil
                </button>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Silmek istediğinize emin misiniz?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDelete}
                      className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Evet, Sil
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      İptal
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

