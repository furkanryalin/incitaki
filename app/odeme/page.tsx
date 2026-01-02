'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/components/ToastContainer';
import { useAuth } from '@/context/AuthContext';
import { ShoppingBag, CheckCircle, CreditCard, Truck, MapPin, User, Mail, Phone, Lock, Shield, ArrowRight, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Order } from '@/types';
import Breadcrumb from '@/components/Breadcrumb';

type CheckoutStep = 'info' | 'payment' | 'review';

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { showToast } = useToast();
  const { user, isAuthenticated } = useAuth();
  
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('info');
  const [formData, setFormData] = useState({
    customerName: user?.name || '',
    customerEmail: user?.email || '',
    customerPhone: user?.phone || '',
    customerAddress: '',
    city: '',
    district: '',
    postalCode: '',
    paymentMethod: 'credit-card' as 'credit-card' | 'bank-transfer',
    cardNumber: '',
    cardName: '',
    cardExpiry: '',
    cardCvv: '',
    notes: '',
    agreeTerms: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const totalPrice = getTotalPrice();
  const shippingCost = totalPrice >= 500 ? 0 : 50;
  const finalTotal = totalPrice + shippingCost;

  // Update form when user logs in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        customerName: user.name || prev.customerName,
        customerEmail: user.email || prev.customerEmail,
        customerPhone: user.phone || prev.customerPhone,
      }));
    }
  }, [user]);

  if (cartItems.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow py-16">
          <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Sepetiniz Boş</h1>
              <p className="text-gray-600 mb-8">Ödeme yapmak için sepete ürün ekleyin.</p>
              <Link
                href="/urunler"
                className="inline-flex items-center px-6 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors"
              >
                Alışverişe Başla
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow py-16">
          <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
            <Breadcrumb
              items={[
                { label: 'Ana Sayfa', href: '/' },
                { label: 'Sepet', href: '/sepet' },
                { label: 'Sipariş Onayı' },
              ]}
            />
            <div className="text-center bg-white rounded-xl shadow-lg p-8 mt-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Siparişiniz Alındı! 🎉</h1>
              <p className="text-lg text-gray-700 mb-2">
                Sipariş Numaranız: <strong className="text-orange-600">{orderNumber}</strong>
              </p>
              <p className="text-gray-600 mb-8">
                Siparişiniz en kısa sürede hazırlanacak ve size bilgi verilecektir.
                E-posta adresinize sipariş detayları gönderilmiştir.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/urunler"
                  className="inline-flex items-center justify-center px-6 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Alışverişe Devam Et
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Ana Sayfa
                </Link>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleNext = () => {
    if (currentStep === 'info') {
      // Validate info step
      if (!formData.customerName || !formData.customerEmail || !formData.customerPhone || !formData.customerAddress) {
        showToast('Lütfen tüm zorunlu alanları doldurun', 'error');
        return;
      }
      setCurrentStep('payment');
    } else if (currentStep === 'payment') {
      // Validate payment step
      if (formData.paymentMethod === 'credit-card') {
        if (!formData.cardNumber || !formData.cardName || !formData.cardExpiry || !formData.cardCvv) {
          showToast('Lütfen kart bilgilerini doldurun', 'error');
          return;
        }
      }
      if (!formData.agreeTerms) {
        showToast('Lütfen şartları kabul edin', 'error');
        return;
      }
      setCurrentStep('review');
    }
  };

  const handleBack = () => {
    if (currentStep === 'payment') {
      setCurrentStep('info');
    } else if (currentStep === 'review') {
      setCurrentStep('payment');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Final validation before submission
      const { checkoutSchema } = await import('@/lib/validations/checkout');
      const validatedData = checkoutSchema.parse({
        customerInfo: {
          customerName: formData.customerName,
          customerEmail: formData.customerEmail,
          customerPhone: formData.customerPhone,
          customerAddress: formData.customerAddress,
          city: formData.city,
          district: formData.district,
          postalCode: formData.postalCode,
        },
        paymentMethod: formData.paymentMethod,
        cardData: formData.paymentMethod === 'credit-card' ? {
          cardNumber: formData.cardNumber,
          cardName: formData.cardName,
          cardExpiry: formData.cardExpiry,
          cardCvv: formData.cardCvv,
        } : undefined,
        agreeTerms: formData.agreeTerms,
        notes: formData.notes,
      });

      // Prepare payment request
      const paymentRequest = {
        orderData: {
          customerName: validatedData.customerInfo.customerName,
          customerEmail: validatedData.customerInfo.customerEmail,
          customerPhone: validatedData.customerInfo.customerPhone,
          shippingAddress: `${validatedData.customerInfo.customerAddress}, ${validatedData.customerInfo.district}, ${validatedData.customerInfo.city} ${validatedData.customerInfo.postalCode || ''}`,
          city: validatedData.customerInfo.city,
          district: validatedData.customerInfo.district,
          postalCode: validatedData.customerInfo.postalCode,
          notes: validatedData.notes,
        },
        paymentMethod: validatedData.paymentMethod,
        cardData: validatedData.cardData,
        items: cartItems.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
        })),
        totalPrice,
        shippingCost,
      };

      // Process payment via API
      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentRequest),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || result.message || 'Ödeme işlemi sırasında bir hata oluştu');
      }

      // Clear cart
      clearCart();
      
      // Show success
      showToast(result.message || 'Ödeme başarılı! Siparişiniz oluşturuldu.', 'success');
      
      setOrderNumber(result.data.order.orderNumber);
      setOrderPlaced(true);
    } catch (error: any) {
      console.error('Payment processing error:', error);
      if (error.errors && error.errors[0]) {
        showToast(error.errors[0].message, 'error');
      } else {
        showToast(error.message || 'Ödeme işlemi sırasında bir hata oluştu', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { id: 'info', label: 'Teslimat Bilgileri', icon: MapPin },
    { id: 'payment', label: 'Ödeme', icon: CreditCard },
    { id: 'review', label: 'Özet', icon: CheckCircle },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow py-8 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[
              { label: 'Ana Sayfa', href: '/' },
              { label: 'Sepet', href: '/sepet' },
              { label: 'Ödeme' },
            ]}
          />
          
          <h1 className="text-3xl font-bold text-gray-900 mb-8 mt-4">Ödeme</h1>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                const isActive = steps.findIndex(s => s.id === currentStep) === index;
                const isCompleted = steps.findIndex(s => s.id === currentStep) > index;
                
                return (
                  <div key={step.id} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                          isActive
                            ? 'bg-orange-600 border-orange-600 text-white'
                            : isCompleted
                            ? 'bg-green-600 border-green-600 text-white'
                            : 'bg-white border-gray-300 text-gray-400'
                        }`}
                      >
                        <StepIcon className="w-6 h-6" />
                      </div>
                      <span className={`mt-2 text-sm font-medium hidden sm:block ${
                        isActive ? 'text-orange-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                      }`}>
                        {step.label}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`h-1 flex-1 mx-2 hidden sm:block ${
                        isCompleted ? 'bg-green-600' : 'bg-gray-300'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Step 1: Delivery Info */}
              {currentStep === 'info' && (
                <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <MapPin className="w-6 h-6 text-orange-600" />
                    <h2 className="text-xl font-bold text-gray-900">Teslimat Bilgileri</h2>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-2">
                          <User className="w-4 h-4 inline mr-1" />
                          Ad Soyad *
                        </label>
                        <input
                          type="text"
                          id="customerName"
                          required
                          value={formData.customerName}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ\s]/g, '');
                            setFormData({ ...formData, customerName: value });
                          }}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          placeholder="Adınız Soyadınız"
                          autoComplete="name"
                        />
                      </div>
                      <div>
                        <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700 mb-2">
                          <Mail className="w-4 h-4 inline mr-1" />
                          E-posta *
                        </label>
                        <input
                          type="email"
                          id="customerEmail"
                          required
                          value={formData.customerEmail}
                          onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value.toLowerCase().trim() })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          placeholder="ornek@email.com"
                          autoComplete="email"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 mb-2">
                        <Phone className="w-4 h-4 inline mr-1" />
                        Telefon *
                      </label>
                      <input
                        type="tel"
                        id="customerPhone"
                        required
                        value={formData.customerPhone}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9+\s()-]/g, '');
                          setFormData({ ...formData, customerPhone: value });
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="05XX XXX XX XX"
                        autoComplete="tel"
                      />
                    </div>
                    <div>
                      <label htmlFor="customerAddress" className="block text-sm font-medium text-gray-700 mb-2">
                        <MapPin className="w-4 h-4 inline mr-1" />
                        Adres *
                      </label>
                      <textarea
                        id="customerAddress"
                        required
                        rows={3}
                        value={formData.customerAddress}
                        onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="Mahalle, Sokak, Bina No, Daire No"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-2">
                          İlçe *
                        </label>
                        <input
                          type="text"
                          id="district"
                          required
                          value={formData.district}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ\s]/g, '');
                            setFormData({ ...formData, district: value });
                          }}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          placeholder="İlçe"
                          autoComplete="address-level2"
                        />
                      </div>
                      <div>
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                          Şehir *
                        </label>
                        <input
                          type="text"
                          id="city"
                          required
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          placeholder="Şehir"
                        />
                      </div>
                      <div>
                        <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-2">
                          Posta Kodu
                        </label>
                        <input
                          type="text"
                          id="postalCode"
                          value={formData.postalCode}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 5);
                            setFormData({ ...formData, postalCode: value });
                          }}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          placeholder="34000"
                          maxLength={5}
                          autoComplete="postal-code"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Payment */}
              {currentStep === 'payment' && (
                <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <CreditCard className="w-6 h-6 text-orange-600" />
                    <h2 className="text-xl font-bold text-gray-900">Ödeme Yöntemi</h2>
                  </div>
                  <div className="space-y-4">
                    {/* Payment Method Selection */}
                    <div className="space-y-3">
                      <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-orange-300 transition-colors">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="credit-card"
                          checked={formData.paymentMethod === 'credit-card'}
                          onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                          className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                        />
                        <CreditCard className="w-5 h-5 ml-3 text-gray-600" />
                        <span className="ml-3 font-medium text-gray-900">Kredi Kartı / Banka Kartı</span>
                      </label>
                      <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-orange-300 transition-colors">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="bank-transfer"
                          checked={formData.paymentMethod === 'bank-transfer'}
                          onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                          className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                        />
                        <Truck className="w-5 h-5 ml-3 text-gray-600" />
                        <span className="ml-3 font-medium text-gray-900">Havale / EFT</span>
                      </label>
                    </div>

                    {/* Credit Card Form */}
                    {formData.paymentMethod === 'credit-card' && (
                      <div className="mt-6 p-6 bg-gray-50 rounded-lg space-y-4">
                        <div>
                          <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-2">
                            Kart Numarası *
                          </label>
                          <input
                            type="text"
                            id="cardNumber"
                            required
                            maxLength={19}
                            value={formData.cardNumber}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\s/g, '').replace(/\D/g, '');
                              const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
                              setFormData({ ...formData, cardNumber: formatted });
                            }}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="1234 5678 9012 3456"
                          />
                        </div>
                        <div>
                          <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-2">
                            Kart Üzerindeki İsim *
                          </label>
                          <input
                            type="text"
                            id="cardName"
                            required
                            value={formData.cardName}
                            onChange={(e) => setFormData({ ...formData, cardName: e.target.value.toUpperCase() })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="AD SOYAD"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="cardExpiry" className="block text-sm font-medium text-gray-700 mb-2">
                              Son Kullanma Tarihi *
                            </label>
                            <input
                              type="text"
                              id="cardExpiry"
                              required
                              maxLength={5}
                              value={formData.cardExpiry}
                              onChange={(e) => {
                                let value = e.target.value.replace(/\D/g, '');
                                if (value.length >= 2) {
                                  value = value.slice(0, 2) + '/' + value.slice(2, 4);
                                }
                                setFormData({ ...formData, cardExpiry: value });
                              }}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                              placeholder="MM/YY"
                            />
                          </div>
                          <div>
                            <label htmlFor="cardCvv" className="block text-sm font-medium text-gray-700 mb-2">
                              CVV *
                            </label>
                            <input
                              type="text"
                              id="cardCvv"
                              required
                              maxLength={3}
                              value={formData.cardCvv}
                              onChange={(e) => setFormData({ ...formData, cardCvv: e.target.value.replace(/\D/g, '') })}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                              placeholder="123"
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Lock className="w-4 h-4" />
                          <span>Ödeme bilgileriniz güvenli bir şekilde işlenmektedir.</span>
                        </div>
                      </div>
                    )}

                    {/* Terms and Conditions */}
                    <div className="mt-6">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.agreeTerms}
                          onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                          className="mt-1 w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                        />
                        <span className="text-sm text-gray-700">
                          <Link href="/sozlesmeler" className="text-orange-600 hover:underline">
                            Mesafeli Satış Sözleşmesi
                          </Link>
                          {' '}ve{' '}
                          <Link href="/gizlilik" className="text-orange-600 hover:underline">
                            Gizlilik Politikası
                          </Link>
                          'nı okudum ve kabul ediyorum. *
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Review */}
              {currentStep === 'review' && (
                <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <CheckCircle className="w-6 h-6 text-orange-600" />
                    <h2 className="text-xl font-bold text-gray-900">Sipariş Özeti</h2>
                  </div>
                  <div className="space-y-6">
                    {/* Delivery Info Summary */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Teslimat Bilgileri</h3>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-1 text-sm">
                        <p><strong>{formData.customerName}</strong></p>
                        <p>{formData.customerEmail}</p>
                        <p>{formData.customerPhone}</p>
                        <p>{formData.customerAddress}</p>
                        <p>{formData.district}, {formData.city} {formData.postalCode}</p>
                      </div>
                    </div>

                    {/* Payment Method Summary */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Ödeme Yöntemi</h3>
                      <div className="bg-gray-50 p-4 rounded-lg text-sm">
                        {formData.paymentMethod === 'credit-card' && (
                          <p>Kredi Kartı / Banka Kartı •••• {formData.cardNumber.slice(-4)}</p>
                        )}
                        {formData.paymentMethod === 'bank-transfer' && (
                          <p>Havale / EFT</p>
                        )}
                      </div>
                    </div>

                    {/* Notes */}
                    {formData.notes && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Notlar</h3>
                        <div className="bg-gray-50 p-4 rounded-lg text-sm">
                          <p>{formData.notes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between gap-4">
                {currentStep !== 'info' && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Geri
                  </button>
                )}
                <div className="flex-1" />
                {currentStep !== 'review' ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    Devam Et
                    <ArrowRight className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white font-semibold rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        İşleniyor...
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5" />
                        Siparişi Onayla ve Öde
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Sipariş Özeti</h2>
                <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={item.product.id} className="flex gap-4 pb-4 border-b border-gray-200 last:border-0">
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
                        <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2 break-words">
                          {item.product.name}
                        </h3>
                        <p className="text-xs text-gray-500 mb-2 truncate">Adet: {item.quantity}</p>
                        <p className="text-sm font-bold text-gray-900 truncate">
                          {(item.product.price * item.quantity).toLocaleString('tr-TR')} ₺
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-gray-700">
                    <span>Ara Toplam</span>
                    <span className="font-semibold">{totalPrice.toLocaleString('tr-TR')} ₺</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Kargo</span>
                    <span className="font-semibold">
                      {shippingCost === 0 ? (
                        <span className="text-green-600">Ücretsiz</span>
                      ) : (
                        `${shippingCost} ₺`
                      )}
                    </span>
                  </div>
                  {totalPrice < 500 && (
                    <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
                      💡 500₺ ve üzeri alışverişlerde ücretsiz kargo!
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-gray-900 text-lg pt-3 border-t border-gray-200">
                    <span>Toplam</span>
                    <span className="text-orange-600">{finalTotal.toLocaleString('tr-TR')} ₺</span>
                  </div>
                </div>
                <div className="mt-6 flex items-center gap-2 text-xs text-gray-600">
                  <Shield className="w-4 h-4" />
                  <span>Güvenli ödeme garantisi</span>
                </div>
                <Link
                  href="/sepet"
                  className="block w-full mt-4 text-center py-2 text-sm text-orange-600 hover:text-orange-700 font-medium"
                >
                  Sepeti Düzenle
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

