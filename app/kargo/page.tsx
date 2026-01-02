import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Truck, Package, Clock, MapPin } from 'lucide-react';

export default function ShippingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-8 sm:py-12 md:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 sm:p-8 md:p-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Kargo ve Teslimat Koşulları</h1>
            
            <div className="prose prose-sm sm:prose max-w-none text-gray-700 space-y-6">
              <p className="text-sm text-gray-500 mb-8">
                <strong>Son Güncelleme:</strong> {new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Truck className="w-6 h-6 text-orange-600" />
                  TESLİMAT SÜRESİ
                </h2>
                <p>
                  Siparişleriniz, onaylandıktan sonra <strong>2-5 iş günü</strong> içinde adresinize teslim edilir. Hafta sonu ve resmi tatiller teslimat süresine dahil değildir.
                </p>
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm">
                    <strong>Not:</strong> Stokta bulunmayan ürünler için teslimat süresi 7-10 iş gününe kadar uzayabilir. Bu durumda size bilgi verilecektir.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="w-6 h-6 text-green-600" />
                  KARGO ÜCRETİ
                </h2>
                <div className="space-y-3">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="font-semibold text-green-800 mb-2">✓ ÜCRETSİZ KARGO</p>
                    <p>500₺ ve üzeri tüm siparişlerde kargo ücretsizdir.</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="font-semibold mb-2">Kargo Ücreti</p>
                    <p>500₺ altındaki siparişlerde kargo ücreti 50₺'dir.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-6 h-6 text-red-600" />
                  TESLİMAT BÖLGELERİ
                </h2>
                <p>Türkiye'nin tüm il ve ilçelerine teslimat yapılmaktadır.</p>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-2">İstanbul, Ankara, İzmir</h3>
                    <p className="text-sm">2-3 iş günü</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-2">Diğer İller</h3>
                    <p className="text-sm">3-5 iş günü</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-6 h-6 text-blue-600" />
                  SİPARİŞ TAKİBİ
                </h2>
                <p>
                  Siparişiniz onaylandıktan sonra, kargo takip numaranız e-posta ve SMS ile size iletilecektir. Takip numaranız ile kargo firmasının web sitesinden siparişinizin durumunu takip edebilirsiniz.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">TESLİMAT SIRASINDA DİKKAT EDİLMESİ GEREKENLER</h2>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li>Ürünü teslim almadan önce ambalajın hasar görüp görmediğini kontrol edin</li>
                  <li>Ürünü teslim alırken kargo görevlisinin yanında açıp kontrol edin</li>
                  <li>Hasarlı veya eksik ürün teslim edilirse, kargo görevlisinden tutanak alın</li>
                  <li>Ürünü teslim aldıktan sonra 24 saat içinde hasar tespit edilirse, müşteri hizmetlerimizle iletişime geçin</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">ADRESE ULAŞAMAMA DURUMU</h2>
                <p>
                  Kargo firması, belirttiğiniz adrese ulaşamazsa veya sizi bulamazsa, ürün kargo deposuna geri gönderilir. Bu durumda müşteri hizmetlerimizle iletişime geçmeniz gerekmektedir.
                </p>
                <p className="mt-4">
                  <strong>Önemli:</strong> Adres bilgilerinizin doğru ve güncel olduğundan emin olunuz.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">KARGO FİRMALARI</h2>
                <p>Anlaşmalı kargo firmalarımız:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Yurtiçi Kargo</li>
                  <li>Aras Kargo</li>
                  <li>MNG Kargo</li>
                  <li>PTT Kargo</li>
                </ul>
                <p className="mt-4 text-sm text-gray-600">
                  Not: Teslimat adresinize en yakın kargo firması otomatik olarak seçilir.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">ULUSLARARASI TESLİMAT</h2>
                <p>
                  Şu anda sadece Türkiye içi teslimat yapılmaktadır. Uluslararası teslimat için lütfen müşteri hizmetlerimizle iletişime geçin.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">İLETİŞİM</h2>
                <p>Kargo ve teslimat hakkında sorularınız için:</p>
                <ul className="list-none pl-0 mt-4 space-y-2">
                  <li><strong>E-posta:</strong> info@incitaki.com</li>
                  <li><strong>Telefon:</strong> 0850 123 45 67</li>
                  <li><strong>Çalışma Saatleri:</strong> Pazartesi - Cumartesi: 09:00 - 18:00</li>
                </ul>
              </section>

              <div className="mt-8 p-4 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-sm text-gray-700">
                  <strong>Hatırlatma:</strong> Siparişiniz hazırlandığında size bilgi verilecektir. Kargo takip numaranızı kontrol ederek siparişinizin durumunu takip edebilirsiniz.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

