import bcrypt from 'bcryptjs';

/**
 * Şifreyi hash'ler
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Şifreyi hash ile karşılaştırır
 */
export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Şifre güçlülük kontrolü
 */
export function validatePassword(password: string): {
  valid: boolean;
  message?: string;
} {
  if (password.length < 6) {
    return {
      valid: false,
      message: 'Şifre en az 6 karakter olmalıdır',
    };
  }

  if (password.length > 128) {
    return {
      valid: false,
      message: 'Şifre en fazla 128 karakter olabilir',
    };
  }

  // Güçlü şifre kontrolü (isteğe bağlı - şu an aktif değil)
  // Gelecekte eklenebilir: büyük/küçük harf, sayı, özel karakter kontrolü

  // if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
  //   return {
  //     valid: false,
  //     message: 'Şifre en az bir büyük harf, küçük harf, rakam ve özel karakter içermelidir',
  //   };
  // }

  return { valid: true };
}

/**
 * E-posta formatı kontrolü
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Input sanitization - XSS koruması için temel temizleme
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  // HTML tag'lerini kaldır
  return input
    .replace(/<[^>]*>/g, '') // HTML tag'leri
    .replace(/[<>]/g, '') // Kalan < ve >
    .trim()
    .slice(0, 1000); // Maksimum uzunluk
}

/**
 * SQL injection koruması için özel karakterleri temizle
 */
export function sanitizeForDatabase(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  // Tehlikeli karakterleri kaldır veya escape et
  return input
    .replace(/['";\\]/g, '') // SQL injection karakterleri
    .trim();
}

