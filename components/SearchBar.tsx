'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Product } from '@/types';
import Link from 'next/link';
import Image from 'next/image';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (query.length > 2) {
      setLoading(true);
      const timeoutId = setTimeout(() => {
        const controller = new AbortController();
        
        fetch(`/api/products?search=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        })
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
            setResults((data.products || []).slice(0, 5));
            setIsOpen(true);
            setLoading(false);
          })
          .catch(err => {
            // AbortError'u ignore et (component unmount olduğunda)
            if (err.name !== 'AbortError') {
              console.error('Error searching products:', err);
              setResults([]);
              setIsOpen(false);
              setLoading(false);
            }
          });
        
        return () => controller.abort();
      }, 300); // Debounce 300ms

      return () => clearTimeout(timeoutId);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/urunler?search=${encodeURIComponent(query)}`);
      setIsOpen(false);
      setQuery('');
    }
  };

  return (
    <div ref={searchRef} className="relative flex-1 max-w-2xl mx-2 lg:mx-4">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ürün ara..."
          className="w-full px-3 sm:px-4 py-1.5 sm:py-2 pl-8 sm:pl-10 pr-8 sm:pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none text-sm sm:text-base"
        />
        <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        )}
      </form>

      {/* Search Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
          {results.map((product) => (
            <Link
              key={product.id}
              href={`/urun/${product.id}`}
              onClick={() => {
                setIsOpen(false);
                setQuery('');
              }}
              className="flex items-center gap-4 p-4 hover:bg-orange-50 transition-colors border-b border-gray-100 last:border-b-0"
            >
              <div className="relative w-16 h-16 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      if (target.nextElementSibling) {
                        (target.nextElementSibling as HTMLElement).style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 ${product.image ? 'hidden' : ''}`}>
                  <span className="text-2xl">💎</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 truncate break-words">{product.name}</h4>
                <p className="text-sm text-gray-600 truncate break-words">{product.description}</p>
                <p className="text-sm font-bold text-orange-600 mt-1 truncate">
                  {product.price.toLocaleString('tr-TR')} ₺
                </p>
              </div>
            </Link>
          ))}
          {results.length === 5 && (
            <Link
              href={`/urunler?search=${encodeURIComponent(query)}`}
              onClick={() => {
                setIsOpen(false);
                setQuery('');
              }}
              className="block p-4 text-center text-orange-600 font-semibold hover:bg-orange-50 transition-colors"
            >
              Tüm sonuçları gör
            </Link>
          )}
        </div>
      )}

      {isOpen && query && !loading && results.length === 0 && query.length > 2 && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-200 z-50 p-4 text-center text-gray-600">
          Sonuç bulunamadı
        </div>
      )}

      {loading && query.length > 2 && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-200 z-50 p-4 text-center text-gray-600">
          Aranıyor...
        </div>
      )}
    </div>
  );
}

