import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-8 sm:py-12 md:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 sm:p-8 md:p-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Çerez Politikası</h1>
            
            <div className="prose prose-sm sm:prose max-w-none text-gray-700 space-y-6">
              <p className="text-sm text-gray-500 mb-8">
                <strong>Son Güncelleme:</strong> {new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">ÇEREZ NEDİR?</h2>
                <p>
                  Çerezler (cookies), internet sitemizi ziyaret ettiğinizde tarayıcınız tarafından cihazınıza kaydedilen küçük metin dosyalarıdır. Çerezler, sitemizin daha iyi çalışmasını sağlar ve kullanıcı deneyimini iyileştirir.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">ÇEREZ TÜRLERİ</h2>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-900 mb-2">1. Zorunlu Çerezler</h3>
                    <p className="text-sm">
                      Bu çerezler, sitemizin temel işlevlerinin çalışması için gereklidir. Sitemizde gezinme, güvenli alanlara erişim gibi temel özellikler için kullanılır. Bu çerezler olmadan sitemiz düzgün çalışmaz.
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h3 className="font-semibold text-green-900 mb-2">2. Performans Çerezleri</h3>
                    <p className="text-sm">
                      Bu çerezler, sitemizin nasıl kullanıldığını anlamamıza yardımcı olur. Hangi sayfaların ziyaret edildiği, kullanıcıların sitede ne kadar zaman geçirdiği gibi bilgileri toplar. Bu bilgiler anonimdir.
                    </p>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <h3 className="font-semibold text-yellow-900 mb-2">3. İşlevsellik Çerezleri</h3>
                    <p className="text-sm">
                      Bu çerezler, tercihlerinizi hatırlamamıza yardımcı olur. Dil tercihiniz, sepet içeriğiniz gibi bilgileri saklar.
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h3 className="font-semibold text-purple-900 mb-2">4. Hedefleme/Pazarlama Çerezleri</h3>
                    <p className="text-sm">
                      Bu çerezler, size daha uygun reklamlar göstermek için kullanılır. İlgi alanlarınıza göre içerik sunmamıza yardımcı olur. Bu çerezler, açık rızanız olmadan kullanılmaz.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">KULLANDIĞIMIZ ÇEREZLER</h2>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300 text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 p-2 text-left">Çerez Adı</th>
                        <th className="border border-gray-300 p-2 text-left">Amaç</th>
                        <th className="border border-gray-300 p-2 text-left">Süre</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 p-2">session_id</td>
                        <td className="border border-gray-300 p-2">Oturum yönetimi</td>
                        <td className="border border-gray-300 p-2">Oturum süresi</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-2">cart_items</td>
                        <td className="border border-gray-300 p-2">Sepet bilgileri</td>
                        <td className="border border-gray-300 p-2">30 gün</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-2">user_preferences</td>
                        <td className="border border-gray-300 p-2">Kullanıcı tercihleri</td>
                        <td className="border border-gray-300 p-2">1 yıl</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">ÇEREZLERİ YÖNETME</h2>
                <p>
                  Tarayıcı ayarlarınızdan çerezleri yönetebilir veya silebilirsiniz. Ancak, bazı çerezleri devre dışı bırakmanız durumunda sitemizin bazı özellikleri düzgün çalışmayabilir.
                </p>
                <div className="mt-4 space-y-2">
                  <p><strong>Chrome:</strong> Ayarlar &gt; Gizlilik ve güvenlik &gt; Çerezler</p>
                  <p><strong>Firefox:</strong> Seçenekler &gt; Gizlilik ve Güvenlik &gt; Çerezler ve Site Verileri</p>
                  <p><strong>Safari:</strong> Tercihler &gt; Gizlilik &gt; Çerezler</p>
                  <p><strong>Edge:</strong> Ayarlar &gt; Gizlilik, arama ve hizmetler &gt; Çerezler</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">ÜÇÜNCÜ TARAFLARIN ÇEREZLERİ</h2>
                <p>
                  Sitemizde, analiz ve pazarlama amaçlı üçüncü taraf çerezler kullanılabilir. Bu çerezler, ilgili üçüncü tarafların gizlilik politikalarına tabidir.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">ÇEREZ ONAYI</h2>
                <p>
                  Sitemizi kullanarak, çerez politikamızı kabul etmiş sayılırsınız. Çerezleri kabul etmek istemiyorsanız, tarayıcı ayarlarınızdan çerezleri devre dışı bırakabilirsiniz.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">DEĞİŞİKLİKLER</h2>
                <p>
                  Bu çerez politikası, yasal düzenlemelerdeki değişiklikler veya iş süreçlerimizdeki güncellemeler nedeniyle değiştirilebilir. Değişiklikler sitede yayınlandığı tarihte yürürlüğe girer.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">İLETİŞİM</h2>
                <p>
                  Çerez politikası hakkında sorularınız için <strong>info@incitaki.com</strong> adresinden bize ulaşabilirsiniz.
                </p>
              </section>

              <div className="mt-8 p-4 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-sm text-gray-700">
                  <strong>Not:</strong> Çerezler hakkında daha fazla bilgi için <a href="/gizlilik" className="text-orange-600 hover:underline">Gizlilik Politikamızı</a> inceleyebilirsiniz.
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

