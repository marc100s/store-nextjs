import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { updateOrderToPaid } from '@/lib/actions/order.actions';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
    // Apply rate limiting for webhook endpoint
    const rateLimitResult = await checkRateLimit(req, 'webhook');
    if (!rateLimitResult.success) {
        return NextResponse.json(
            { error: 'Rate limit exceeded', retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000) },
            { status: 429, headers: {
                'X-RateLimit-Limit': rateLimitResult.limit.toString(),
                'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
                'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
            }}
        );
    }

    // Validate webhook secret exists
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
        console.error('STRIPE_WEBHOOK_SECRET is not configured');
        return NextResponse.json(
            { error: 'Webhook secret not configured' }, 
            { status: 500 }
        );
    }

    // Validate signature exists
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
        console.error('Missing stripe-signature header');
        return NextResponse.json(
            { error: 'Missing signature' }, 
            { status: 400 }
        );
    }

    let event;
    try {
        const rawBody = await req.text();
        event = Stripe.webhooks.constructEvent(
            rawBody,
            signature,
            webhookSecret
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return NextResponse.json(
            { error: 'Invalid signature' }, 
            { status: 400 }
        );
    }

    // Check for successful payment
    if (event.type === 'charge.succeeded') {
        const { object } = event.data;

        // Update order status
        await updateOrderToPaid({
            orderId: object.metadata.orderId,
            paymentResult: {
                id: object.id,
                status: 'COMPLETED',
                email_address: object.billing_details.email!,
                pricePaid: (object.amount / 100).toFixed()
            },
        });
        
        return NextResponse.json({
            message: 'updateOrderToPaid was successful'
        });
    }

    return NextResponse.json({
        message: 'event is not charge.succeeded',
    });
}