import { NextRequest } from 'next/server';
import { rateLimit as rateLimitFn, getClientIP } from '@/lib/rateLimit';
import { createErrorResponse } from '@/lib/apiHandler';

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  identifier?: string;
  errorMessage?: string;
}

/**
 * Rate limiting wrapper - API route'lar için
 */
export async function withRateLimit(
  request: NextRequest,
  config: RateLimitConfig,
  handler: () => Promise<Response>
): Promise<Response> {
  const clientIP = getClientIP(request);
  const identifier = config.identifier || `default:${clientIP}`;
  
  const rateLimitResult = rateLimitFn(identifier, {
    windowMs: config.windowMs,
    maxRequests: config.maxRequests,
  });

  if (!rateLimitResult.allowed) {
    return createErrorResponse(
      config.errorMessage || 'Çok fazla istek. Lütfen bir süre sonra tekrar deneyin.',
      429
    );
  }

  return handler();
}

/**
 * Common rate limit configs
 */
export const RATE_LIMITS = {
  LOGIN: {
    windowMs: 5 * 60 * 1000, // 5 dakika
    maxRequests: 5,
    errorMessage: 'Çok fazla giriş denemesi. Lütfen bir süre sonra tekrar deneyin.',
  },
  REGISTER: {
    windowMs: 15 * 60 * 1000, // 15 dakika
    maxRequests: 3,
    errorMessage: 'Çok fazla kayıt denemesi. Lütfen bir süre sonra tekrar deneyin.',
  },
  CONTACT: {
    windowMs: 15 * 60 * 1000, // 15 dakika
    maxRequests: 3,
    errorMessage: 'Çok fazla mesaj gönderimi. Lütfen bir süre sonra tekrar deneyin.',
  },
  NEWSLETTER: {
    windowMs: 60 * 60 * 1000, // 1 saat
    maxRequests: 1,
    errorMessage: 'Zaten abone oldunuz. Lütfen daha sonra tekrar deneyin.',
  },
  UPLOAD: {
    windowMs: 60 * 1000, // 1 dakika
    maxRequests: 10,
    errorMessage: 'Çok fazla dosya yükleme denemesi. Lütfen bir süre sonra tekrar deneyin.',
  },
  REVIEW: {
    windowMs: 10 * 60 * 1000, // 10 dakika
    maxRequests: 3,
    errorMessage: 'Çok fazla yorum denemesi. Lütfen bir süre sonra tekrar deneyin.',
  },
} as const;

