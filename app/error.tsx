'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center py-16 px-4">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center w-32 h-32 bg-red-100 rounded-full mb-8">
            <AlertTriangle className="w-16 h-16 text-red-600" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">
            Bir Hata Oluştu
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Üzgünüz, beklenmeyen bir hata oluştu.
          </p>
          {process.env.NODE_ENV === 'development' && error.message && (
            <p className="text-sm text-gray-500 mb-8 font-mono bg-gray-100 p-4 rounded-lg">
              {error.message}
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <RefreshCw className="w-5 h-5" />
              Tekrar Dene
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-orange-600 font-semibold rounded-xl border-2 border-orange-600 hover:bg-orange-50 transition-all shadow-lg hover:shadow-xl"
            >
              <Home className="w-5 h-5" />
              Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

