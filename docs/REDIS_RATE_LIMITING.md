# ⚡ Redis Rate Limiting Rehberi

Bu dokümantasyon, in-memory rate limiting'den Redis'e geçiş için rehber içerir.

---

## 📋 Ön Gereksinimler

1. Redis instance (Upstash, Redis Cloud, AWS ElastiCache, vb.)
2. Redis connection URL
3. `ioredis` paketi

---

## 🚀 Kurulum

### 1. Redis Instance Oluştur

**Upstash (Önerilen - Serverless):**
```bash
# Upstash dashboard'dan Redis database oluştur
# REST API URL ve Token'ı al
```

**Redis Cloud:**
```bash
# Redis Cloud dashboard'dan database oluştur
# Connection string'i al
```

**Local Redis (Development):**
```bash
# Docker ile
docker run -d -p 6379:6379 redis:alpine

# veya Homebrew (macOS)
brew install redis
brew services start redis
```

---

### 2. Paket Kurulumu

```bash
npm install ioredis
npm install --save-dev @types/ioredis
```

---

### 3. Environment Variable Ekle

`.env.local` dosyasına ekleyin:

```env
# Redis Connection
REDIS_URL="redis://localhost:6379"
# veya Upstash için
REDIS_URL="https://your-redis.upstash.io"
REDIS_TOKEN="your-token"
```

---

### 4. Redis Client Oluştur

`lib/redis.ts` dosyası oluşturun:

```typescript
import Redis from 'ioredis';

let redis: Redis | null = null;

export function getRedisClient(): Redis {
  if (redis) {
    return redis;
  }

  const redisUrl = process.env.REDIS_URL;
  
  if (!redisUrl) {
    throw new Error('REDIS_URL environment variable is not set');
  }

  // Upstash için özel konfigürasyon
  if (redisUrl.startsWith('https://')) {
    redis = new Redis({
      host: redisUrl.replace('https://', ''),
      port: 6379,
      password: process.env.REDIS_TOKEN,
      tls: {
        rejectUnauthorized: false,
      },
    });
  } else {
    // Standart Redis connection
    redis = new Redis(redisUrl);
  }

  redis.on('error', (err) => {
    console.error('Redis Client Error:', err);
  });

  return redis;
}

export async function closeRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}
```

---

### 5. Rate Limiting'i Güncelle

`lib/rateLimit.ts` dosyasını güncelleyin:

```typescript
import { getRedisClient } from './redis';

export interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
}

export async function rateLimit(
  identifier: string,
  options: RateLimitOptions
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const redis = getRedisClient();
  const key = `ratelimit:${identifier}`;
  const now = Date.now();
  
  try {
    // Mevcut count'u al
    const count = await redis.incr(key);
    
    // İlk istekse TTL set et
    if (count === 1) {
      await redis.expire(key, Math.ceil(options.windowMs / 1000));
    }
    
    // TTL'i al (reset time için)
    const ttl = await redis.ttl(key);
    const resetTime = now + (ttl * 1000);
    
    if (count > options.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime,
      };
    }
    
    return {
      allowed: true,
      remaining: options.maxRequests - count,
      resetTime,
    };
  } catch (error) {
    // Redis hatası durumunda fallback: isteğe izin ver
    console.error('Redis rate limit error:', error);
    return {
      allowed: true,
      remaining: options.maxRequests - 1,
      resetTime: now + options.windowMs,
    };
  }
}

export async function clearRateLimit(identifier?: string): Promise<void> {
  const redis = getRedisClient();
  
  if (identifier) {
    await redis.del(`ratelimit:${identifier}`);
  } else {
    // Tüm rate limit key'lerini temizle (dikkatli kullan!)
    const keys = await redis.keys('ratelimit:*');
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
}
```

---

## 🔧 Production Deployment

### Vercel

1. Environment variables ekle:
   - `REDIS_URL`
   - `REDIS_TOKEN` (Upstash için)

2. Deploy:
```bash
vercel --prod
```

### Diğer Platformlar

Environment variable'ları platform'unuzun ayarlarından ekleyin.

---

## ⚠️ Önemli Notlar

1. **Connection Pooling:** Redis client connection pooling kullanır
2. **Error Handling:** Redis hatası durumunda fallback mekanizması var
3. **Key Expiration:** Key'ler otomatik expire olur (memory tasarrufu)
4. **Monitoring:** Redis memory kullanımını izleyin

---

## 🐛 Sorun Giderme

### Connection Error
- Redis URL'ini kontrol edin
- Firewall ayarlarını kontrol edin
- SSL/TLS ayarlarını kontrol edin

### Performance
- Connection pooling kullanın
- Pipeline kullanarak batch işlemler yapın
- Memory limit'lerini izleyin

---

## 📚 Kaynaklar

- [ioredis Documentation](https://github.com/redis/ioredis)
- [Upstash Redis](https://upstash.com/docs)
- [Redis Best Practices](https://redis.io/docs/manual/patterns/)

