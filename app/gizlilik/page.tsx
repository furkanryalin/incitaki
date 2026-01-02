import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-8 sm:py-12 md:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 sm:p-8 md:p-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Gizlilik Politikası ve KVKK Aydınlatma Metni</h1>
            
            <div className="prose prose-sm sm:prose max-w-none text-gray-700 space-y-6">
              <p className="text-sm text-gray-500 mb-8">
                <strong>Son Güncelleme:</strong> {new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">1. VERİ SORUMLUSU</h2>
                <p>
                  6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, kişisel verileriniz aşağıdaki bilgiler çerçevesinde işlenmektedir.
                </p>
                <div className="mt-4 space-y-2">
                  <p><strong>Veri Sorumlusu:</strong> İnci Takı</p>
                  <p>Adres: [Şirket Adresi]</p>
                  <p>Telefon: 0850 123 45 67</p>
                  <p>E-posta: info@incitaki.com</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">2. İŞLENEN KİŞİSEL VERİLER</h2>
                <p>İşlediğimiz kişisel veriler şunlardır:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li><strong>Kimlik Bilgileri:</strong> Ad, soyad, T.C. kimlik numarası</li>
                  <li><strong>İletişim Bilgileri:</strong> E-posta adresi, telefon numarası, adres bilgileri</li>
                  <li><strong>Müşteri İşlem Bilgileri:</strong> Sipariş geçmişi, fatura bilgileri, ödeme bilgileri</li>
                  <li><strong>İnternet Sitesi Kullanım Bilgileri:</strong> IP adresi, çerez bilgileri, tarayıcı bilgileri</li>
                  <li><strong>Pazarlama Bilgileri:</strong> E-posta abonelik durumu, tercihler</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">3. KİŞİSEL VERİLERİN İŞLENME AMAÇLARI</h2>
                <p>Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Siparişlerinizin işleme alınması ve teslim edilmesi</li>
                  <li>Müşteri hizmetleri faaliyetlerinin yürütülmesi</li>
                  <li>Yasal yükümlülüklerin yerine getirilmesi</li>
                  <li>Pazarlama ve tanıtım faaliyetlerinin yürütülmesi (açık rıza ile)</li>
                  <li>İnternet sitesi kullanım analizi ve iyileştirme</li>
                  <li>Güvenlik ve dolandırıcılık önleme</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">4. KİŞİSEL VERİLERİN İŞLENME HUKUKİ SEBEPLERİ</h2>
                <p>Kişisel verileriniz aşağıdaki hukuki sebeplere dayanarak işlenmektedir:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>KVKK madde 5/2-c: "Sözleşmenin kurulması veya ifasıyla doğrudan doğruya ilgili olması kaydıyla, sözleşmenin taraflarına ait kişisel verilerin işlenmesinin gerekli olması"</li>
                  <li>KVKK madde 5/2-e: "Veri sorumlusunun hukuki yükümlülüğünü yerine getirebilmesi için işlenmesinin zorunlu olması"</li>
                  <li>KVKK madde 5/2-f: "İlgili kişinin temel hak ve özgürlüklerine zarar vermemek kaydıyla, veri sorumlusunun meşru menfaatleri için veri işlemenin zorunlu olması"</li>
                  <li>KVKK madde 6/2: "Açık rıza" (pazarlama faaliyetleri için)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">5. KİŞİSEL VERİLERİN AKTARILMASI</h2>
                <p>
                  Kişisel verileriniz, yukarıda belirtilen amaçların gerçekleştirilmesi için aşağıdaki üçüncü kişilere aktarılabilir:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Kargo firmaları (teslimat için)</li>
                  <li>Ödeme hizmet sağlayıcıları (ödeme işlemleri için)</li>
                  <li>Yazılım ve hosting hizmet sağlayıcıları (teknik altyapı için)</li>
                  <li>Muhasebe ve mali müşavirlik firmaları (yasal yükümlülükler için)</li>
                  <li>Yasal merciler (yasal zorunluluklar halinde)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">6. KİŞİSEL VERİLERİN SAKLANMA SÜRESİ</h2>
                <p>
                  Kişisel verileriniz, işlendikleri amaç için gerekli olan süre boyunca saklanmaktadır. Yasal saklama süreleri (örneğin, ticari ve mali kayıtlar için 10 yıl) geçtikten sonra verileriniz silinmekte, yok edilmekte veya anonim hale getirilmektedir.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">7. KİŞİSEL VERİ SAHİBİNİN HAKLARI</h2>
                <p>KVKK madde 11 uyarınca, kişisel veri sahibi olarak aşağıdaki haklara sahipsiniz:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                  <li>İşlenmişse buna ilişkin bilgi talep etme</li>
                  <li>İşlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
                  <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme</li>
                  <li>Eksik veya yanlış işlenmiş olması halinde bunların düzeltilmesini isteme</li>
                  <li>KVKK'da öngörülen şartlar çerçevesinde silinmesini veya yok edilmesini isteme</li>
                  <li>Düzeltme, silme, yok edilme işlemlerinin, kişisel verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme</li>
                  <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme</li>
                  <li>Kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız halinde zararın giderilmesini talep etme</li>
                </ul>
                <p className="mt-4">
                  Haklarınızı kullanmak için <strong>info@incitaki.com</strong> adresine yazılı başvuruda bulunabilirsiniz.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">8. ÇEREZLER (COOKIES)</h2>
                <p>
                  İnternet sitemizde çerezler kullanılmaktadır. Çerez politikamız hakkında detaylı bilgi için <a href="/cerez-politikasi" className="text-orange-600 hover:underline">Çerez Politikası</a> sayfamızı ziyaret edebilirsiniz.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">9. GÜVENLİK</h2>
                <p>
                  Kişisel verilerinizin güvenliği için teknik ve idari önlemler alınmaktadır. SSL sertifikası kullanılarak veri aktarımı şifrelenmektedir.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">10. DEĞİŞİKLİKLER</h2>
                <p>
                  Bu gizlilik politikası, yasal düzenlemelerdeki değişiklikler veya iş süreçlerimizdeki güncellemeler nedeniyle değiştirilebilir. Değişiklikler internet sitemizde yayınlandığı tarihte yürürlüğe girer.
                </p>
              </section>

              <div className="mt-8 p-4 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-sm text-gray-700">
                  <strong>İletişim:</strong> Kişisel verilerinizle ilgili sorularınız için <strong>info@incitaki.com</strong> adresinden bize ulaşabilirsiniz.
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

