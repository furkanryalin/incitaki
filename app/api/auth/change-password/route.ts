import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, comparePassword, validatePassword } from '@/lib/auth';
import { rateLimit, getClientIP } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - 15 dakikada maksimum 5 şifre değiştirme denemesi
    const clientIP = getClientIP(request);
    const rateLimitResult = rateLimit(`change-password:${clientIP}`, {
      windowMs: 15 * 60 * 1000, // 15 dakika
      maxRequests: 5,
    });

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: 'Çok fazla şifre değiştirme denemesi. Lütfen bir süre sonra tekrar deneyin.',
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000),
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
          },
        }
      );
    }

    const { userId, currentPassword, newPassword } = await request.json();

    if (!userId || !currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Tüm alanlar gerekli' },
        { status: 400 }
      );
    }

    // Yeni şifre güçlülük kontrolü
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.message },
        { status: 400 }
      );
    }

    // Eski ve yeni şifre aynı olamaz
    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: 'Yeni şifre mevcut şifre ile aynı olamaz' },
        { status: 400 }
      );
    }

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // Mevcut şifreyi kontrol et (hash karşılaştırması)
    const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
    
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: 'Mevcut şifre hatalı' },
        { status: 400 }
      );
    }

    // Yeni şifreyi hash'le ve güncelle
    const hashedNewPassword = await hashPassword(newPassword);
    
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    return NextResponse.json({ 
      success: true,
      message: 'Şifre başarıyla değiştirildi',
    }, {
      headers: {
        'X-RateLimit-Limit': '5',
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
      },
    });
  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json(
      { error: 'Şifre değiştirilemedi' },
      { status: 500 }
    );
  }
}

