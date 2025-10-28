import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { container } from '../../../../src/infrastructure/bootstrap/container';
import { PAYMENT_TYPES } from '../../../../src/modules/payments/infrastructure/bootstrap/types';
import { WebhookService } from '../../../../src/modules/payments/application/services/webhook.service';
import { isFailure } from '../../../../src/shared/result/result';

/**
 * Stripe Webhook Handler (Infrastructure Entry Point)
 * 
 * Receives webhook events from Stripe when payments succeed/fail
 * Verifies signature and delegates to WebhookService (Application Layer)
 * 
 * IMPORTANT: This is an Infrastructure concern (external trigger)
 * Business logic is in WebhookService (Application Service)
 */

// Disable Next.js body parsing for this route (needed for Stripe signature verification)
export const runtime = 'nodejs';

// Initialize Stripe client
function getStripe(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY environment variable is not set');
  }
  return new Stripe(secretKey, {
    apiVersion: '2025-09-30.clover',
  });
}

export async function POST(request: Request) {
  try {
    // 1. Get webhook signature from headers
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      console.error('[StripeWebhook] Missing stripe-signature header');
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // 2. Get webhook secret from environment
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      console.error('[StripeWebhook] STRIPE_WEBHOOK_SECRET not configured');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    // 3. Verify webhook signature (security - prevents fake webhooks)
    const stripe = getStripe();
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      console.log('[StripeWebhook] Signature verified successfully', {
        eventType: event.type,
        eventId: event.id
      });
    } catch (err) {
      console.error('[StripeWebhook] Signature verification failed:', {
        error: err instanceof Error ? err.message : 'Unknown error'
      });
      return NextResponse.json(
        { error: `Webhook signature verification failed: ${err instanceof Error ? err.message : 'Unknown error'}` },
        { status: 400 }
      );
    }

    // 4. Get WebhookService from DI container
    const webhookService = container.get<WebhookService>(PAYMENT_TYPES.WebhookService);

    // 5. Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        console.log('[StripeWebhook] Processing payment_intent.succeeded', {
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          metadata: paymentIntent.metadata
        });

        // Extract metadata (set during Payment Intent creation)
        const { userId, appId, productId } = paymentIntent.metadata;

        // Validate metadata exists
        if (!userId || !appId || !productId) {
          console.error('[StripeWebhook] Missing required metadata', {
            paymentIntentId: paymentIntent.id,
            metadata: paymentIntent.metadata
          });
          return NextResponse.json(
            { error: 'Missing required metadata: userId, appId, or productId' },
            { status: 400 }
          );
        }

        // Delegate to WebhookService (Application Layer)
        const result = await webhookService.handleStripePaymentSucceeded({
          paymentIntentId: paymentIntent.id,
          userId,
          appId,
          productId,
          amount: paymentIntent.amount / 100, // Convert cents to dollars
          currency: paymentIntent.currency.toUpperCase()
        });

        if (isFailure(result)) {
          console.error('[StripeWebhook] Failed to process payment webhook', {
            error: result.error,
            paymentIntentId: paymentIntent.id
          });
          return NextResponse.json(
            { error: 'Failed to save payment transaction' },
            { status: 500 }
          );
        }

        console.log('[StripeWebhook] Payment webhook processed successfully', {
          paymentIntentId: paymentIntent.id
        });

        return NextResponse.json({ received: true, processed: true });
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        console.log('[StripeWebhook] Processing payment_intent.payment_failed', {
          paymentIntentId: paymentIntent.id,
          metadata: paymentIntent.metadata
        });

        // Extract metadata
        const { userId, appId, productId } = paymentIntent.metadata;

        if (!userId || !appId || !productId) {
          console.error('[StripeWebhook] Missing required metadata for failed payment', {
            paymentIntentId: paymentIntent.id,
            metadata: paymentIntent.metadata
          });
          // Return 200 even if metadata is missing (acknowledge webhook)
          return NextResponse.json({ received: true, processed: false });
        }

        // Delegate to WebhookService
        const result = await webhookService.handleStripePaymentFailed({
          paymentIntentId: paymentIntent.id,
          userId,
          appId,
          productId,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency.toUpperCase()
        });

        if (isFailure(result)) {
          console.error('[StripeWebhook] Failed to process failed payment webhook', {
            error: result.error,
            paymentIntentId: paymentIntent.id
          });
          // Return 200 even on error (acknowledge webhook, but log error)
          return NextResponse.json({ received: true, processed: false });
        }

        console.log('[StripeWebhook] Failed payment webhook processed successfully', {
          paymentIntentId: paymentIntent.id
        });

        return NextResponse.json({ received: true, processed: true });
      }

      default: {
        // Unknown event type - acknowledge but don't process
        console.log('[StripeWebhook] Unhandled event type', {
          eventType: event.type,
          eventId: event.id
        });
        return NextResponse.json({ received: true, processed: false });
      }
    }

  } catch (error) {
    console.error('[StripeWebhook] Unexpected error processing webhook:', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    return NextResponse.json(
      { 
        error: 'Internal server error processing webhook',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

