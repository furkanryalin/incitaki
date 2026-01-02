import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Package, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function ReturnPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-8 sm:py-12 md:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 sm:p-8 md:p-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">İade ve Değişim Koşulları</h1>
            
            <div className="prose prose-sm sm:prose max-w-none text-gray-700 space-y-6">
              <p className="text-sm text-gray-500 mb-8">
                <strong>Son Güncelleme:</strong> {new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">CAYMA HAKKI</h2>
                <p>
                  6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği uyarınca, ürünü teslim aldığınız tarihten itibaren <strong>14 (on dört) gün</strong> içinde hiçbir gerekçe göstermeksizin cayma hakkınızı kullanabilirsiniz.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  İADE KOŞULLARI
                </h2>
                <p>İade edilecek ürünler aşağıdaki koşulları sağlamalıdır:</p>
                <ul className="list-disc pl-6 mt-4 space-y-2">
                  <li>Ürün kullanılmamış, hasarsız ve orijinal halinde olmalıdır</li>
                  <li>Ürün orijinal ambalajında ve etiketleri ile birlikte olmalıdır</li>
                  <li>Ürün faturası ile birlikte gönderilmelidir</li>
                  <li>Ürün, teslim alındığı tarihten itibaren 14 gün içinde iade edilmelidir</li>
                  <li>Kişisel kullanıma uygun olmayan ürünler (iç çamaşırı, mayo vb.) hijyen nedeniyle iade edilemez</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <XCircle className="w-6 h-6 text-red-600" />
                  İADE EDİLEMEYEN ÜRÜNLER
                </h2>
                <p>Aşağıdaki ürünler iade edilemez:</p>
                <ul className="list-disc pl-6 mt-4 space-y-2">
                  <li>Hijyen nedeniyle iade edilemeyen ürünler (iç çamaşırı, mayo, çorap vb.)</li>
                  <li>Kullanılmış, hasarlı veya orijinal ambalajından çıkarılmış ürünler</li>
                  <li>Özel üretim veya kişiselleştirilmiş ürünler</li>
                  <li>Fırsat ürünleri (kampanya ürünleri)</li>
                  <li>14 günlük süre geçmiş ürünler</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="w-6 h-6 text-orange-600" />
                  İADE SÜRECİ
                </h2>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-2">1. İade Talebi</h3>
                    <p>İade talebinizi <strong>info@incitaki.com</strong> adresine e-posta göndererek veya müşteri hizmetlerimizi arayarak bildirebilirsiniz.</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-2">2. Kargo</h3>
                    <p>Ürünü, orijinal ambalajında ve faturası ile birlikte aşağıdaki adrese göndermeniz gerekmektedir:</p>
                    <p className="mt-2 font-medium">[Kargo Adresi]</p>
                    <p className="mt-2 text-sm text-gray-600">Not: İade kargo ücreti müşteriye aittir. Ürünün hasarlı veya eksik teslim edilmesi durumunda kargo ücreti firmamıza aittir.</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-2">3. Kontrol ve Onay</h3>
                    <p>Ürün kontrol edildikten sonra, uygun bulunması halinde iade işlemi tamamlanır.</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-2">4. Ödeme İadesi</h3>
                    <p>İade onaylandıktan sonra, ödemeniz <strong>7-14 iş günü</strong> içinde aynı ödeme yöntemiyle iade edilir.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-6 h-6 text-blue-600" />
                  DEĞİŞİM
                </h2>
                <p>
                  Ürün değişimi için önce iade işlemi yapılır, ardından yeni ürün siparişi verilir. Değişim işlemi için ürünün iade koşullarını sağlaması gerekmektedir.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">HASARLI VEYA EKSİK ÜRÜN</h2>
                <p>
                  Ürününüz hasarlı veya eksik teslim edilmişse, lütfen en kısa sürede müşteri hizmetlerimizle iletişime geçin. Hasarlı veya eksik ürünlerin kargo ücreti firmamıza aittir.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">İLETİŞİM</h2>
                <p>
                  İade ve değişim işlemleri hakkında sorularınız için:
                </p>
                <ul className="list-none pl-0 mt-4 space-y-2">
                  <li><strong>E-posta:</strong> info@incitaki.com</li>
                  <li><strong>Telefon:</strong> 0850 123 45 67</li>
                  <li><strong>Çalışma Saatleri:</strong> Pazartesi - Cumartesi: 09:00 - 18:00</li>
                </ul>
              </section>

              <div className="mt-8 p-4 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-sm text-gray-700">
                  <strong>Önemli:</strong> İade işlemleriniz için lütfen ürünü orijinal ambalajında ve faturası ile birlikte gönderiniz. Aksi halde iade işlemi gerçekleştirilemeyebilir.
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

