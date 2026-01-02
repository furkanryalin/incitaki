import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-8 sm:py-12 md:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 sm:p-8 md:p-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Mesafeli Satış Sözleşmesi</h1>
            
            <div className="prose prose-sm sm:prose max-w-none text-gray-700 space-y-6">
              <p className="text-sm text-gray-500 mb-8">
                <strong>Son Güncelleme:</strong> {new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">1. TARAFLAR</h2>
                <p>
                  Bu sözleşme, aşağıda kimlik bilgileri belirtilen SATICI ile internet sitesini kullanarak sipariş veren ALICI arasında aşağıdaki şartlara göre düzenlenmiştir.
                </p>
                <div className="mt-4 space-y-2">
                  <p><strong>SATICI:</strong></p>
                  <p>İnci Takı</p>
                  <p>Adres: [Şirket Adresi]</p>
                  <p>Telefon: 0850 123 45 67</p>
                  <p>E-posta: info@incitaki.com</p>
                  <p>Mersis No: [Mersis Numarası]</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">2. KONU</h2>
                <p>
                  Bu sözleşmenin konusu, ALICI'nın satın almayı talep ettiği ürünlerin satışı ve teslimi ile ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince tarafların hak ve yükümlülüklerinin belirlenmesidir.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">3. SÖZLEŞME KONUSU ÜRÜN BİLGİLERİ</h2>
                <p>
                  Sözleşme konusu ürünler, internet sitemizde yer alan ürünlerdir. Ürünlerin temel özellikleri, satış fiyatı ve ödeme şekli internet sitemizde açıkça belirtilmiştir.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">4. FİYAT VE ÖDEME</h2>
                <p>
                  Ürün fiyatları, internet sitemizde belirtilen fiyatlardır. Fiyatlar KDV dahildir. SATICI, önceden haber vermeksizin fiyat değişikliği yapabilir. Ancak ALICI'ya sipariş verdiği ürünün sipariş anındaki fiyatı uygulanır.
                </p>
                <p className="mt-4">
                  Ödeme yöntemleri: Kredi kartı, banka kartı, havale/EFT, kapıda ödeme seçenekleri mevcuttur.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">5. TESLİMAT</h2>
                <p>
                  Ürünler, ALICI'nın belirttiği adrese kargo firması aracılığıyla teslim edilir. Teslimat süresi, siparişin onaylanmasından itibaren 2-5 iş günüdür. Kargo ücreti ALICI'ya aittir. 500₺ ve üzeri alışverişlerde kargo ücretsizdir.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">6. CAYMA HAKKI</h2>
                <p>
                  ALICI, sözleşme konusu ürünü teslim aldığı tarihten itibaren 14 (on dört) gün içinde hiçbir gerekçe göstermeksizin ve cezai şart ödemeksizin sözleşmeden cayabilir.
                </p>
                <p className="mt-4">
                  Cayma hakkının kullanılması için, ALICI'nın SATICI'ya yazılı olarak (e-posta, faks veya posta) başvurması gerekmektedir. Cayma bildirimi, 14 günlük sürenin son günü mesai saati bitimine kadar SATICI'ya ulaşmalıdır.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">7. İADE KOŞULLARI</h2>
                <p>
                  İade edilecek ürünler, kullanılmamış, orijinal ambalajında ve faturası ile birlikte olmalıdır. İade kargo ücreti ALICI'ya aittir. Ürünün hasarlı veya eksik teslim edilmesi durumunda kargo ücreti SATICI'ya aittir.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">8. GARANTİ</h2>
                <p>
                  Ürünler, yasal garanti süresi içinde garanti kapsamındadır. Garanti koşulları, ürünle birlikte gönderilen garanti belgesinde belirtilmiştir.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">9. UYUŞMAZLIKLARIN ÇÖZÜMÜ</h2>
                <p>
                  Bu sözleşmeden doğan uyuşmazlıkların çözümünde Türkiye Cumhuriyeti yasaları uygulanır. İstanbul Tüketici Hakem Heyetleri ve Tüketici Mahkemeleri yetkilidir.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">10. SÖZLEŞMENİN ONAYLANMASI</h2>
                <p>
                  ALICI, sipariş vermek suretiyle bu sözleşmeyi okuduğunu, anladığını ve kabul ettiğini beyan eder.
                </p>
              </section>

              <div className="mt-8 p-4 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-sm text-gray-700">
                  <strong>Not:</strong> Bu sözleşme, 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümlerine uygun olarak hazırlanmıştır.
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

