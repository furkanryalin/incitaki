import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { addressSchema } from '@/lib/validations';
import { validateRequest, handleApiError, createSuccessResponse, createErrorResponse, validateSearchParams } from '@/lib/apiHandler';
import { z } from 'zod';

// GET - Kullanıcının adreslerini getir
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Validate search params
    const userIdSchema = z.object({
      userId: z.string().min(1, 'Kullanıcı ID gerekli'),
    });
    
    const validation = validateSearchParams(searchParams, userIdSchema);
    if (!validation.success) {
      return validation.response;
    }
    
    const { userId } = validation.data;

    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return createSuccessResponse({ addresses });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST - Yeni adres ekle
export async function POST(request: NextRequest) {
  try {
    // Validate request body
    const addressWithUserIdSchema = addressSchema.extend({
      userId: z.string().min(1, 'Kullanıcı ID gerekli'),
    });
    
    const validation = await validateRequest(request, addressWithUserIdSchema);
    if (!validation.success) {
      return validation.response;
    }

    const { userId, isDefault, fullName, ...addressData } = validation.data;

    // Eğer varsayılan adres seçildiyse, diğer adreslerin varsayılan durumunu kaldır
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        ...addressData,
        name: fullName, // fullName -> name mapping
        userId,
        isDefault: isDefault ?? false,
      },
    });

    return createSuccessResponse({ address }, 'Adres başarıyla eklendi', 201);
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT - Adres güncelle
export async function PUT(request: NextRequest) {
  try {
    // Validate request body
    const updateAddressSchema = addressSchema
      .extend({
        id: z.string().min(1, 'Adres ID gerekli'),
        userId: z.string().min(1, 'Kullanıcı ID gerekli'),
      })
      .partial()
      .required({ id: true, userId: true });
    
    const validation = await validateRequest(request, updateAddressSchema);
    if (!validation.success) {
      return validation.response;
    }

    const { id, userId, isDefault, fullName, ...updates } = validation.data;

    // Eğer varsayılan adres seçildiyse, diğer adreslerin varsayılan durumunu kaldır
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.update({
      where: { id },
      data: {
        ...updates,
        ...(fullName && { name: fullName }), // fullName -> name mapping
        ...(isDefault !== undefined && { isDefault }),
      },
    });

    return createSuccessResponse({ address }, 'Adres başarıyla güncellendi');
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE - Adres sil
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Validate search params
    const idSchema = z.object({
      id: z.string().min(1, 'Adres ID gerekli'),
    });
    
    const validation = validateSearchParams(searchParams, idSchema);
    if (!validation.success) {
      return validation.response;
    }
    
    const { id } = validation.data;

    await prisma.address.delete({
      where: { id },
    });

    return createSuccessResponse(undefined, 'Adres başarıyla silindi');
  } catch (error) {
    return handleApiError(error);
  }
}
