import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/db/prisma';
import { SERVER_URL } from '@/lib/constants';

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();
    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { orderitems: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_intent_data: {
        metadata: { orderId: order.id },
      },
      line_items: order.orderitems.map((item) => ({
        quantity: item.qty,
        price_data: {
          currency: 'usd',
          unit_amount: Math.round(Number(item.price) * 100),
          product_data: {
            name: item.name,
            images: item.image ? [item.image] : undefined,
          },
        },
      })),
      success_url: `${SERVER_URL}/order/${order.id}/stripe-payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SERVER_URL}/order/${order.id}`,
      metadata: { orderId: order.id },
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (err) {
    console.error('Stripe Checkout session error:', err);
    return NextResponse.json({ error: 'Failed to create Stripe Checkout session' }, { status: 500 });
  }
}