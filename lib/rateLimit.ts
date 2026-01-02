/**
 * Basit in-memory rate limiting
 * Production'da Redis gibi bir cache kullanılmalı
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

// Her 15 dakikada bir temizlik yap
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}, 15 * 60 * 1000);

export interface RateLimitOptions {
  windowMs: number; // Zaman penceresi (milisaniye)
  maxRequests: number; // Maksimum istek sayısı
}

export function rateLimit(
  identifier: string,
  options: RateLimitOptions
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const key = identifier;
  
  // Mevcut kaydı kontrol et
  const record = store[key];
  
  if (!record || record.resetTime < now) {
    // Yeni kayıt veya süresi dolmuş
    store[key] = {
      count: 1,
      resetTime: now + options.windowMs,
    };
    return {
      allowed: true,
      remaining: options.maxRequests - 1,
      resetTime: now + options.windowMs,
    };
  }
  
  // Kayıt var ve süresi dolmamış
  if (record.count >= options.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }
  
  // İsteğe izin ver
  record.count += 1;
  return {
    allowed: true,
    remaining: options.maxRequests - record.count,
    resetTime: record.resetTime,
  };
}

/**
 * Rate limit store'unu temizle (development için)
 */
export function clearRateLimit(identifier?: string): void {
  if (identifier) {
    delete store[identifier];
  } else {
    Object.keys(store).forEach((key) => delete store[key]);
  }
}

/**
 * IP adresini al (proxy arkasında çalışıyorsa)
 */
export function getClientIP(request: Request): string {
  // X-Forwarded-For header'ından IP al (proxy/load balancer arkasında)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  // X-Real-IP header'ından IP al
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  
  // Fallback
  return 'unknown';
}
