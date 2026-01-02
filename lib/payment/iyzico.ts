/**
 * iyzico Payment Gateway Integration
 * Türkiye için önerilen ödeme servisi
 * 
 * Kurulum:
 * 1. iyzico.com'dan hesap oluşturun
 * 2. API Key ve Secret Key alın
 * 3. Environment variables ekleyin:
 *    - IYZICO_API_KEY
 *    - IYZICO_SECRET_KEY
 *    - IYZICO_BASE_URL (https://api.iyzipay.com - production)
 */

interface PaymentRequest {
  price: number;
  currency: string;
  basketId: string;
  paymentCard: {
    cardHolderName: string;
    cardNumber: string;
    expireMonth: string;
    expireYear: string;
    cvc: string;
  };
  buyer: {
    id: string;
    name: string;
    surname: string;
    email: string;
    phone: string;
    identityNumber: string;
    city: string;
    country: string;
    address: string;
  };
  shippingAddress: {
    contactName: string;
    city: string;
    country: string;
    address: string;
    zipCode: string;
  };
  billingAddress: {
    contactName: string;
    city: string;
    country: string;
    address: string;
    zipCode: string;
  };
  basketItems: Array<{
    id: string;
    name: string;
    category1: string;
    itemType: string;
    price: number;
  }>;
}

interface PaymentResponse {
    paymentId?: string;
  status: string;
  conversationId: string;
  price: number;
  paidPrice: number;
  installment: number;
  paymentStatus: string;
  merchantCommissionRate: number;
  merchantCommissionRateAmount: number;
  iyziCommissionRateAmount: number;
  iyziCommissionFee: number;
  cardType: string;
  cardAssociation: string;
  cardFamily: string;
  basketId: string;
  currency: string;
  itemTransactions: Array<{
    itemId: string;
    paymentTransactionId: string;
    transactionStatus: number;
    price: number;
    paidPrice: number;
    merchantCommissionRate: number;
    merchantCommissionRateAmount: number;
    iyziCommissionRateAmount: number;
    iyziCommissionFee: number;
    blockageRate: number;
    blockageRateAmountMerchant: number;
    blockageRateAmountSubMerchant: number;
    blockageResolvedDate: string;
    subMerchantKey: string;
    subMerchantPrice: number;
    subMerchantPayoutRate: number;
    subMerchantPayoutAmount: number;
    merchantPayoutAmount: number;
    convertedPayout: {
      paidPrice: number;
      iyziCommissionRateAmount: number;
      iyziCommissionFee: number;
      blockageRateAmountMerchant: number;
      convertedPayoutAmount: number;
    };
  }>;
}

/**
 * iyzico ile ödeme işlemi başlat
 */
export async function createPayment(request: PaymentRequest): Promise<PaymentResponse> {
  const apiKey = process.env.IYZICO_API_KEY;
  const secretKey = process.env.IYZICO_SECRET_KEY;
  const baseUrl = process.env.IYZICO_BASE_URL || 'https://api.iyzipay.com';

  if (!apiKey || !secretKey) {
    throw new Error('iyzico API credentials not configured');
  }

  // iyzico API'ye istek gönder
  const response = await fetch(`${baseUrl}/payment/auth`, {
    method: 'POST',
    headers: {
      'Authorization': `IYZWS ${apiKey}:${secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      locale: 'tr',
      conversationId: request.basketId,
      price: request.price.toFixed(2),
      paidPrice: request.price.toFixed(2),
      currency: request.currency,
      basketId: request.basketId,
      paymentCard: request.paymentCard,
      buyer: request.buyer,
      shippingAddress: request.shippingAddress,
      billingAddress: request.billingAddress,
      basketItems: request.basketItems,
    }),
  });

  const data = await response.json();

  if (data.status !== 'success') {
    throw new Error(data.errorMessage || 'Payment failed');
  }

  return data;
}

/**
 * Ödeme durumunu kontrol et
 */
export async function checkPaymentStatus(paymentId: string): Promise<PaymentResponse> {
  const apiKey = process.env.IYZICO_API_KEY;
  const secretKey = process.env.IYZICO_SECRET_KEY;
  const baseUrl = process.env.IYZICO_BASE_URL || 'https://api.iyzipay.com';

  if (!apiKey || !secretKey) {
    throw new Error('iyzico API credentials not configured');
  }

  const response = await fetch(`${baseUrl}/payment/${paymentId}`, {
    method: 'GET',
    headers: {
      'Authorization': `IYZWS ${apiKey}:${secretKey}`,
    },
  });

  const data = await response.json();

  if (data.status !== 'success') {
    throw new Error(data.errorMessage || 'Payment status check failed');
  }

  return data;
}

/**
 * Ödeme iptal et
 */
export async function cancelPayment(paymentId: string, amount?: number): Promise<any> {
  const apiKey = process.env.IYZICO_API_KEY;
  const secretKey = process.env.IYZICO_SECRET_KEY;
  const baseUrl = process.env.IYZICO_BASE_URL || 'https://api.iyzipay.com';

  if (!apiKey || !secretKey) {
    throw new Error('iyzico API credentials not configured');
  }

  const response = await fetch(`${baseUrl}/payment/cancel`, {
    method: 'POST',
    headers: {
      'Authorization': `IYZWS ${apiKey}:${secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      locale: 'tr',
      paymentId,
      ...(amount && { amount: amount.toFixed(2) }),
    }),
  });

  const data = await response.json();

  if (data.status !== 'success') {
    throw new Error(data.errorMessage || 'Payment cancellation failed');
  }

  return data;
}

