import { z } from 'zod';

/**
 * Zod validation schemas for API requests
 */

// Login Schema
export const loginSchema = z.object({
  email: z.string().email('Geçersiz e-posta formatı').toLowerCase().trim(),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır').max(128, 'Şifre en fazla 128 karakter olabilir'),
});

// Register Schema
export const registerSchema = z.object({
  name: z.string().min(2, 'Ad en az 2 karakter olmalıdır').max(100, 'Ad en fazla 100 karakter olabilir').trim(),
  email: z.string().email('Geçersiz e-posta formatı').toLowerCase().trim(),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır').max(128, 'Şifre en fazla 128 karakter olabilir'),
  phone: z.string().regex(/^[0-9+\s()-]+$/, 'Geçersiz telefon formatı').optional().nullable(),
});

// Product Schema
export const productSchema = z.object({
  name: z.string().min(2, 'Ürün adı en az 2 karakter olmalıdır').max(200, 'Ürün adı en fazla 200 karakter olabilir').trim(),
  description: z.string().min(10, 'Açıklama en az 10 karakter olmalıdır').max(5000, 'Açıklama en fazla 5000 karakter olabilir').trim(),
  price: z.number().positive('Fiyat pozitif bir sayı olmalıdır').max(1000000, 'Fiyat çok yüksek'),
  originalPrice: z.number().positive().optional().nullable(),
  image: z.string().url('Geçersiz görsel URL formatı').optional().nullable(),
  images: z.array(z.string().url('Geçersiz görsel URL formatı')).optional().nullable(),
  categoryId: z.string().optional().nullable(),
  subCategoryId: z.string().optional().nullable(),
  category: z.string().min(1, 'Kategori gereklidir').trim(),
  inStock: z.boolean().default(true),
  stock: z.number().int().min(0, 'Stok negatif olamaz').optional().nullable(),
});

// Review Schema
export const reviewSchema = z.object({
  userName: z.string().min(2, 'İsim en az 2 karakter olmalıdır').max(100, 'İsim en fazla 100 karakter olabilir').trim(),
  userEmail: z.string().email('Geçersiz e-posta formatı').toLowerCase().trim(),
  rating: z.number().int().min(1, 'Rating en az 1 olmalıdır').max(5, 'Rating en fazla 5 olabilir'),
  comment: z.string().min(10, 'Yorum en az 10 karakter olmalıdır').max(1000, 'Yorum en fazla 1000 karakter olabilir').trim(),
  userId: z.string().optional().nullable(),
});

// Category Schema
export const categorySchema = z.object({
  name: z.string().min(2, 'Kategori adı en az 2 karakter olmalıdır').max(100, 'Kategori adı en fazla 100 karakter olabilir').trim(),
  slug: z.string().min(2, 'Slug en az 2 karakter olmalıdır').max(100, 'Slug en fazla 100 karakter olabilir').regex(/^[a-z0-9-]+$/, 'Slug sadece küçük harf, sayı ve tire içerebilir').optional().nullable(),
  image: z.string().url('Geçersiz görsel URL formatı').optional().nullable(),
});

// Address Schema
export const addressSchema = z.object({
  title: z.string().min(2, 'Başlık en az 2 karakter olmalıdır').max(50, 'Başlık en fazla 50 karakter olabilir').trim(),
  fullName: z.string().min(2, 'Ad Soyad en az 2 karakter olmalıdır').max(100, 'Ad Soyad en fazla 100 karakter olabilir').trim(),
  phone: z.string().regex(/^[0-9+\s()-]+$/, 'Geçersiz telefon formatı').min(10, 'Telefon en az 10 karakter olmalıdır'),
  address: z.string().min(10, 'Adres en az 10 karakter olmalıdır').max(500, 'Adres en fazla 500 karakter olabilir').trim(),
  city: z.string().min(2, 'Şehir en az 2 karakter olmalıdır').max(50, 'Şehir en fazla 50 karakter olabilir').trim(),
  district: z.string().min(2, 'İlçe en az 2 karakter olmalıdır').max(50, 'İlçe en fazla 50 karakter olabilir').trim(),
  postalCode: z.string().regex(/^[0-9]{5}$/, 'Posta kodu 5 haneli sayı olmalıdır').optional().nullable(),
  isDefault: z.boolean().default(false),
});

// Order Schema
export const orderSchema = z.object({
  customerName: z.string().min(2, 'Müşteri adı en az 2 karakter olmalıdır').max(100, 'Müşteri adı en fazla 100 karakter olabilir').trim(),
  customerEmail: z.string().email('Geçersiz e-posta formatı').toLowerCase().trim(),
  customerPhone: z.string().regex(/^[0-9+\s()-]+$/, 'Geçersiz telefon formatı').min(10, 'Telefon en az 10 karakter olmalıdır'),
  shippingAddress: z.string().min(10, 'Adres en az 10 karakter olmalıdır').max(500, 'Adres en fazla 500 karakter olabilir').trim(),
  items: z.array(z.object({
    productId: z.string().min(1, 'Ürün ID gereklidir'),
    quantity: z.number().int().positive('Miktar pozitif bir sayı olmalıdır'),
    price: z.number().positive('Fiyat pozitif bir sayı olmalıdır'),
  })).min(1, 'En az bir ürün seçilmelidir'),
  totalPrice: z.number().positive('Toplam fiyat pozitif bir sayı olmalıdır'),
  shippingCost: z.number().min(0, 'Kargo ücreti negatif olamaz').default(0),
  notes: z.string().max(1000, 'Notlar en fazla 1000 karakter olabilir').optional().nullable(),
});

// Forgot Password Schema
export const forgotPasswordSchema = z.object({
  email: z.string().email('Geçersiz e-posta formatı').toLowerCase().trim(),
});

// Reset Password Schema
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token gereklidir'),
  newPassword: z.string().min(6, 'Şifre en az 6 karakter olmalıdır').max(128, 'Şifre en fazla 128 karakter olabilir'),
  confirmPassword: z.string().min(6, 'Şifre en az 6 karakter olmalıdır').max(128, 'Şifre en fazla 128 karakter olabilir'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Şifreler eşleşmiyor',
  path: ['confirmPassword'],
});

// Contact Form Schema
export const contactSchema = z.object({
  name: z.string().min(2, 'Ad Soyad en az 2 karakter olmalıdır').max(100, 'Ad Soyad en fazla 100 karakter olabilir').trim(),
  email: z.string().email('Geçersiz e-posta formatı').toLowerCase().trim(),
  message: z.string().min(10, 'Mesaj en az 10 karakter olmalıdır').max(2000, 'Mesaj en fazla 2000 karakter olabilir').trim(),
  subject: z.string().max(200, 'Konu en fazla 200 karakter olabilir').optional().nullable(),
});

// Newsletter Schema
export const newsletterSchema = z.object({
  email: z.string().email('Geçersiz e-posta formatı').toLowerCase().trim(),
});

/**
 * Format Zod errors into a user-friendly message
 */
export function formatZodError(error: z.ZodError): string {
  if (error.errors && error.errors.length > 0) {
    return error.errors[0].message || 'Geçersiz veri';
  }
  return 'Geçersiz veri';
}

/**
 * Create slug from string
 */
export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}
