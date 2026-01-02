/**
 * Environment variables validation
 * Uygulama başlangıcında gerekli environment variable'ları kontrol eder
 */

interface EnvConfig {
  DATABASE_URL?: string;
  JWT_SECRET?: string;
  NEXT_PUBLIC_SITE_URL?: string;
  NODE_ENV?: string;
}

/**
 * Gerekli environment variable'ları kontrol et
 */
export function validateEnv(): void {
  const required: (keyof EnvConfig)[] = [];
  
  // Development'da DATABASE_URL opsiyonel (SQLite kullanılabilir)
  // Production'da zorunlu
  if (process.env.NODE_ENV === 'production') {
    required.push('DATABASE_URL');
  }
  
  // JWT_SECRET her zaman gerekli (güvenlik için)
  required.push('JWT_SECRET');
  
  // NEXT_PUBLIC_SITE_URL production'da gerekli
  if (process.env.NODE_ENV === 'production') {
    required.push('NEXT_PUBLIC_SITE_URL');
  }
  
  const missing: string[] = [];
  
  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }
  
  if (missing.length > 0) {
    const errorMessage = `❌ Missing required environment variables: ${missing.join(', ')}\n\n` +
      `Please set these variables in your .env.local file:\n` +
      missing.map(key => `  ${key}=your_value_here`).join('\n');
    
    throw new Error(errorMessage);
  }
  
  // JWT_SECRET güvenlik kontrolü
  if (process.env.JWT_SECRET) {
    const jwtSecret = process.env.JWT_SECRET;
    if (jwtSecret.length < 32) {
      console.warn('⚠️  WARNING: JWT_SECRET should be at least 32 characters long for security!');
    }
    if (jwtSecret === 'change-this-secret-in-production' || jwtSecret === 'your-secret-key') {
      console.warn('⚠️  WARNING: JWT_SECRET is using default value! Please change it in production!');
    }
  }
}

/**
 * Environment variable'ı güvenli şekilde al
 */
export function getEnv(key: keyof EnvConfig, defaultValue?: string): string {
  const value = process.env[key];
  
  if (!value && !defaultValue) {
    throw new Error(`Environment variable ${key} is not set and no default value provided`);
  }
  
  return value || defaultValue || '';
}

/**
 * Environment variable'ın var olup olmadığını kontrol et
 */
export function hasEnv(key: keyof EnvConfig): boolean {
  return !!process.env[key];
}

