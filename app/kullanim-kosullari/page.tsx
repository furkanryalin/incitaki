import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function TermsOfUsePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-8 sm:py-12 md:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 sm:p-8 md:p-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Kullanım Koşulları</h1>
            
            <div className="prose prose-sm sm:prose max-w-none text-gray-700 space-y-6">
              <p className="text-sm text-gray-500 mb-8">
                <strong>Son Güncelleme:</strong> {new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">1. GENEL HÜKÜMLER</h2>
                <p>
                  Bu kullanım koşulları, İnci Takı internet sitesinin kullanımına ilişkin kuralları belirlemektedir. Siteyi kullanarak bu koşulları kabul etmiş sayılırsınız.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">2. SİTE KULLANIMI</h2>
                <p>Site kullanımında aşağıdaki kurallara uymanız gerekmektedir:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Siteyi yasalara aykırı amaçlarla kullanamazsınız</li>
                  <li>Site içeriğini izinsiz kopyalayamaz, çoğaltamaz veya dağıtamazsınız</li>
                  <li>Siteyi zararlı yazılım yaymak için kullanamazsınız</li>
                  <li>Diğer kullanıcıların bilgilerine yetkisiz erişim sağlayamazsınız</li>
                  <li>Siteyi spam veya istenmeyen içerik göndermek için kullanamazsınız</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">3. HESAP GÜVENLİĞİ</h2>
                <p>
                  Site üzerinde oluşturduğunuz hesabın güvenliğinden siz sorumlusunuz. Şifrenizi kimseyle paylaşmamalı ve güvenli bir şifre seçmelisiniz.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">4. FİKRİ MÜLKİYET HAKLARI</h2>
                <p>
                  Sitede yer alan tüm içerikler (metin, görsel, logo, tasarım vb.) İnci Takı'ya aittir ve telif hakları korunmaktadır. İzinsiz kullanım yasal işlemlere tabi tutulabilir.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">5. SORUMLULUK SINIRLAMALARI</h2>
                <p>
                  İnci Takı, sitede yer alan bilgilerin doğruluğu, güncelliği veya eksiksizliği konusunda garanti vermemektedir. Site kullanımından doğabilecek zararlardan sorumlu tutulamaz.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">6. DEĞİŞİKLİKLER</h2>
                <p>
                  İnci Takı, bu kullanım koşullarını herhangi bir zamanda değiştirme hakkını saklı tutar. Değişiklikler sitede yayınlandığı tarihte yürürlüğe girer.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">7. İLETİŞİM</h2>
                <p>
                  Kullanım koşulları hakkında sorularınız için <strong>info@incitaki.com</strong> adresinden bize ulaşabilirsiniz.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

