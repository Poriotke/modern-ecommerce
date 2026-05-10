import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { generateOrderNumber } from '@/lib/utils';

// WhatsApp checkout - creates order and generates WhatsApp message link
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { items, shippingData } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'No items in cart' },
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

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: user.id,
        paymentMethod: 'WHATSAPP',
        paymentStatus: 'PENDING',
        subtotal,
        tax,
        shipping: 0,
        total,
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

    // Generate WhatsApp message
    const itemsList = items
      .map(
        (item: any) =>
          `- ${item.product.name} x${item.quantity} ($${(item.product.price * item.quantity).toFixed(2)})`
      )
      .join('\n');

    const message = encodeURIComponent(
      `Hi! I'd like to place an order:\n\n` +
      `Order #: ${order.orderNumber}\n\n` +
      `Items:\n${itemsList}\n\n` +
      `Subtotal: $${subtotal.toFixed(2)}\n` +
      `Tax: $${tax.toFixed(2)}\n` +
      `Total: $${total.toFixed(2)}\n\n` +
      `Shipping to: ${shippingData?.address || 'TBD'}, ${shippingData?.city || ''}\n` +
      `Contact: ${shippingData?.name || session.user.name} - ${shippingData?.phone || ''}\n\n` +
      `Please confirm my order. Thank you!`
    );

    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      whatsappUrl,
    });
  } catch (error: any) {
    console.error('WhatsApp checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create WhatsApp order' },
      { status: 500 }
    );
  }
}
