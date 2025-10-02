import { Metadata } from "next";
import { getOrderById } from "@/lib/actions/order.actions";
import { notFound } from "next/navigation";
import { ShippingAddress } from "@/types";
import OrderDetailsTable from './order-details-table';
import { auth } from "@/auth";
import Stripe from "stripe";
import { prisma } from "@/db/prisma";
import { cache } from 'react';

// In-memory cache to prevent concurrent requests creating duplicate payment intents
const paymentIntentCache = new Map<string, Promise<string | null>>();


export const metadata: Metadata = {
    title: 'Order Details',
  };

  // Cache the payment intent creation to prevent duplicates in development mode
  const getOrCreatePaymentIntent = cache(async (orderId: string, orderTotalPrice: string) => {
    console.log(`Server  Attempting to get/create payment intent for order: ${orderId}`);
    
    // Check in-memory cache first
    if (paymentIntentCache.has(orderId)) {
      console.log(`Server  Using in-memory cached payment intent for order: ${orderId}`);
      return await paymentIntentCache.get(orderId);
    }
    
    // Create the promise and cache it immediately to prevent concurrent requests
    const promise = (async () => {
      // Get the order to check if it already has a payment intent
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: { paymentResult: true, totalPrice: true }
      });
      
      if (!order) {
        throw new Error('Order not found');
      }
    
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
    
    // Check if order already has a valid payment intent stored
    if (order.paymentResult && 
        typeof order.paymentResult === 'object' && 
        'id' in order.paymentResult &&
        typeof order.paymentResult.id === 'string' &&
        order.paymentResult.id.startsWith('pi_')) {
      
      try {
        // Try to retrieve existing payment intent
        const paymentIntent = await stripe.paymentIntents.retrieve(order.paymentResult.id);
        
        // Verify the payment intent is still valid and matches our order
        if (paymentIntent.amount === Math.round(Number(orderTotalPrice) * 100) &&
            paymentIntent.currency === 'usd' &&
            paymentIntent.metadata.orderId === orderId &&
            ['requires_payment_method', 'requires_confirmation', 'requires_action'].includes(paymentIntent.status)) {
          console.log('Server  Using existing valid payment intent:', paymentIntent.id);
          return paymentIntent.client_secret;
        } else {
          console.log('Server  Existing payment intent invalid, creating new one');
        }
      } catch (retrieveError) {
        console.log('Server  Could not retrieve existing payment intent:', retrieveError);
      }
    }
    
    // Create new payment intent only if we don't have a valid one
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(orderTotalPrice) * 100),
      currency: 'usd',
      metadata: { orderId },
      automatic_payment_methods: {
        enabled: true,
      },
    });
    console.log('Server  New payment intent created:', paymentIntent.id);
    
    // Store payment intent ID in order for future reference
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentResult: {
          id: paymentIntent.id,
          email_address: '',
          status: 'pending',
          pricePaid: '0',
        },
      },
    });
      
      return paymentIntent.client_secret;
    })();
    
    // Cache the promise immediately
    paymentIntentCache.set(orderId, promise);
    
    try {
      const result = await promise;
      // Keep cache for 5 minutes in case of multiple quick accesses
      setTimeout(() => paymentIntentCache.delete(orderId), 5 * 60 * 1000);
      return result;
    } catch (error) {
      // Remove from cache on error so it can be retried
      paymentIntentCache.delete(orderId);
      throw error;
    }
  });
  
  const OrderDetailsPage = async (props: {
    params: Promise<{
      id: string;
    }>;
  }) => {
    const { id } = await props.params;
  
    const order = await getOrderById(id);
    if (!order) notFound();

    const session = await auth();

    let client_secret = null;

    // Check if is not paid and using stripe
    if(order.paymentMethod === 'Stripe' && !order.isPaid) {
      try {
        client_secret = await getOrCreatePaymentIntent(order.id, order.totalPrice);
      } catch (error) {
        console.error('Server  Error with payment intent:', error);
        // Still allow the page to render, but without Stripe functionality
      }
    }

    return (
      <OrderDetailsTable
        order={{
          ...order,
          shippingAddress: order.shippingAddress as ShippingAddress,
        }}
        stripeClientSecret={client_secret}
        paypalClientId={process.env.PAYPAL_CLIENT_ID || 'sb'}
        isAdmin={session?.user?.role === 'admin' || false}
      />
    );
    };
export default OrderDetailsPage;