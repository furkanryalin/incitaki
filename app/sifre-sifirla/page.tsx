'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/components/ToastContainer';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Lock, Mail, Key, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function PasswordResetPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showToast } = useToast();
  
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [hasUrlToken, setHasUrlToken] = useState(false);

  // URL'den token varsa direkt reset adımına geç
  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken) {
      setToken(urlToken);
      setStep('reset');
      setHasUrlToken(true);
    }
  }, [searchParams]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        showToast('Şifre sıfırlama bağlantısı gönderildi!', 'success');
      } else {
        setError(data.error || 'Bir hata oluştu');
      }
    } catch (err) {
      setError('Şifre sıfırlanırken bir hata oluştu. Lütfen biraz sonra tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return;
    }

    if (newPassword.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        showToast('Şifreniz başarıyla sıfırlandı!', 'success');
        
        // 2 saniye sonra giriş sayfasına yönlendir
        setTimeout(() => {
          router.push('/giris');
        }, 2000);
      } else {
        setError(
          data.error ||
            'Bu şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş olabilir. Lütfen yeniden şifre sıfırlama isteği oluşturun.'
        );
      }
    } catch (err) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {step === 'email' ? (
              <>
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                    <Key className="w-8 h-8 text-orange-600" />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Şifremi Unuttum</h1>
                  <p className="text-gray-600">E-posta adresinize şifre sıfırlama bağlantısı göndereceğiz</p>
                </div>

                {success ? (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Bağlantı Gönderildi!</h2>
                    <p className="text-gray-600 mb-4">
                      Şifre sıfırlama bağlantısı gönderildi. E-posta kutunuzu kontrol edin.
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                      E-posta gelmediyse, spam klasörünü kontrol edin veya token'ı manuel olarak girebilirsiniz.
                    </p>
                    <button
                      onClick={() => setStep('reset')}
                      className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
                    >
                      Token ile Devam Et
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleEmailSubmit} className="space-y-6">
                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                      </div>
                    )}

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        E-posta Adresi
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          placeholder="ornek@email.com"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Gönderiliyor...' : 'Şifre Sıfırlama Bağlantısı Gönder'}
                    </button>

                    <div className="text-center">
                      <Link
                        href="/giris"
                        className="inline-flex items-center text-orange-600 hover:text-orange-700 font-medium"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Giriş sayfasına dön
                      </Link>
                    </div>
                  </form>
                )}
              </>
            ) : (
              <>
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                    <Lock className="w-8 h-8 text-orange-600" />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Yeni Şifre Belirle</h1>
                  <p className="text-gray-600">Yeni şifrenizi girin</p>
                </div>

                {success ? (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Şifre Sıfırlandı!</h2>
                    <p className="text-gray-600">Yeni şifrenizle giriş yapabilirsiniz.</p>
                  </div>
                ) : (
                  <form onSubmit={handleResetSubmit} className="space-y-6">
                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                      </div>
                    )}

                    {!hasUrlToken ? (
                      <div>
                        <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-2">
                          Token (Konsoldan kopyalayın)
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Key className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            id="token"
                            type="text"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="Token'ı buraya yapıştırın"
                            required
                          />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          Konsolda görünen token'ı buraya yapıştırın
                        </p>
                      </div>
                    ) : (
                      <div className="rounded-lg bg-orange-50 border border-orange-100 px-4 py-3 text-sm text-orange-700">
                        Bu sayfayı şifre sıfırlama bağlantısından açtığınız için doğrulama kodunuz otomatik olarak uygulandı.
                      </div>
                    )}

                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                        Yeni Şifre
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="newPassword"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          placeholder="En az 6 karakter"
                          required
                          minLength={6}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                        Şifre Tekrar
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="confirmPassword"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          placeholder="Şifrenizi tekrar girin"
                          required
                          minLength={6}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Sıfırlanıyor...' : 'Şifreyi Sıfırla'}
                    </button>

                    <div className="text-center">
                      <Link
                        href="/giris"
                        className="inline-flex items-center text-orange-600 hover:text-orange-700 font-medium"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Giriş sayfasına dön
                      </Link>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

