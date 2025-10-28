# Stripe Webhook Setup Guide

## Overview

This application uses a **Hybrid Payment Recording** approach:
- **Client-Side Event**: Fast, immediate UI update (0-100ms)
- **Stripe Webhook**: Reliable, guaranteed persistence (1-3s delay)

Both paths save to the same `transaction_log` table, with duplicate protection via UNIQUE constraint on `stripe_payment_intent_id`.

## Environment Variables

Add these to your `.env` or `.env.local` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Stripe Webhook Secret (REQUIRED for webhook verification)
# Get this from Stripe Dashboard after configuring webhook endpoint
STRIPE_WEBHOOK_SECRET=whsec_...

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Client URL for redirect after payment
NEXT_PUBLIC_CLIENT_URL=https://web-shop-client-ashy.vercel.app
```

## Stripe Dashboard Setup

### 1. Create Webhook Endpoint

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Enter endpoint URL:
   - **Production**: `https://web-shop-payment.vercel.app/api/webhooks/stripe`
   - **Development**: Use Stripe CLI (see below)
4. Select events to listen:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Click "Add endpoint"

### 2. Get Webhook Secret

After creating the endpoint:
1. Click on the webhook endpoint
2. Reveal "Signing secret"
3. Copy the secret (starts with `whsec_`)
4. Add to `.env` as `STRIPE_WEBHOOK_SECRET`

## Local Development

For local testing, use Stripe CLI to forward webhooks:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Copy the webhook signing secret (whsec_...) to .env
```

## Database Setup

Ensure `transaction_log` table has UNIQUE constraint on `stripe_payment_intent_id`:

```sql
-- Verify constraint exists
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'transaction_log' 
  AND constraint_type = 'UNIQUE';

-- Add constraint if missing
ALTER TABLE transaction_log 
ADD CONSTRAINT transaction_log_stripe_payment_intent_id_key 
UNIQUE (stripe_payment_intent_id);
```

## Testing

### Test Client-Side Path

1. Complete a payment in the browser
2. Check browser console logs:
   ```
   [PaymentConfirmedEvent] Published
   [PaymentWebhookHandler] Handling payment confirmed event
   [SupabasePaymentStorage] Payment data inserted successfully
   ```

### Test Webhook Path

1. Complete a payment
2. Check Vercel logs or local server logs:
   ```
   [StripeWebhook] Signature verified successfully
   [WebhookService] Processing payment succeeded webhook
   [SupabasePaymentStorage] Transaction already exists (duplicate)
   ```

### Test Duplicate Handling

Both paths should complete without errors:
- First path (Client-Side) creates the record
- Second path (Webhook) detects duplicate and returns success

## Architecture Flow

```
Client-Side Path (Fast):
Browser → PaymentPresenter → ConfirmPaymentUseCase 
  → EventBus → PaymentWebhookHandler 
  → SavePaymentTransactionUseCase → INSERT (0.1s)

Stripe Webhook Path (Reliable):
Stripe → Webhook Route → WebhookService 
  → SavePaymentTransactionUseCase → INSERT or DUPLICATE (1-3s)
```

## Troubleshooting

### Webhook not receiving events

1. Check Stripe Dashboard → Developers → Webhooks → Logs
2. Verify endpoint URL is correct
3. Check webhook secret is correct in `.env`

### Signature verification fails

1. Verify `STRIPE_WEBHOOK_SECRET` matches Stripe Dashboard
2. Check webhook endpoint is using raw body (not parsed JSON)
3. Check Next.js is not modifying the request body

### Duplicate errors in logs

This is expected behavior! Both paths will try to save the transaction:
- First one succeeds
- Second one gets duplicate error (code 23505)
- Both return success (graceful handling)

## Security Notes

- Never commit `.env` file with real secrets
- Use different webhook secrets for dev/staging/production
- Verify webhook signature on every request
- Use HTTPS in production (Vercel provides this automatically)

