import crypto from 'crypto';
import { prisma } from './prisma';

/**
 * Güvenli random token oluştur
 */
export function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Password reset token oluştur ve kaydet
 */
export async function createPasswordResetToken(userId: string): Promise<string> {
  const token = generateResetToken();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1); // 1 saat geçerli

  // Eski token'ları temizle (kullanılmış veya süresi dolmuş)
  await prisma.passwordResetToken.deleteMany({
    where: {
      OR: [
        { userId, used: true },
        { userId, expiresAt: { lt: new Date() } },
      ],
    },
  });

  // Yeni token oluştur
  await prisma.passwordResetToken.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });

  return token;
}

/**
 * Password reset token'ı doğrula
 */
export async function verifyPasswordResetToken(
  token: string
): Promise<{ valid: boolean; userId?: string; message?: string }> {
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!resetToken) {
    return {
      valid: false,
      message: 'Geçersiz veya bulunamayan token',
    };
  }

  if (resetToken.used) {
    return {
      valid: false,
      message: 'Bu token zaten kullanılmış',
    };
  }

  if (resetToken.expiresAt < new Date()) {
    return {
      valid: false,
      message: 'Token süresi dolmuş',
    };
  }

  return {
    valid: true,
    userId: resetToken.userId,
  };
}

/**
 * Password reset token'ı kullanıldı olarak işaretle
 */
export async function markTokenAsUsed(token: string): Promise<void> {
  await prisma.passwordResetToken.update({
    where: { token },
    data: { used: true },
  });
}

/**
 * Local development için token'ı console'a yazdır
 * Production'da bu yerine email gönderilir
 */
export function logResetTokenForDevelopment(
  email: string,
  token: string
): void {
  const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/sifre-sifirla?token=${token}`;
  
  console.log('\n🔐 ============================================');
  console.log('📧 ŞİFRE SIFIRLAMA TOKEN (LOCAL DEVELOPMENT)');
  console.log('============================================');
  console.log(`📬 Email: ${email}`);
  console.log(`🔑 Token: ${token}`);
  console.log(`🔗 Reset URL: ${resetUrl}`);
  console.log('============================================\n');
  
  // Production'da burada email gönderilir:
  // await sendPasswordResetEmail(email, resetUrl);
}

