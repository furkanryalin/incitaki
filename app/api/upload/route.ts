import { NextRequest, NextResponse } from 'next/server';
import { uploadImageToCloudinary } from '@/lib/cloudinary';
import { rateLimit, getClientIP } from '@/lib/rateLimit';

// Güvenli dosya uzantıları
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.heic'];
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/HEIC',
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Dosya adını güvenli hale getirir
 */
function sanitizeFileName(fileName: string): string {
  // Tehlikeli karakterleri kaldır
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '')
    .replace(/\.\./g, '') // Path traversal koruması
    .slice(0, 100); // Maksimum uzunluk
}

/**
 * Dosya uzantısını kontrol eder
 */
function isValidExtension(fileName: string): boolean {
  const ext = fileName.toLowerCase().split('.').pop();
  return ext ? ALLOWED_EXTENSIONS.includes(`.${ext}`) : false;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - 1 dakikada maksimum 10 upload
    const clientIP = getClientIP(request);
    const rateLimitResult = rateLimit(`upload:${clientIP}`, {
      windowMs: 60 * 1000, // 1 dakika
      maxRequests: 10,
    });

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: 'Çok fazla dosya yükleme denemesi. Lütfen bir süre sonra tekrar deneyin.',
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Dosya bulunamadı' },
        { status: 400 }
      );
    }

    // Dosya boyutu kontrolü
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Dosya boyutu 10MB\'dan büyük olamaz' },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        { error: 'Dosya boş olamaz' },
        { status: 400 }
      );
    }

    // Dosya adı güvenliği
    const sanitizedFileName = sanitizeFileName(file.name);
    if (!sanitizedFileName || !isValidExtension(sanitizedFileName)) {
      return NextResponse.json(
        { error: 'Geçersiz dosya adı veya formatı' },
        { status: 400 }
      );
    }

    // MIME type kontrolü
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      // MIME type yanlış olabilir, uzantıya göre kontrol et
      const ext = sanitizedFileName.split('.').pop()?.toLowerCase();
      if (!ext || !ALLOWED_EXTENSIONS.includes(`.${ext}`)) {
        return NextResponse.json(
          { error: 'Sadece JPEG, PNG, WebP, GIF veya HEIC formatları kabul edilir' },
          { status: 400 }
        );
      }
    }

    // Dosya adını oluştur (timestamp + random + extension)
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const extension = sanitizedFileName.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `product_${timestamp}_${random}.${extension}`;

    // Dosyayı Cloudinary'ye yükle
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const cloudinaryResult = await uploadImageToCloudinary(buffer, fileName);
    // Cloudinary'den dönen url'yi kullan
    return NextResponse.json({
      success: true,
      url: cloudinaryResult.secure_url,
      fileName: cloudinaryResult.public_id,
    }, {
      headers: {
        'X-RateLimit-Limit': '10',
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Dosya yükleme hatası' },
      { status: 500 }
    );
  }
}

