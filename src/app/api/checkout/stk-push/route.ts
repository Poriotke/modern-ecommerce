import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { generateOrderNumber } from '@/lib/utils';

// M-Pesa Daraja API Integration
// STK Push (Lipa Na M-Pesa Online)

interface MpesaTokenResponse {
  access_token: string;
  expires_in: string;
}

interface STKPushResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

async function getMpesaAccessToken(): Promise<string> {
  const consumerKey = process.env.MPESA_CONSUMER_KEY!;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET!;
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

  const response = await fetch(
    'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
    {
      method: 'GET',
      headers: {
        Authorization: `Basic ${auth}`,
      },
    }
  );

  const data: MpesaTokenResponse = await response.json();
  return data.access_token;
}

function generateTimestamp(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

function generatePassword(shortcode: string, passkey: string, timestamp: string): string {
  return Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { phone, items, shippingData } = await req.json();

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'No items in cart' },
        { status: 400 }
      );
    }

    // Format phone number (remove leading 0 or +, ensure starts with 254)
    let formattedPhone = phone.replace(/\s+/g, '').replace(/[^0-9]/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.substring(1);
    } else if (formattedPhone.startsWith('+254')) {
      formattedPhone = formattedPhone.substring(1);
    } else if (!formattedPhone.startsWith('254')) {
      formattedPhone = '254' + formattedPhone;
    }

    // Calculate totals (convert to KES - approximate rate)
    const subtotal = items.reduce(
      (acc: number, item: any) => acc + item.product.price * item.quantity,
      0
    );
    const tax = subtotal * 0.08;
    const total = subtotal + tax;
    const amountInKES = Math.ceil(total * 130); // Approximate USD to KES

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: user.id,
        paymentMethod: 'MPESA',
        paymentStatus: 'PROCESSING',
        subtotal,
        tax,
        shipping: 0,
        total,
        currency: 'KES',
        shippingName: shippingData?.name,
        shippingEmail: shippingData?.email,
        shippingPhone: phone,
        shippingAddress: shippingData?.address,
        shippingCity: shippingData?.city,
        shippingCountry: shippingData?.country || 'Kenya',
        orderItems: {
          create: items.map((item: any) => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: item.product.price,
            total: item.product.price * item.quantity,
          })),
        },
      },
    });

    // Get M-Pesa access token
    const accessToken = await getMpesaAccessToken();
    const shortcode = process.env.MPESA_SHORTCODE!;
    const passkey = process.env.MPESA_PASSKEY!;
    const timestamp = generateTimestamp();
    const password = generatePassword(shortcode, passkey, timestamp);

    // Initiate STK Push
    const stkPushResponse = await fetch(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          BusinessShortCode: shortcode,
          Password: password,
          Timestamp: timestamp,
          TransactionType: 'CustomerPayBillOnline',
          Amount: amountInKES,
          PartyA: formattedPhone,
          PartyB: shortcode,
          PhoneNumber: formattedPhone,
          CallBackURL: process.env.MPESA_CALLBACK_URL,
          AccountReference: order.orderNumber,
          TransactionDesc: `Payment for order ${order.orderNumber}`,
        }),
      }
    );

    const stkData: STKPushResponse = await stkPushResponse.json();

    if (stkData.ResponseCode === '0') {
      return NextResponse.json({
        success: true,
        message: stkData.CustomerMessage,
        orderId: order.id,
        orderNumber: order.orderNumber,
        checkoutRequestId: stkData.CheckoutRequestID,
      });
    } else {
      // Update order status to failed
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: 'FAILED' },
      });

      return NextResponse.json(
        {
          error: 'STK Push failed',
          details: stkData.ResponseDescription,
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('M-Pesa STK Push error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initiate M-Pesa payment' },
      { status: 500 }
    );
  }
}
