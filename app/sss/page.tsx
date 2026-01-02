'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: 'Siparişimi nasıl verebilirim?',
      answer: 'Sitemizde beğendiğiniz ürünü sepete ekleyerek sipariş verebilirsiniz. Ödeme sayfasında gerekli bilgileri doldurup ödeme yönteminizi seçerek siparişinizi tamamlayabilirsiniz.'
    },
    {
      question: 'Hangi ödeme yöntemlerini kabul ediyorsunuz?',
      answer: 'Kredi kartı, banka kartı, havale/EFT ve kapıda ödeme seçeneklerini kabul ediyoruz. Tüm ödeme işlemleri güvenli şekilde gerçekleştirilmektedir.'
    },
    {
      question: 'Kargo ücreti ne kadar?',
      answer: '500₺ ve üzeri tüm siparişlerde kargo ücretsizdir. 500₺ altındaki siparişlerde kargo ücreti 50₺\'dir.'
    },
    {
      question: 'Siparişim ne zaman teslim edilir?',
      answer: 'Siparişleriniz onaylandıktan sonra 2-5 iş günü içinde adresinize teslim edilir. Hafta sonu ve resmi tatiller teslimat süresine dahil değildir.'
    },
    {
      question: 'Ürün iadesi yapabilir miyim?',
      answer: 'Evet, 6502 sayılı Tüketicinin Korunması Hakkında Kanun uyarınca, ürünü teslim aldığınız tarihten itibaren 14 gün içinde hiçbir gerekçe göstermeksizin iade edebilirsiniz. Ürünün kullanılmamış, orijinal ambalajında ve faturası ile birlikte olması gerekmektedir.'
    },
    {
      question: 'İade işlemi nasıl yapılır?',
      answer: 'İade talebinizi info@incitaki.com adresine e-posta göndererek veya müşteri hizmetlerimizi arayarak bildirebilirsiniz. Ürünü orijinal ambalajında ve faturası ile birlikte belirtilen adrese göndermeniz gerekmektedir.'
    },
    {
      question: 'İade ücreti kim tarafından ödenir?',
      answer: 'İade kargo ücreti müşteriye aittir. Ancak ürünün hasarlı veya eksik teslim edilmesi durumunda kargo ücreti firmamıza aittir.'
    },
    {
      question: 'Ödeme iadesi ne zaman yapılır?',
      answer: 'İade onaylandıktan sonra, ödemeniz 7-14 iş günü içinde aynı ödeme yöntemiyle iade edilir.'
    },
    {
      question: 'Hangi ürünler iade edilemez?',
      answer: 'Hijyen nedeniyle iade edilemeyen ürünler (iç çamaşırı, mayo, çorap vb.), kullanılmış veya hasarlı ürünler, özel üretim veya kişiselleştirilmiş ürünler iade edilemez.'
    },
    {
      question: 'Siparişimi nasıl takip edebilirim?',
      answer: 'Siparişiniz onaylandıktan sonra, kargo takip numaranız e-posta ve SMS ile size iletilecektir. Takip numaranız ile kargo firmasının web sitesinden siparişinizin durumunu takip edebilirsiniz.'
    },
    {
      question: 'Ürün garantisi var mı?',
      answer: 'Evet, tüm ürünlerimiz yasal garanti süresi içinde garanti kapsamındadır. Garanti koşulları, ürünle birlikte gönderilen garanti belgesinde belirtilmiştir.'
    },
    {
      question: 'Hesabımı nasıl oluşturabilirim?',
      answer: 'Sitemizin sağ üst köşesindeki "Giriş Yap" butonuna tıklayarak hesap oluşturabilirsiniz. E-posta adresiniz ve şifrenizle kolayca kayıt olabilirsiniz.'
    },
    {
      question: 'Şifremi unuttum, ne yapmalıyım?',
      answer: 'Giriş sayfasında "Şifremi Unuttum" linkine tıklayarak e-posta adresinize şifre sıfırlama bağlantısı gönderebilirsiniz.'
    },
    {
      question: 'Kampanya ve indirimlerden nasıl haberdar olabilirim?',
      answer: 'E-posta bültenimize abone olarak kampanya ve indirimlerden ilk siz haberdar olabilirsiniz. Ayrıca sosyal medya hesaplarımızı takip edebilirsiniz.'
    },
    {
      question: 'Müşteri hizmetlerinize nasıl ulaşabilirim?',
      answer: 'Müşteri hizmetlerimize 0850 123 45 67 numaralı telefondan veya info@incitaki.com adresinden ulaşabilirsiniz. Çalışma saatlerimiz: Pazartesi - Cumartesi: 09:00 - 18:00'
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-8 sm:py-12 md:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 sm:p-8 md:p-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Sık Sorulan Sorular</h1>
            
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full px-4 py-4 sm:px-6 sm:py-5 flex items-center justify-between text-left bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                    {openIndex === index ? (
                      <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    )}
                  </button>
                  {openIndex === index && (
                    <div className="px-4 py-4 sm:px-6 sm:py-5 bg-white border-t border-gray-200">
                      <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-sm text-gray-700">
                <strong>Sorunuz mu var?</strong> Yukarıdaki sorular arasında aradığınız cevabı bulamadıysanız,{' '}
                <a href="/iletisim" className="text-orange-600 hover:underline font-semibold">
                  iletişim sayfamızdan
                </a>
                {' '}bize ulaşabilirsiniz.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

