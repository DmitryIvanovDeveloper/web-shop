/**
 * Create Stripe Webhook Endpoint
 * 
 * This script creates a webhook endpoint in Stripe Dashboard programmatically
 * 
 * Usage:
 *   STRIPE_SECRET_KEY=sk_test_... node scripts/create-webhook-endpoint.js
 */

const Stripe = require('stripe');

async function createWebhookEndpoint() {
  // Get Stripe secret key from environment
  const secretKey = process.env.STRIPE_SECRET_KEY;
  
  if (!secretKey) {
    console.error('❌ Error: STRIPE_SECRET_KEY environment variable is not set');
    console.log('');
    console.log('Usage:');
    console.log('  STRIPE_SECRET_KEY=sk_test_... node scripts/create-webhook-endpoint.js');
    process.exit(1);
  }

  console.log('🔧 Initializing Stripe client...');
  const stripe = new Stripe(secretKey, {
    apiVersion: '2025-09-30.clover',
  });

  try {
    console.log('');
    console.log('📡 Creating webhook endpoint...');
    console.log('   URL: https://web-shop-payment.vercel.app/api/webhooks/stripe');
    console.log('   Events: payment_intent.succeeded, payment_intent.payment_failed');
    console.log('');

    const webhookEndpoint = await stripe.webhookEndpoints.create({
      url: 'https://web-shop-payment.vercel.app/api/webhooks/stripe',
      enabled_events: [
        'payment_intent.succeeded',
        'payment_intent.payment_failed',
      ],
      description: 'Hybrid Payment Recording - Reliable backup for client-side events',
    });

    console.log('✅ Webhook endpoint created successfully!');
    console.log('');
    console.log('📋 Webhook Details:');
    console.log('   ID:', webhookEndpoint.id);
    console.log('   URL:', webhookEndpoint.url);
    console.log('   Status:', webhookEndpoint.status);
    console.log('   Events:', webhookEndpoint.enabled_events.join(', '));
    console.log('');
    console.log('🔐 Webhook Signing Secret:');
    console.log('   ' + webhookEndpoint.secret);
    console.log('');
    console.log('⚠️  IMPORTANT: Save this secret to Vercel Environment Variables!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Copy the webhook secret above (whsec_...)');
    console.log('2. Go to Vercel Dashboard → web-shop-payment → Settings → Environment Variables');
    console.log('3. Add new variable:');
    console.log('   Name: STRIPE_WEBHOOK_SECRET');
    console.log('   Value: ' + webhookEndpoint.secret);
    console.log('4. Redeploy the application');
    console.log('');
    console.log('🎉 Done! Your webhook is ready to receive events from Stripe.');

  } catch (error) {
    console.error('❌ Error creating webhook endpoint:');
    console.error('   ' + error.message);
    
    if (error.type === 'StripeAuthenticationError') {
      console.log('');
      console.log('💡 Tip: Check that your STRIPE_SECRET_KEY is correct');
      console.log('   It should start with sk_test_... or sk_live_...');
    }
    
    if (error.code === 'url_invalid') {
      console.log('');
      console.log('💡 Tip: Make sure the URL is accessible and uses HTTPS');
    }
    
    process.exit(1);
  }
}

// Run the script
createWebhookEndpoint();

