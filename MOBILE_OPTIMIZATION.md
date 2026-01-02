# Mobile Optimization & PWA

Bu dokümantasyon, İnci Takı sitesinin mobil optimizasyonları ve PWA (Progressive Web App) özelliklerini açıklar.

## 🚀 PWA Özellikleri

### 1. Manifest.json
- **Konum:** `/public/manifest.json`
- **Özellikler:**
  - Standalone display mode
  - App icons (192x192, 512x512)
  - Theme color: Orange (#ea580c)
  - Shortcuts: Ürünler, Sepet, Favoriler
  - Portrait orientation

### 2. Service Worker
- **Konum:** `/public/sw.js`
- **Özellikler:**
  - Offline support
  - Cache management
  - Network-first strategy
  - Automatic cache cleanup

### 3. Install Prompt
- **Konum:** `/components/PWAInstallPrompt.tsx`
- **Özellikler:**
  - Otomatik kurulum önerisi
  - Kullanıcı tercihine göre gösterilir
  - Session bazlı dismiss

## 📱 Mobile Optimizasyonları

### CSS İyileştirmeleri
- **Touch-friendly targets:** Minimum 44x44px
- **iOS text size fix:** Input'lar için 16px minimum
- **Safe area insets:** Notched cihazlar için
- **Pull-to-refresh prevention:** İsteğe bağlı
- **Better focus states:** Touch cihazlar için

### Viewport Ayarları
```typescript
{
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#ea580c',
  viewportFit: 'cover',
}
```

## 🔧 Kullanım

### Service Worker Kaydı
Service worker otomatik olarak kaydedilir (`ServiceWorkerRegistration` component'i).

### PWA Kurulumu
1. Kullanıcı siteyi ziyaret eder
2. 3 saniye sonra kurulum önerisi gösterilir
3. Kullanıcı "Yükle" butonuna tıklar
4. Tarayıcı kurulum dialog'unu gösterir
5. Kurulum tamamlandıktan sonra uygulama ana ekrana eklenir

### Offline Mode
- Service worker sayesinde bazı sayfalar offline çalışabilir
- Cache'lenmiş sayfalar gösterilir
- API çağrıları offline'da çalışmaz

## 📝 Notlar

1. **HTTPS Gereklidir:** PWA özellikleri sadece HTTPS üzerinde çalışır (localhost hariç)
2. **Icon Boyutları:** Logo dosyası 192x192 ve 512x512 boyutlarında olmalı (şu an aynı dosya kullanılıyor)
3. **Cache Stratejisi:** Network-first kullanılıyor, offline fallback var
4. **Update Kontrolü:** Service worker her saat güncellemeleri kontrol eder

## 🎯 Gelecek İyileştirmeler

- [ ] Push notifications
- [ ] Background sync
- [ ] App shortcuts (Android)
- [ ] Share target API
- [ ] File system access

