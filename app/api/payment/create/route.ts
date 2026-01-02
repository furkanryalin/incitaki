import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { validateRequest, handleApiError, createSuccessResponse, createErrorResponse } from '@/lib/apiHandler';
import { rateLimit, getClientIP } from '@/lib/rateLimit';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

// Payment request validation schema
const paymentRequestSchema = z.object({
  orderData: z.object({
    customerName: z.string().min(2, 'İsim en az 2 karakter olmalıdır').max(100),
    customerEmail: z.string().email('Geçersiz e-posta formatı'),
    customerPhone: z.string().regex(/^[0-9+\s()-]+$/, 'Geçersiz telefon formatı').min(10),
    shippingAddress: z.string().min(10, 'Adres en az 10 karakter olmalıdır'),
    city: z.string().min(2),
    district: z.string().min(2),
    postalCode: z.string().regex(/^[0-9]{5}$/, 'Posta kodu 5 haneli sayı olmalıdır').optional(),
    notes: z.string().max(1000).optional(),
  }),
  paymentMethod: z.enum(['credit-card', 'bank-transfer']),
  cardData: z.object({
    cardNumber: z.string().regex(/^[0-9\s]{13,19}$/, 'Geçersiz kart numarası'),
    cardName: z.string().min(2, 'Kart üzerindeki isim gerekli'),
    cardExpiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Geçersiz son kullanma tarihi'),
    cardCvv: z.string().regex(/^\d{3,4}$/, 'Geçersiz CVV'),
  }).optional(), // Sadece credit-card için gerekli
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().positive(),
    price: z.number().positive(),
  })).min(1, 'En az bir ürün seçilmelidir'),
  totalPrice: z.number().positive(),
  shippingCost: z.number().min(0),
});

// POST - Ödeme işlemi başlat
export async function POST(request: NextRequest) {
  try {
    // Rate limiting - 1 dakikada maksimum 3 ödeme denemesi
    const clientIP = getClientIP(request);
    const rateLimitResult = rateLimit(`payment:${clientIP}`, {
      windowMs: 60 * 1000, // 1 dakika
      maxRequests: 3,
    });

    if (!rateLimitResult.allowed) {
      return createErrorResponse(
        'Çok fazla ödeme denemesi. Lütfen bir süre sonra tekrar deneyin.',
        429
      );
    }

    // Validate request body
    const validation = await validateRequest(request, paymentRequestSchema);
    if (!validation.success) {
      return validation.response;
    }

    const data = validation.data;
    const session = await getSession();
    const userId = session?.userId || null;

    // Payment method validation
    if (data.paymentMethod === 'credit-card' && !data.cardData) {
      return createErrorResponse('Kredi kartı bilgileri gerekli', 400);
    }

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // Check product availability and stock
    for (const item of data.items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        return createErrorResponse(`Ürün bulunamadı: ${item.productId}`, 404);
      }

      if (!product.inStock) {
        return createErrorResponse(`Ürün stokta yok: ${product.name}`, 400);
      }

      if (product.stock !== null && product.stock < item.quantity) {
        return createErrorResponse(
          `Yetersiz stok: ${product.name} (Mevcut: ${product.stock}, İstenen: ${item.quantity})`,
          400
        );
      }
    }

    // Calculate final total
    const finalTotal = data.totalPrice + data.shippingCost;

    // Payment processing based on method
    if (data.paymentMethod === 'credit-card') {
      // iyzico payment processing
      try {
        const { createPayment } = await import('@/lib/payment/iyzico');
        
        // Prepare payment request
        const paymentRequest = {
          price: finalTotal,
          currency: 'TRY',
          basketId: orderNumber,
          paymentCard: {
            cardHolderName: data.cardData!.cardName,
            cardNumber: data.cardData!.cardNumber.replace(/\s/g, ''),
            expireMonth: data.cardData!.cardExpiry.split('/')[0],
            expireYear: '20' + data.cardData!.cardExpiry.split('/')[1],
            cvc: data.cardData!.cardCvv,
          },
          buyer: {
            id: userId || 'guest',
            name: data.orderData.customerName.split(' ')[0] || data.orderData.customerName,
            surname: data.orderData.customerName.split(' ').slice(1).join(' ') || '',
            email: data.orderData.customerEmail,
            phone: data.orderData.customerPhone,
            identityNumber: '11111111111', // Test için, production'da gerçek TC kimlik no gerekli
            city: data.orderData.city,
            country: 'Turkey',
            address: data.orderData.shippingAddress,
          },
          shippingAddress: {
            contactName: data.orderData.customerName,
            city: data.orderData.city,
            country: 'Turkey',
            address: data.orderData.shippingAddress,
            zipCode: data.orderData.postalCode || '',
          },
          billingAddress: {
            contactName: data.orderData.customerName,
            city: data.orderData.city,
            country: 'Turkey',
            address: data.orderData.shippingAddress,
            zipCode: data.orderData.postalCode || '',
          },
          basketItems: await Promise.all(data.items.map(async (item) => {
            const product = await prisma.product.findUnique({
              where: { id: item.productId },
              select: { name: true, categoryRelation: { select: { name: true } } },
            });
            return {
              id: item.productId,
              name: product?.name || 'Ürün',
              category1: product?.categoryRelation?.name || 'Genel',
              itemType: 'PHYSICAL',
              price: item.price.toFixed(2),
            };
          })),
        };

        // Process payment
        const paymentResult = await createPayment(paymentRequest);

        if (paymentResult.paymentStatus !== 'SUCCESS') {
          return createErrorResponse('Ödeme işlemi başarısız', 400);
        }

        // Payment successful - create order
        const order = await prisma.order.create({
          data: {
            orderNumber,
            customerName: data.orderData.customerName,
            customerEmail: data.orderData.customerEmail,
            customerPhone: data.orderData.customerPhone,
            customerAddress: data.orderData.shippingAddress,
            totalPrice: data.totalPrice,
            shippingCost: data.shippingCost,
            status: 'processing', // Payment successful, order processing
            notes: data.orderData.notes,
            userId,
            items: {
              create: data.items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
              })),
            },
          },
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        });

        // Update product stocks
        for (const item of data.items) {
          const product = await prisma.product.findUnique({
            where: { id: item.productId },
          });

          if (product && product.stock !== null && product.stock !== undefined) {
            const newStock = Math.max(0, product.stock - item.quantity);
            await prisma.product.update({
              where: { id: item.productId },
              data: {
                stock: newStock,
                inStock: newStock > 0,
              },
            });
          }
        }

        // Send confirmation emails
        try {
          const { sendOrderConfirmationEmail, sendAdminOrderNotification } = await import('@/lib/email');
          await sendOrderConfirmationEmail(order);
          await sendAdminOrderNotification(order);
        } catch (emailError) {
          console.error('Email gönderme hatası:', emailError);
        }

        return createSuccessResponse(
          {
            order: {
              ...order,
              paymentId: paymentResult.paymentId,
              paymentStatus: paymentResult.paymentStatus,
            },
          },
          'Ödeme başarılı! Siparişiniz oluşturuldu.',
          201
        );
      } catch (paymentError: any) {
        console.error('Payment processing error:', paymentError);
        return createErrorResponse(
          paymentError.message || 'Ödeme işlemi sırasında bir hata oluştu',
          500
        );
      }
    } else if (data.paymentMethod === 'bank-transfer') {
      // Bank transfer - order created with pending status
      const order = await prisma.order.create({
        data: {
          orderNumber,
          customerName: data.orderData.customerName,
          customerEmail: data.orderData.customerEmail,
          customerPhone: data.orderData.customerPhone,
          customerAddress: data.orderData.shippingAddress,
          totalPrice: data.totalPrice,
          shippingCost: data.shippingCost,
          status: 'pending', // Waiting for bank transfer
          notes: data.orderData.notes || 'Havale/EFT ile ödeme bekleniyor',
          userId,
          items: {
            create: data.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      // Send confirmation emails
      try {
        const { sendOrderConfirmationEmail, sendAdminOrderNotification } = await import('@/lib/email');
        await sendOrderConfirmationEmail(order);
        await sendAdminOrderNotification(order);
      } catch (emailError) {
        console.error('Email gönderme hatası:', emailError);
      }

      return createSuccessResponse(
        { order },
        'Siparişiniz oluşturuldu. Havale/EFT bilgileri e-posta ile gönderilecektir.',
        201
      );
    }

    return createErrorResponse('Geçersiz ödeme yöntemi', 400);
  } catch (error) {
    return handleApiError(error);
  }
}

