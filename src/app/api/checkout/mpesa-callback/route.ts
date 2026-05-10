import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// M-Pesa callback endpoint for STK Push results
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { Body } = body;

    if (!Body?.stkCallback) {
      return NextResponse.json({ error: 'Invalid callback data' }, { status: 400 });
    }

    const { ResultCode, ResultDesc, CallbackMetadata, CheckoutRequestID } = Body.stkCallback;

    // Find order by account reference (stored in metadata)
    // In production, you'd store CheckoutRequestID with the order for lookup

    if (ResultCode === 0) {
      // Payment successful
      const metadata = CallbackMetadata?.Item || [];
      const mpesaReceiptNumber = metadata.find(
        (item: any) => item.Name === 'MpesaReceiptNumber'
      )?.Value;
      const transactionDate = metadata.find(
        (item: any) => item.Name === 'TransactionDate'
      )?.Value;
      const phoneNumber = metadata.find(
        (item: any) => item.Name === 'PhoneNumber'
      )?.Value;

      // Update order - in production, use CheckoutRequestID to find the specific order
      // For MVP, we'll log the successful payment
      console.log('M-Pesa payment successful:', {
        receiptNumber: mpesaReceiptNumber,
        transactionDate,
        phoneNumber,
        checkoutRequestId: CheckoutRequestID,
      });

      // Find and update the order that has this phone number and is processing
      if (phoneNumber) {
        const order = await prisma.order.findFirst({
          where: {
            paymentMethod: 'MPESA',
            paymentStatus: 'PROCESSING',
            shippingPhone: { contains: String(phoneNumber).slice(-9) },
          },
          orderBy: { createdAt: 'desc' },
        });

        if (order) {
          await prisma.order.update({
            where: { id: order.id },
            data: {
              paymentStatus: 'COMPLETED',
              status: 'CONFIRMED',
              mpesaReceiptNo: mpesaReceiptNumber,
            },
          });
        }
      }
    } else {
      // Payment failed
      console.error('M-Pesa payment failed:', ResultDesc);
    }

    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (error) {
    console.error('M-Pesa callback error:', error);
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  }
}
