/**
 * Email service utilities
 * Production'da SendGrid, Nodemailer veya başka bir servis kullanılabilir
 */

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Email gönder (Production'da gerçek servis kullanılacak)
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    // Development'ta console'a yazdır
    if (process.env.NODE_ENV === 'development') {
      console.log('\n📧 ============================================');
      console.log('📬 EMAIL GÖNDERİLİYOR');
      console.log('============================================');
      console.log(`To: ${options.to}`);
      console.log(`Subject: ${options.subject}`);
      console.log(`\n${options.text || options.html}`);
      console.log('============================================\n');
      return true;
    }

    // Production'da gerçek email servisi kullanılacak
    // Örnek: SendGrid, Nodemailer, AWS SES, vb.
    
    if (process.env.EMAIL_SERVICE === 'sendgrid' && process.env.SENDGRID_API_KEY) {
      // SendGrid entegrasyonu
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: options.to }],
          }],
          from: {
            email: process.env.FROM_EMAIL || 'noreply@incitaki.com',
            name: 'İnci Takı',
          },
          subject: options.subject,
          content: [
            {
              type: 'text/html',
              value: options.html,
            },
          ],
        }),
      });

      return response.ok;
    }

    // Fallback: Nodemailer veya başka servis
    // TODO: Nodemailer entegrasyonu ekle

    console.warn('Email servisi yapılandırılmamış. Email gönderilmedi.');
    return false;
  } catch (error) {
    console.error('Email gönderme hatası:', error);
    return false;
  }
}

/**
 * Sipariş onay emaili gönder
 */
export async function sendOrderConfirmationEmail(order: any): Promise<boolean> {
  const orderItemsHtml = order.items.map((item: any) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        <strong>${item.product.name}</strong>
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">
        ${item.quantity}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
        ${item.price.toFixed(2)} ₺
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
        ${(item.price * item.quantity).toFixed(2)} ₺
      </td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #ea580c; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
        .order-info { background: white; padding: 15px; margin: 15px 0; border-radius: 8px; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        .total { font-size: 18px; font-weight: bold; color: #ea580c; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Siparişiniz Alındı!</h1>
        </div>
        <div class="content">
          <p>Merhaba <strong>${order.customerName}</strong>,</p>
          <p>Siparişiniz başarıyla alındı. Sipariş detaylarınız aşağıdadır:</p>
          
          <div class="order-info">
            <p><strong>Sipariş No:</strong> ${order.orderNumber}</p>
            <p><strong>Tarih:</strong> ${new Date(order.createdAt).toLocaleString('tr-TR')}</p>
            <p><strong>Durum:</strong> ${order.status === 'pending' ? 'Beklemede' : order.status}</p>
          </div>

          <h3>Sipariş Detayları</h3>
          <table>
            <thead>
              <tr style="background: #f3f4f6;">
                <th style="padding: 10px; text-align: left;">Ürün</th>
                <th style="padding: 10px; text-align: center;">Adet</th>
                <th style="padding: 10px; text-align: right;">Birim Fiyat</th>
                <th style="padding: 10px; text-align: right;">Toplam</th>
              </tr>
            </thead>
            <tbody>
              ${orderItemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="padding: 10px; text-align: right;"><strong>Kargo:</strong></td>
                <td style="padding: 10px; text-align: right;">${order.shippingCost.toFixed(2)} ₺</td>
              </tr>
              <tr>
                <td colspan="3" style="padding: 10px; text-align: right;" class="total">Toplam:</td>
                <td style="padding: 10px; text-align: right;" class="total">${(order.totalPrice + order.shippingCost).toFixed(2)} ₺</td>
              </tr>
            </tfoot>
          </table>

          <div class="order-info">
            <h4>Teslimat Bilgileri</h4>
            <p><strong>Adres:</strong> ${order.customerAddress}</p>
            <p><strong>Telefon:</strong> ${order.customerPhone}</p>
            <p><strong>E-posta:</strong> ${order.customerEmail}</p>
          </div>

          <p>Siparişinizin durumunu takip etmek için hesabınıza giriş yapabilirsiniz.</p>
          
          <div class="footer">
            <p>İnci Takı - Güvenilir Alışveriş</p>
            <p>Bu bir otomatik e-postadır, lütfen yanıtlamayın.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: order.customerEmail,
    subject: `Sipariş Onayı - ${order.orderNumber}`,
    html,
  });
}

/**
 * Admin'e yeni sipariş bildirimi gönder
 */
export async function sendAdminOrderNotification(order: any): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@incitaki.com';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
        .alert { background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🆕 Yeni Sipariş!</h1>
        </div>
        <div class="content">
          <div class="alert">
            <strong>Yeni bir sipariş alındı!</strong>
          </div>
          
          <p><strong>Sipariş No:</strong> ${order.orderNumber}</p>
          <p><strong>Müşteri:</strong> ${order.customerName}</p>
          <p><strong>E-posta:</strong> ${order.customerEmail}</p>
          <p><strong>Telefon:</strong> ${order.customerPhone}</p>
          <p><strong>Toplam:</strong> ${(order.totalPrice + order.shippingCost).toFixed(2)} ₺</p>
          <p><strong>Tarih:</strong> ${new Date(order.createdAt).toLocaleString('tr-TR')}</p>
          
          <p>Admin paneline giriş yaparak siparişi görüntüleyebilirsiniz.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: adminEmail,
    subject: `Yeni Sipariş - ${order.orderNumber}`,
    html,
  });
}

