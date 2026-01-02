import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center py-16 px-4">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center w-32 h-32 bg-orange-100 rounded-full mb-8">
            <span className="text-7xl">🔍</span>
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-gray-900 mb-4">
            404
          </h1>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
            Sayfa Bulunamadı
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
            Aradığınız sayfa mevcut değil veya taşınmış olabilir. Ana sayfaya dönerek aramaya devam edebilirsiniz.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Home className="w-5 h-5" />
              Ana Sayfaya Dön
            </Link>
            <Link
              href="/urunler"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-orange-600 font-semibold rounded-xl border-2 border-orange-600 hover:bg-orange-50 transition-all shadow-lg hover:shadow-xl"
            >
              <Search className="w-5 h-5" />
              Ürünleri Keşfet
            </Link>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-4">Popüler Sayfalar:</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/kategoriler" className="text-orange-600 hover:text-orange-700 font-medium text-sm">
                Kategoriler
              </Link>
              <span className="text-gray-300">•</span>
              <Link href="/hakkimizda" className="text-orange-600 hover:text-orange-700 font-medium text-sm">
                Hakkımızda
              </Link>
              <span className="text-gray-300">•</span>
              <Link href="/iletisim" className="text-orange-600 hover:text-orange-700 font-medium text-sm">
                İletişim
              </Link>
              <span className="text-gray-300">•</span>
              <Link href="/sss" className="text-orange-600 hover:text-orange-700 font-medium text-sm">
                SSS
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

