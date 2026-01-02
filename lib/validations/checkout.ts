import { z } from 'zod';

/**
 * Checkout form validation schemas
 */

// Customer info validation
export const customerInfoSchema = z.object({
  customerName: z.string()
    .min(2, 'İsim en az 2 karakter olmalıdır')
    .max(100, 'İsim en fazla 100 karakter olabilir')
    .regex(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/, 'İsim sadece harf içermelidir'),
  customerEmail: z.string()
    .email('Geçersiz e-posta formatı')
    .toLowerCase()
    .trim(),
  customerPhone: z.string()
    .regex(/^[0-9+\s()-]+$/, 'Geçersiz telefon formatı')
    .min(10, 'Telefon en az 10 karakter olmalıdır')
    .max(20, 'Telefon en fazla 20 karakter olabilir'),
  customerAddress: z.string()
    .min(10, 'Adres en az 10 karakter olmalıdır')
    .max(500, 'Adres en fazla 500 karakter olabilir'),
  city: z.string()
    .min(2, 'Şehir en az 2 karakter olmalıdır')
    .max(50, 'Şehir en fazla 50 karakter olabilir'),
  district: z.string()
    .min(2, 'İlçe en az 2 karakter olmalıdır')
    .max(50, 'İlçe en fazla 50 karakter olabilir'),
  postalCode: z.string()
    .regex(/^[0-9]{5}$/, 'Posta kodu 5 haneli sayı olmalıdır')
    .optional(),
});

// Credit card validation
export const creditCardSchema = z.object({
  cardNumber: z.string()
    .regex(/^[0-9\s]{13,19}$/, 'Geçersiz kart numarası')
    .refine((val) => {
      const digits = val.replace(/\s/g, '');
      // Luhn algorithm check
      let sum = 0;
      let isEven = false;
      for (let i = digits.length - 1; i >= 0; i--) {
        let digit = parseInt(digits[i]);
        if (isEven) {
          digit *= 2;
          if (digit > 9) digit -= 9;
        }
        sum += digit;
        isEven = !isEven;
      }
      return sum % 10 === 0;
    }, 'Geçersiz kart numarası (Luhn algoritması kontrolü başarısız)'),
  cardName: z.string()
    .min(2, 'Kart üzerindeki isim en az 2 karakter olmalıdır')
    .max(50, 'Kart üzerindeki isim en fazla 50 karakter olabilir')
    .regex(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/, 'Kart üzerindeki isim sadece harf içermelidir'),
  cardExpiry: z.string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Geçersiz son kullanma tarihi (MM/YY formatında olmalıdır)')
    .refine((val) => {
      const [month, year] = val.split('/');
      const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
      const now = new Date();
      return expiryDate > now;
    }, 'Kartın son kullanma tarihi geçmiş'),
  cardCvv: z.string()
    .regex(/^\d{3,4}$/, 'CVV 3 veya 4 haneli sayı olmalıdır'),
});

// Payment method validation
export const paymentMethodSchema = z.enum(['credit-card', 'bank-transfer'], {
  errorMap: () => ({ message: 'Geçerli bir ödeme yöntemi seçiniz' }),
});

// Complete checkout validation
export const checkoutSchema = z.object({
  customerInfo: customerInfoSchema,
  paymentMethod: paymentMethodSchema,
  cardData: creditCardSchema.optional(),
  agreeTerms: z.boolean().refine((val) => val === true, {
    message: 'Sözleşmeleri kabul etmeniz gerekmektedir',
  }),
  notes: z.string().max(1000, 'Notlar en fazla 1000 karakter olabilir').optional(),
}).refine((data) => {
  // Credit card için cardData zorunlu
  if (data.paymentMethod === 'credit-card' && !data.cardData) {
    return false;
  }
  return true;
}, {
  message: 'Kredi kartı bilgileri gerekli',
  path: ['cardData'],
});

