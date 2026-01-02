'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Facebook, Instagram, Twitter, Mail, Phone } from 'lucide-react';
import { Category } from '@/types';

export default function Footer() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch('/api/admin/categories')
      .then(res => res.json())
      .then(data => {
        // API response format: { success: true, data: { categories: [...] } }
        const categories = data.success && data.data?.categories ? data.data.categories : data.categories || [];
        if (categories.length > 0) {
          setCategories(categories.slice(0, 6)); // İlk 6 kategoriyi göster
        }
      })
      .catch(err => console.error('Error loading categories:', err));
  }, []);
  return (
    <footer className="bg-gradient-to-br from-gray-50 via-white to-orange-50/30 border-t border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {/* Company Info */}
          <div>
            <Link href="/" className="block mb-4">
              <img 
                src="/incitakilogo.png" 
                alt="İnci Takı" 
                className="h-10 sm:h-12 w-auto object-contain hover:opacity-90 transition-opacity"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  if (target.nextElementSibling) {
                    (target.nextElementSibling as HTMLElement).style.display = 'block';
                  }
                }}
              />
              <h3 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent hidden">💎 İnci Takı</h3>
            </Link>
            <p className="text-sm text-gray-700 mb-4">
              Geniş ürün yelpazemizle hayatınıza değer katıyoruz. 
              Her ürünümüz özenle seçilmiş ve garantilidir.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-600 hover:text-orange-600 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-600 hover:text-orange-600 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-600 hover:text-orange-600 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-gray-900 font-semibold mb-4">Kategoriler</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/kategoriler" className="text-gray-700 hover:text-orange-600 transition-colors">
                  Tüm Kategoriler
                </Link>
              </li>
              {categories.map((category) => (
                <li key={category.id}>
                  <Link 
                    href={`/kategoriler/${category.slug}`} 
                    className="text-gray-700 hover:text-orange-600 transition-colors"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-gray-900 font-semibold mb-4">Müşteri Hizmetleri</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/iletisim" className="text-gray-700 hover:text-orange-600 transition-colors">
                  İletişim
                </Link>
              </li>
              <li>
                <Link href="/kargo" className="text-gray-700 hover:text-orange-600 transition-colors">
                  Kargo ve Teslimat
                </Link>
              </li>
              <li>
                <Link href="/iade" className="text-gray-700 hover:text-orange-600 transition-colors">
                  İade ve Değişim
                </Link>
              </li>
              <li>
                <Link href="/sss" className="text-gray-700 hover:text-orange-600 transition-colors">
                  Sık Sorulan Sorular
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-gray-900 font-semibold mb-4">İletişim</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-gray-700">
                <Phone className="w-4 h-4 text-orange-600" />
                <span>0850 123 45 67</span>
              </li>
              <li className="flex items-center gap-2 text-gray-700">
                <Mail className="w-4 h-4 text-orange-600" />
                <span>info@incitaki.com</span>
              </li>
            </ul>
            <p className="text-sm mt-4 text-gray-600">
              Pazartesi - Cumartesi: 09:00 - 18:00
            </p>
          </div>
        </div>

        <div className="border-t border-orange-200 mt-8 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex flex-wrap gap-4 justify-center md:justify-start text-xs sm:text-sm">
              <Link href="/sozlesmeler" className="text-gray-600 hover:text-orange-600 transition-colors">
                Mesafeli Satış Sözleşmesi
              </Link>
              <Link href="/gizlilik" className="text-gray-600 hover:text-orange-600 transition-colors">
                Gizlilik Politikası
              </Link>
              <Link href="/kullanim-kosullari" className="text-gray-600 hover:text-orange-600 transition-colors">
                Kullanım Koşulları
              </Link>
              <Link href="/cerez-politikasi" className="text-gray-600 hover:text-orange-600 transition-colors">
                Çerez Politikası
              </Link>
            </div>
          </div>
          <div className="text-center text-sm text-gray-600">
            <p>&copy; 2024 İnci Takı. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

