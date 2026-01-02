import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, validatePassword, validateEmail, sanitizeInput } from '@/lib/auth';
import { requireAdmin } from '@/lib/middleware/adminAuth';

// GET - Tüm kullanıcıları getir
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) {
    return auth.response!;
  }
  try {
    const users = await prisma.user.findMany({
      include: {
        orders: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate total orders and spent for each user
    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      createdAt: user.createdAt.toISOString(),
      totalOrders: user.orders.length,
      totalSpent: user.orders.reduce((sum, order) => sum + order.totalPrice + order.shippingCost, 0),
    }));

    return NextResponse.json({ users: formattedUsers });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Kullanıcılar yüklenemedi' },
      { status: 500 }
    );
  }
}

// POST - Yeni kullanıcı ekle
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) {
    return auth.response!;
  }
  
  try {
    const data = await request.json();
    
    // Input validation
    if (!data.name || !data.email || !data.password) {
      return NextResponse.json(
        { error: 'Ad, e-posta ve şifre gerekli' },
        { status: 400 }
      );
    }

    // Şifre güçlülük kontrolü
    const passwordValidation = validatePassword(data.password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.message },
        { status: 400 }
      );
    }

    const sanitizedEmail = sanitizeInput(data.email.toLowerCase().trim());
    if (!validateEmail(sanitizedEmail)) {
      return NextResponse.json(
        { error: 'Geçersiz e-posta formatı' },
        { status: 400 }
      );
    }

    // Şifreyi hash'le
    const hashedPassword = await hashPassword(data.password);
    
    const user = await prisma.user.create({
      data: {
        name: sanitizeInput(data.name),
        email: sanitizedEmail,
        password: hashedPassword,
        phone: data.phone ? sanitizeInput(data.phone) : null,
        address: data.address ? sanitizeInput(data.address) : null,
      },
    });

    // Şifreyi döndürme
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({ 
      success: true, 
      user: userWithoutPassword 
    });
  } catch (error: any) {
    console.error('Error creating user:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Bu e-posta adresi zaten kullanılıyor' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Kullanıcı eklenemedi' },
      { status: 500 }
    );
  }
}

// PUT - Kullanıcı güncelle
export async function PUT(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) {
    return auth.response!;
  }
  
  try {
    const { id, ...updates } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Kullanıcı ID gerekli' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    
    // Sadece gönderilen alanları güncelle
    if (updates.name) {
      updateData.name = sanitizeInput(updates.name);
    }
    
    if (updates.email) {
      const sanitizedEmail = sanitizeInput(updates.email.toLowerCase().trim());
      if (!validateEmail(sanitizedEmail)) {
        return NextResponse.json(
          { error: 'Geçersiz e-posta formatı' },
          { status: 400 }
        );
      }
      updateData.email = sanitizedEmail;
    }
    
    if (updates.password) {
      const passwordValidation = validatePassword(updates.password);
      if (!passwordValidation.valid) {
        return NextResponse.json(
          { error: passwordValidation.message },
          { status: 400 }
        );
      }
      // Şifreyi hash'le
      updateData.password = await hashPassword(updates.password);
    }
    
    if (updates.phone !== undefined) {
      updateData.phone = updates.phone ? sanitizeInput(updates.phone) : null;
    }
    
    if (updates.address !== undefined) {
      updateData.address = updates.address ? sanitizeInput(updates.address) : null;
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    // Şifreyi döndürme
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({ 
      success: true, 
      user: userWithoutPassword 
    });
  } catch (error: any) {
    console.error('Error updating user:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Bu e-posta adresi zaten kullanılıyor' },
        { status: 400 }
      );
    }
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Kullanıcı güncellenemedi' },
      { status: 500 }
    );
  }
}
