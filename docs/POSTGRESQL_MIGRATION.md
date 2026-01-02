# 🗄️ PostgreSQL Migration Rehberi

Bu dokümantasyon, SQLite'dan PostgreSQL'e geçiş için adım adım rehber içerir.

---

## 📋 Ön Gereksinimler

1. PostgreSQL database (Vercel Postgres, Supabase, Railway, AWS RDS, vb.)
2. Database connection string
3. Prisma CLI kurulu

---

## 🚀 Adım Adım Migration

### 1. PostgreSQL Database Oluştur

**Vercel Postgres (Önerilen):**
```bash
# Vercel dashboard'dan Postgres database oluştur
# Connection string'i al
```

**Supabase:**
```bash
# Supabase dashboard'dan yeni proje oluştur
# Settings > Database > Connection string'i al
```

**Railway:**
```bash
# Railway'de yeni PostgreSQL service oluştur
# Connection string'i al
```

---

### 2. Prisma Schema'yı Güncelle

`prisma/schema.prisma` dosyasını açın ve datasource'u güncelleyin:

```prisma
datasource db {
  provider = "postgresql"  // "sqlite" yerine
  url      = env("DATABASE_URL")
}
```

**Not:** Schema'nın geri kalanı aynı kalacak, sadece provider değişecek.

---

### 3. Environment Variable'ı Güncelle

`.env.local` dosyasına PostgreSQL connection string'i ekleyin:

```env
# Development (SQLite - opsiyonel)
# DATABASE_URL="file:./prisma/dev.db"

# Production (PostgreSQL)
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
```

**Connection String Format:**
```
postgresql://[user]:[password]@[host]:[port]/[database]?schema=[schema]
```

---

### 4. Prisma Client'ı Yeniden Oluştur

```bash
# Prisma client'ı yeniden generate et
npx prisma generate

# Database'i push et (schema'yı database'e uygula)
npx prisma db push

# Veya migration oluştur (production için önerilen)
npx prisma migrate dev --name init
```

---

### 5. Veri Migration (Opsiyonel)

Eğer mevcut SQLite veritabanında veri varsa:

```bash
# 1. SQLite veritabanını export et
sqlite3 prisma/dev.db .dump > backup.sql

# 2. PostgreSQL'e import et (gerekirse düzenle)
psql -h host -U user -d database < backup.sql
```

**Not:** SQLite ve PostgreSQL syntax farklılıkları olabilir, manuel düzenleme gerekebilir.

---

### 6. Test Et

```bash
# Development server'ı başlat
npm run dev

# Database bağlantısını test et
npx tsx scripts/test-db.ts
```

---

## 🔧 Production Deployment

### Vercel

1. Vercel dashboard'da environment variable ekle:
   - `DATABASE_URL` = PostgreSQL connection string

2. Deploy:
```bash
vercel --prod
```

### Diğer Platformlar

Environment variable'ı platform'unuzun ayarlarından ekleyin.

---

## ⚠️ Önemli Notlar

1. **Connection Pooling:** Production'da connection pooling kullanın (örn: PgBouncer)
2. **Backup:** Düzenli backup alın
3. **Migration:** Production'da `prisma migrate deploy` kullanın
4. **Indexes:** Prisma otomatik index'leri oluşturur, ekstra index'ler gerekebilir

---

## 🐛 Sorun Giderme

### Connection Error
- Connection string'i kontrol edin
- Firewall ayarlarını kontrol edin
- SSL gerekiyorsa `?sslmode=require` ekleyin

### Migration Error
- Schema'yı kontrol edin
- Mevcut tabloları kontrol edin
- `prisma migrate reset` ile sıfırdan başlayın (dikkat: veri siler!)

---

## 📚 Kaynaklar

- [Prisma PostgreSQL Guide](https://www.prisma.io/docs/concepts/database-connectors/postgresql)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [Supabase](https://supabase.com/docs)

