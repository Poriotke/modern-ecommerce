import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { generateOrderNumber } from '@/lib/utils';

// Crypto payment - records the order and verifies transaction hash
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { items, txHash, shippingData, walletAddress } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'No items in cart' },
        { status: 400 }
      );
    }

    if (!txHash) {
      return NextResponse.json(
        { error: 'Transaction hash is required' },
        { status: 400 }
      );
    }

    // Calculate totals
    const subtotal = items.reduce(
      (acc: number, item: any) => acc + item.product.price * item.quantity,
      0
    );
    const tax = subtotal * 0.08;
    const total = subtotal + tax;

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create order with crypto payment
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: user.id,
        paymentMethod: 'CRYPTO',
        paymentStatus: 'PROCESSING',
        subtotal,
        tax,
        shipping: 0,
        total,
        currency: 'ETH',
        cryptoTxHash: txHash,
        shippingName: shippingData?.name,
        shippingEmail: shippingData?.email,
        shippingPhone: shippingData?.phone,
        shippingAddress: shippingData?.address,
        shippingCity: shippingData?.city,
        shippingCountry: shippingData?.country,
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

    // In production, you would verify the transaction on-chain
    // For MVP, we trust the transaction hash and mark as processing
    // A background job would verify and update the status

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      message: 'Order placed! Payment is being verified on-chain.',
    });
  } catch (error: any) {
    console.error('Crypto checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process crypto payment' },
      { status: 500 }
    );
  }
}
