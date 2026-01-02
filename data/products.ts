import { Product } from '@/types';

// Basit hash fonksiyonu - deterministik değerler için
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 32bit integer'a çevir
  }
  return Math.abs(hash);
}

// İsim formatını düzelt - birleşik kelimeleri ayır
function formatProductName(nameWithoutExt: string): string {
  // Özel kombinasyonları önce kontrol et ve değiştir
  const specialPatterns: Array<{ pattern: RegExp; replacement: string }> = [
    { pattern: /ogretmenlergunu/i, replacement: 'Öğretmenler Günü' },
    { pattern: /ayicigigullu/i, replacement: 'Ayıcığı Güllü' },
    { pattern: /telefontutacagi|telefontutacagı/i, replacement: 'Telefon Tutacağı' },
    { pattern: /kuromini/i, replacement: 'Kür O Mini' },
    { pattern: /kehribartozlu/i, replacement: 'Kehribar Tozlu' },
    { pattern: /kolyeyuzukkupe/i, replacement: 'Kolye Yüzük Küpe' },
    { pattern: /sarivegumus/i, replacement: 'Sarı ve Gümüş' },
    { pattern: /sarigumus/i, replacement: 'Sarı Gümüş' },
  ];
  
  let formatted = nameWithoutExt;
  for (const { pattern, replacement } of specialPatterns) {
    formatted = formatted.replace(pattern, replacement);
  }
  
  // Eğer zaten boşluk içeriyorsa (özel pattern uygulandıysa), sadece formatla
  if (formatted.includes(' ')) {
    return formatted.split(' ').map(word => {
      const lowerWord = word.toLowerCase();
      const specialWords: Record<string, string> = {
        'v2': 'V2', 'v1': 'V1',
        'kuromini': 'Kür O Mini',
        'pikachu': 'Pikachu',
        'barbie': 'Barbie',
        'ogretmenler': 'Öğretmenler', 'gunu': 'Günü',
        'ayicigi': 'Ayıcığı', 'gullu': 'Güllü',
        'telefon': 'Telefon', 'tutacagi': 'Tutacağı', 'tutacağı': 'Tutacağı',
        'kehribar': 'Kehribar', 'tozlu': 'Tozlu',
        'tesbih': 'Tespih', 'tespih': 'Tespih',
        'kolye': 'Kolye', 'yuzuk': 'Yüzük', 'yüzük': 'Yüzük',
        'kupe': 'Küpe', 'küpe': 'Küpe',
        'takimi': 'Takımı', 'takim': 'Takım', 'takımı': 'Takımı', 'takım': 'Takım',
        'bileklik': 'Bileklik', 'bilezik': 'Bilezik',
        'sari': 'Sarı', 'sarı': 'Sarı',
        'gumus': 'Gümüş', 'gümüş': 'Gümüş',
        've': 've',
        'cesitleri': 'Çeşitleri', 'çeşitleri': 'Çeşitleri'
      };
      if (specialWords[lowerWord]) {
        return specialWords[lowerWord];
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join(' ');
  }
  
  // Birleşik kelimeleri ayır - kelime sözlüğü ile
  const wordDictionary = [
    'kehribar', 'tespih', 'tesbih', 'tozlu',
    'kolye', 'yuzuk', 'yüzük', 'kupe', 'küpe', 'takimi', 'takim', 'takımı', 'takım',
    'bileklik', 'bilezik',
    'sari', 'sarı', 'gumus', 'gümüş', 've',
    'telefon', 'tutacagi', 'tutacağı',
    'pikachu', 'barbie', 'kuromini',
    'ogretmenler', 'öğretmenler', 'gunu', 'günü', 'ayicigi', 'ayıcığı', 'gullu', 'güllü',
    'cesitleri', 'çeşitleri',
    'v2', 'v1'
  ];
  
  // Kelimeleri ayır - en uzun eşleşmeyi bul
  const words: string[] = [];
  let remaining = formatted.toLowerCase();
  
  while (remaining.length > 0) {
    let found = false;
    // En uzun eşleşmeyi bul (uzundan kısaya)
    for (let len = Math.min(remaining.length, 20); len > 0; len--) {
      const candidate = remaining.substring(0, len);
      const matchedWord = wordDictionary.find(w => w.toLowerCase() === candidate);
      
      if (matchedWord) {
        words.push(matchedWord);
        remaining = remaining.substring(len);
        found = true;
        break;
      }
    }
    
    if (!found) {
      // Eşleşme bulunamadı, tek karakter al
      words.push(remaining[0]);
      remaining = remaining.substring(1);
    }
  }
  
  // Kelimeleri formatla
  const specialWords: Record<string, string> = {
    'v2': 'V2', 'v1': 'V1',
    'kuromini': 'Kür O Mini',
    'pikachu': 'Pikachu',
    'barbie': 'Barbie',
    'ogretmenler': 'Öğretmenler', 'gunu': 'Günü',
    'ayicigi': 'Ayıcığı', 'gullu': 'Güllü',
    'telefon': 'Telefon',
    'tutacagi': 'Tutacağı',
    'tutacağı': 'Tutacağı',
    'kehribar': 'Kehribar',
    'tozlu': 'Tozlu',
    'tesbih': 'Tespih',
    'tespih': 'Tespih',
    'kolye': 'Kolye',
    'yuzuk': 'Yüzük',
    'yüzük': 'Yüzük',
    'kupe': 'Küpe',
    'küpe': 'Küpe',
    'takimi': 'Takımı',
    'takim': 'Takım',
    'takımı': 'Takımı',
    'takım': 'Takım',
    'bileklik': 'Bileklik',
    'bilezik': 'Bilezik',
    'sari': 'Sarı',
    'sarı': 'Sarı',
    'gumus': 'Gümüş',
    'gümüş': 'Gümüş',
    've': 've',
    'cesitleri': 'Çeşitleri',
    'çeşitleri': 'Çeşitleri'
  };
  
  return words
    .map(word => {
      const lowerWord = word.toLowerCase();
      if (specialWords[lowerWord]) {
        return specialWords[lowerWord];
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

// Dosya isimlerinden ürün bilgileri türetme fonksiyonu
function generateProductFromFileName(fileName: string, id: string): Product {
  // Dosya uzantısını kaldır
  const nameWithoutExt = fileName.replace(/\.(HEIC|heic|jpg|jpeg|png)$/i, '');
  
  // İsim formatını düzelt
  const formattedName = formatProductName(nameWithoutExt);

  // Kategori belirleme
  let category = 'takim'; // varsayılan
  const lowerName = formattedName.toLowerCase();
  const lowerFileName = nameWithoutExt.toLowerCase();
  
  // Önce dosya ismine göre kontrol et
  if (lowerFileName.includes('kolye') && !lowerFileName.includes('takim') && !lowerFileName.includes('takimi')) {
    category = 'kolye';
  } else if (lowerFileName.includes('yuzuk') || lowerFileName.includes('yüzük')) {
    category = 'yuzuk';
  } else if (lowerFileName.includes('kupe') || lowerFileName.includes('küpe')) {
    category = 'kupe';
  } else if (lowerFileName.includes('bilezik') || lowerFileName.includes('bileklik')) {
    category = 'bilezik';
  } else if (lowerFileName.includes('takim') || lowerFileName.includes('takimi')) {
    category = 'takim';
  } else if (lowerFileName.includes('tesbih') || lowerFileName.includes('tespih')) {
    // Tespih için en yakın kategori (takım olarak kalsın veya yeni kategori eklenebilir)
    category = 'takim';
  } else if (lowerFileName.includes('telefontutacagi') || lowerFileName.includes('telefontutacagı')) {
    // Telefon tutacakları için takım kategorisi
    category = 'takim';
  } else if (lowerFileName.includes('ogretmenler') || lowerFileName.includes('öğretmenler')) {
    // Öğretmenler günü hediyesi için takım kategorisi
    category = 'takim';
  }
  
  // Sonra formatlanmış isme göre kontrol et (daha güvenilir)
  if (lowerName.includes('kolye') && !lowerName.includes('takım') && !lowerName.includes('takim')) {
    category = 'kolye';
  } else if (lowerName.includes('yüzük') || lowerName.includes('yuzuk')) {
    category = 'yuzuk';
  } else if (lowerName.includes('küpe') || lowerName.includes('kupe')) {
    category = 'kupe';
  } else if (lowerName.includes('bilezik') || lowerName.includes('bileklik')) {
    category = 'bilezik';
  } else if (lowerName.includes('takım') || lowerName.includes('takim')) {
    category = 'takim';
  }

  // Açıklama türetme
  let description = '';
  if (lowerName.includes('kehribar') && lowerName.includes('tespih')) {
    description = 'Doğal kehribar tespih. El yapımı işçilik ile üretilmiş, özenle seçilmiş kehribar taneleri. Hem estetik hem de manevi değeri yüksek bir ürün.';
  } else if (lowerName.includes('kolye') && lowerName.includes('yüzük') && lowerName.includes('küpe')) {
    description = 'Kolye, yüzük ve küpe takımı. Birbirini tamamlayan parçalardan oluşan şık set. Özel günler ve özel anlar için mükemmel bir seçim.';
  } else if (lowerName.includes('öğretmenler') || lowerName.includes('ogretmenler')) {
    description = 'Öğretmenler Günü için özel tasarım. Ayıcıklı ve güllü detaylarla süslenmiş, sevgi dolu bir hediye. Öğretmenlerinize minnettarlığınızı göstermenin en güzel yolu.';
  } else if (lowerName.includes('bileklik') || lowerName.includes('bilezik')) {
    if (lowerName.includes('sarı') || lowerName.includes('sari')) {
      if (lowerName.includes('gümüş') || lowerName.includes('gumus')) {
        description = 'Sarı ve gümüş karışımı bileklik. Modern tasarım, şık görünüm. Günlük kullanım için ideal, her stile uyum sağlar.';
      } else {
        description = 'Sarı renkli gümüş bileklik. Parlak yüzeyi ve zarif tasarımı ile dikkat çeker. Özel günlerde de günlük hayatta da kullanılabilir.';
      }
    } else {
      description = 'Zarif gümüş bileklik. Klasik tasarım, zamansız şıklık. Her yaştan kadının tercih edebileceği bir aksesuar.';
    }
  } else if (lowerName.includes('telefon tutacağı') || lowerName.includes('telefontutacagi')) {
    if (lowerName.includes('pikachu')) {
      description = 'Pikachu temalı telefon tutacağı. Pokemon severler için özel tasarım. Telefonunuzu hem korur hem de eğlenceli bir görünüm kazandırır.';
    } else if (lowerName.includes('barbie')) {
      description = 'Barbie temalı telefon tutacağı. Pembe ve şık tasarım. Telefonunuzu hem korur hem de tarzınızı yansıtır.';
    } else if (lowerName.includes('kür o mini') || lowerName.includes('kuromini')) {
      description = 'Kür O Mini temalı telefon tutacağı. Eğlenceli ve renkli tasarım. Telefonunuzu düşmelerden korurken aynı zamanda kişiliğinizi yansıtır.';
    } else {
      description = 'Pratik telefon tutacağı. Telefonunuzu güvenle tutmanızı sağlar. Modern ve ergonomik tasarım.';
    }
  } else if (lowerName.includes('yüzük') || lowerName.includes('yuzuk')) {
    if (lowerName.includes('çeşitleri') || lowerName.includes('cesitleri')) {
      description = 'Çeşitli yüzük modelleri. Farklı tasarımlar ve boyutlarda seçenekler. Her zevke uygun, kaliteli işçilik.';
    } else {
      description = 'Zarif yüzük tasarımı. Özenle seçilmiş malzemeler ve detaylı işçilik. Özel anlarınızı taçlandırır.';
    }
  } else {
    description = 'Özenle seçilmiş kaliteli ürün. Detaylı işçilik ve şık tasarım. Günlük kullanım ve özel günler için ideal.';
  }

  // Fiyat belirleme (kategori ve ürün tipine göre)
  let price = 500;
  let originalPrice: number | undefined = undefined;
  
  if (lowerName.includes('kehribar') && lowerName.includes('tespih')) {
    price = 850;
    originalPrice = 1100;
  } else if (lowerName.includes('takım') || (lowerName.includes('kolye') && lowerName.includes('yüzük'))) {
    price = 3200;
    originalPrice = 4000;
  } else if (lowerName.includes('öğretmenler') || lowerName.includes('ogretmenler')) {
    price = 450;
    originalPrice = 600;
  } else if (lowerName.includes('bileklik') || lowerName.includes('bilezik')) {
    if (lowerName.includes('sarı') || lowerName.includes('sari')) {
      price = 650;
      originalPrice = 850;
    } else {
      price = 580;
    }
  } else if (lowerName.includes('telefon tutacağı') || lowerName.includes('telefontutacagi')) {
    price = 95;
    originalPrice = 150;
  } else if (lowerName.includes('yüzük') || lowerName.includes('yuzuk')) {
    price = 420;
    originalPrice = 550;
  }

  // Rating ve reviews (deterministik - dosya ismine göre)
  const ratings = [4.5, 4.6, 4.7, 4.8, 4.9, 5.0];
  const reviews = [12, 15, 18, 22, 24, 28, 31];
  const hash = simpleHash(fileName);
  const rating = ratings[hash % ratings.length];
  const reviewCount = reviews[hash % reviews.length];

  return {
    id,
    name: formattedName,
    description,
    price,
    originalPrice,
    image: `/products/${fileName}`,
    category: category as 'kolye' | 'yuzuk' | 'kupe' | 'bilezik' | 'takim',
    inStock: true,
    rating,
    reviews: reviewCount
  };
}

// Varsayılan ürünler kaldırıldı - ürünler admin panelinden eklenebilir
export const products: Product[] = [];

