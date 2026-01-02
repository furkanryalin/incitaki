import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Heart, Award, Users, Sparkles } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Hakkımızda</h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              İnci Takı olarak, geniş ürün yelpazemizle hayatınıza değer katmayı hedefliyoruz.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Hikayemiz</h2>
              <p className="text-gray-600 mb-4">
                2010 yılında kurulan İnci Takı, müşterilerine en kaliteli ürünleri 
                sunmak için yola çıktı. Yıllar içinde büyüyerek, geniş ürün yelpazesiyle 
                müşterilerimize hizmet vermeye devam ediyoruz.
              </p>
              <p className="text-gray-600">
                Her ürünümüz, uzman ekibimiz tarafından özenle seçilir ve kalite kontrolünden 
                geçirilir. Müşteri memnuniyeti bizim için her şeyden önemlidir.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Misyonumuz</h2>
              <p className="text-gray-600 mb-4">
                Her müşterimize özel anlarında yanlarında olmak, hayatlarına değer katan 
                ürünler sunmak misyonumuzdur.
              </p>
              <p className="text-gray-600">
                Kalite, güvenilirlik ve müşteri memnuniyeti ilkelerimizle, sektörde 
                öncü olmaya devam ediyoruz.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                <Award className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">14+ Yıl Deneyim</h3>
              <p className="text-sm text-gray-600">Sektörde uzun yılların deneyimi</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                <Users className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">50,000+ Müşteri</h3>
              <p className="text-sm text-gray-600">Mutlu müşterilerimiz</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                <Sparkles className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">1000+ Ürün</h3>
              <p className="text-sm text-gray-600">Geniş ürün yelpazesi</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                <Heart className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">%100 Memnuniyet</h3>
              <p className="text-sm text-gray-600">Müşteri odaklı hizmet</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

