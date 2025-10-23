import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe only when needed
function getStripe(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY environment variable is not set');
  }
  return new Stripe(secretKey, {
    apiVersion: '2025-09-30.clover',
  });
}

/**
 * Confirm Payment API Route
 * 
 * Confirms a Stripe Payment Intent on the server side
 * This is more secure than confirming on the client
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentIntentId } = body;

    // Validate required fields
    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Missing required field: paymentIntentId' },
        { status: 400 }
      );
    }

    // Get Payment Intent from Stripe
    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Check if payment is already confirmed
    if (paymentIntent.status === 'succeeded') {
      return NextResponse.json({
        success: true,
        status: paymentIntent.status,
        message: 'Payment already confirmed'
      });
    }

    // If payment requires confirmation, confirm it
    if (paymentIntent.status === 'requires_confirmation') {
      const confirmedPayment = await stripe.paymentIntents.confirm(paymentIntentId);
      
      return NextResponse.json({
        success: true,
        status: confirmedPayment.status,
        paymentIntentId: confirmedPayment.id
      });
    }

    // Return current status
    return NextResponse.json({
      success: true,
      status: paymentIntent.status,
      paymentIntentId: paymentIntent.id
    });

  } catch (error) {
    console.error('Error confirming payment:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to confirm payment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
