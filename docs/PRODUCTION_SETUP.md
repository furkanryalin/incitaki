# 🚀 Production Setup Rehberi

Bu dokümantasyon, siteyi canlıya almak için gerekli adımları içerir.

---

## 📋 Ön Gereksinimler

1. **Domain** - Kendi domain'iniz (örn: incitaki.com)
2. **Hosting** - Vercel, Railway, AWS, vb.
3. **Database** - PostgreSQL (production için)
4. **Email Servisi** - SendGrid, Nodemailer, vb.
5. **Payment Gateway** - iyzico, PayTR, Stripe (opsiyonel)

---

## 🔧 1. Environment Variables

`.env.production` veya hosting platform'unuzun environment variables ayarlarına ekleyin:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"

# JWT Secret (güçlü bir secret oluşturun)
JWT_SECRET="your-super-secret-key-min-32-chars"

# Site URL
NEXT_PUBLIC_SITE_URL="https://yourdomain.com"

# Node Environment
NODE_ENV="production"

# Email Service (SendGrid örneği)
EMAIL_SERVICE="sendgrid"
SENDGRID_API_KEY="your-sendgrid-api-key"
FROM_EMAIL="noreply@yourdomain.com"
ADMIN_EMAIL="admin@yourdomain.com"

# Payment Gateway (iyzico örneği - opsiyonel)
IYZICO_API_KEY="your-iyzico-api-key"
IYZICO_SECRET_KEY="your-iyzico-secret-key"
IYZICO_BASE_URL="https://api.iyzipay.com" # Production URL
```

---

## 📧 2. Email Servisi Kurulumu

### SendGrid (Önerilen)

1. [SendGrid](https://sendgrid.com) hesabı oluşturun
2. API Key oluşturun
3. Environment variable'ları ekleyin:
   ```env
   EMAIL_SERVICE="sendgrid"
   SENDGRID_API_KEY="SG.xxxxx"
   FROM_EMAIL="noreply@yourdomain.com"
   ADMIN_EMAIL="admin@yourdomain.com"
   ```

### Nodemailer (Alternatif)

1. Nodemailer paketini kurun:
   ```bash
   npm install nodemailer
   npm install --save-dev @types/nodemailer
   ```

2. `lib/email.ts` dosyasını güncelleyin (Nodemailer entegrasyonu ekleyin)

---

## 💳 3. Payment Gateway Entegrasyonu

### iyzico (Türkiye için önerilen)

1. [iyzico](https://www.iyzico.com) hesabı oluşturun
2. API Key ve Secret Key alın
3. `lib/payment/iyzico.ts` dosyası oluşturun (örnek kod aşağıda)

### PayTR (Alternatif)

1. [PayTR](https://www.paytr.com) hesabı oluşturun
2. Merchant ID ve Merchant Key alın

---

## 🗄️ 4. Database Migration

PostgreSQL'e geçiş için:

1. `docs/POSTGRESQL_MIGRATION.md` rehberini takip edin
2. Production database oluşturun
3. Migration'ı çalıştırın:
   ```bash
   npx prisma migrate deploy
   ```

---

## 🚀 5. Deployment

### Vercel (Önerilen)

1. GitHub repository'yi bağlayın
2. Environment variables'ı ekleyin
3. Build command: `npm run build`
4. Deploy!

### Railway

1. Railway hesabı oluşturun
2. GitHub repository'yi bağlayın
3. PostgreSQL service ekleyin
4. Environment variables'ı ekleyin
5. Deploy!

---

## ✅ 6. Post-Deployment Checklist

- [ ] Domain'i hosting'e bağla
- [ ] SSL sertifikası aktif mi kontrol et
- [ ] Database bağlantısı çalışıyor mu test et
- [ ] Email servisi çalışıyor mu test et (test siparişi ver)
- [ ] Payment gateway çalışıyor mu test et (test ödemesi yap)
- [ ] Admin paneline giriş yapabiliyor musun kontrol et
- [ ] Sipariş oluşturma çalışıyor mu test et
- [ ] Email bildirimleri geliyor mu kontrol et

---

## 🔒 7. Güvenlik Kontrolleri

- [ ] Tüm environment variables production'da doğru mu?
- [ ] JWT_SECRET güçlü mü? (min 32 karakter)
- [ ] HTTPS aktif mi?
- [ ] Security headers çalışıyor mu?
- [ ] Rate limiting aktif mi?
- [ ] CSRF koruması aktif mi?

---

## 📊 8. Monitoring

- [ ] Error tracking (Sentry) kuruldu mu?
- [ ] Analytics (Google Analytics, Vercel Analytics) eklendi mi?
- [ ] Logging sistemi çalışıyor mu?

---

## 🆘 Sorun Giderme

### Email gönderilmiyor
- SendGrid API key doğru mu?
- FROM_EMAIL domain'i doğrulanmış mı?
- Spam klasörünü kontrol et

### Database bağlantı hatası
- DATABASE_URL doğru mu?
- Firewall ayarları doğru mu?
- SSL gerekiyorsa `?sslmode=require` ekle

### Payment gateway hatası
- API key'ler doğru mu?
- Test modunda mı production modunda mı?
- Webhook URL'leri doğru mu?

---

## 📞 Destek

Sorun yaşarsanız:
1. Logları kontrol edin
2. Environment variables'ı kontrol edin
3. Database bağlantısını test edin
4. Email servisini test edin

---

**Başarılar! 🎉**

