'use client';

import { useAdmin } from '@/context/AdminContext';
import { Users, Search } from 'lucide-react';
import { useState, useMemo } from 'react';

export default function UsersPage() {
  const { users, orders } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');

  // Orders'dan kullanıcıları çıkar
  const usersFromOrders = useMemo(() => {
    const userMap = new Map();
    orders.forEach((order) => {
      if (!userMap.has(order.customerEmail)) {
        userMap.set(order.customerEmail, {
          id: `user-${order.customerEmail}`,
          name: order.customerName,
          email: order.customerEmail,
          phone: order.customerPhone,
          address: order.customerAddress,
          totalOrders: 0,
          totalSpent: 0,
        });
      }
      const user = userMap.get(order.customerEmail);
      user.totalOrders += 1;
      user.totalSpent += order.totalPrice + order.shippingCost;
    });
    return Array.from(userMap.values());
  }, [orders]);

  const allUsers = [...users, ...usersFromOrders];
  const uniqueUsers = Array.from(
    new Map(allUsers.map(user => [user.email, user])).values()
  );

  const filteredUsers = uniqueUsers.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Kullanıcılar</h1>
        <p className="text-gray-600 mt-2">Tüm kullanıcıları görüntüleyin</p>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Kullanıcı ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-100">
        <div className="p-6">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Kullanıcı bulunamadı</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Kullanıcı
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      İletişim
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Toplam Sipariş
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Toplam Harcama
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-900">{user.phone || '-'}</div>
                        <div className="text-xs text-gray-500 line-clamp-1">
                          {user.address || '-'}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-semibold text-gray-900">
                          {user.totalOrders}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-semibold text-gray-900">
                          {user.totalSpent.toLocaleString('tr-TR')} ₺
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

