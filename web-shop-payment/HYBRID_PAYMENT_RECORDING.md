# Hybrid Payment Recording Implementation

## Overview

This document describes the **Hybrid Payment Recording** approach implemented in `@web-shop-payment`.

### Two Recording Paths

1. **Client-Side (Fast)**: Immediate UI update via browser event (0-100ms)
2. **Stripe Webhook (Reliable)**: Server-side callback from Stripe (1-3s delay)

Both paths save to `transaction_log` with duplicate protection via UNIQUE constraint on `stripe_payment_intent_id`.

## Architecture Alignment with Clean Architecture

### Layer Responsibilities

```
┌─────────────────────────────────────────────────────────────────┐
│ Infrastructure Layer (Entry Points)                              │
│ - app/api/webhooks/stripe/route.ts (Stripe webhook receiver)    │
│ - Verifies signature, extracts metadata                         │
└───────────────────────┬─────────────────────────────────────────┘
                        │ delegates to
                        ↓
┌─────────────────────────────────────────────────────────────────┐
│ Application Layer (Business Orchestration)                      │
│ - WebhookService (Application Service)                          │
│ - Coordinates webhook processing with UseCases                  │
└───────────────────────┬─────────────────────────────────────────┘
                        │ delegates to
                        ↓
┌─────────────────────────────────────────────────────────────────┐
│ Application Layer (Business Logic)                              │
│ - SavePaymentTransactionUseCase                                 │
│ - Domain validation, payment entity creation                    │
└───────────────────────┬─────────────────────────────────────────┘
                        │ persists via
                        ↓
┌─────────────────────────────────────────────────────────────────┐
│ Infrastructure Layer (Data Access)                              │
│ - SupabasePaymentStorage                                        │
│ - Handles duplicate gracefully (error code 23505)              │
└─────────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

1. **WebhookService as Application Service**
   - Provides facade for external consumers (Stripe webhook)
   - Coordinates business logic but doesn't contain it
   - Delegates to UseCases (follows SRP)
   - Similar pattern to `AuthService` in `@web-shop-client`

2. **Duplicate Handling at Infrastructure Layer**
   - Database UNIQUE constraint prevents duplicates at DB level
   - Storage layer handles error code 23505 gracefully
   - Returns success (not an error - expected behavior)

3. **Metadata in Payment Intent**
   - `userId`, `appId`, `productId` attached during creation
   - Extracted from webhook event
   - Enables reliable webhook processing without additional lookups

## Implementation Details

### 1. Payment Intent Creation (with metadata)

**File**: `src/modules/payments/interface-adapters/presenters/payment.presenter.ts`

```typescript
const result = await this._createPaymentIntentUseCase.execute({
  productId: productSnapshot.id,
  amount: productSnapshot.price,
  currency: productSnapshot.currency,
  metadata: {
    userId: this._userId!,
    appId: this._appId!,
    productId: productSnapshot.id
  }
});
```

Metadata flows through:
1. `CreatePaymentIntentUseCase` (Application)
2. `StripePaymentService` (Infrastructure)
3. `app/api/payments/create-intent/route.ts` (API Route)
4. Stripe API (`stripe.paymentIntents.create`)

### 2. Webhook Service (Application Layer)

**File**: `src/modules/payments/application/services/webhook.service.ts`

```typescript
@injectable()
export class WebhookService implements WebhookServicePort {
  async handleStripePaymentSucceeded(data: StripePaymentWebhookData): Promise<Result<void, Error>> {
    // Delegate to SavePaymentTransactionUseCase
    const result = await this._savePaymentTransactionUseCase.execute({
      paymentIntentId: data.paymentIntentId,
      userId: data.userId,
      appId: data.appId,
      productId: data.productId,
      amount: data.amount,
      currency: data.currency,
      status: 'succeeded'
    });
    
    // Return result (gracefully handles duplicates)
    return result.isFailure() ? Failure.fail(result.error) : Success.ok(undefined);
  }
}
```

### 3. Webhook Route (Infrastructure Entry Point)

**File**: `app/api/webhooks/stripe/route.ts`

```typescript
export async function POST(request: Request) {
  // 1. Verify Stripe signature
  const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  
  // 2. Extract metadata from payment intent
  const { userId, appId, productId } = paymentIntent.metadata;
  
  // 3. Delegate to WebhookService
  const webhookService = container.get<WebhookService>(PAYMENT_TYPES.WebhookService);
  const result = await webhookService.handleStripePaymentSucceeded({
    paymentIntentId: paymentIntent.id,
    userId,
    appId,
    productId,
    amount: paymentIntent.amount / 100,
    currency: paymentIntent.currency.toUpperCase()
  });
  
  return NextResponse.json({ received: true });
}
```

### 4. Duplicate Handling (Storage Layer)

**File**: `src/modules/payments/infrastructure/storages/supabase-payment.storage.ts`

```typescript
if (error) {
  // Check for duplicate transaction (UNIQUE constraint on stripe_payment_intent_id)
  if (error.code === '23505') {
    this._logger.info('[SupabasePaymentStorage] Transaction already exists (duplicate from Client-Side event)', { 
      paymentIntentId: data.provider_intent_id,
      code: error.code
    });
    // Return success - this is not an error, just a duplicate from hybrid approach
    return Success.ok(data);
  }
  
  // Other errors are real errors
  return Failure.fail(new TransactionSaveError());
}
```

## Data Flow Comparison

### Client-Side Path (Fast)

```
User clicks Pay
  ↓
Browser: Stripe confirms payment (100-200ms)
  ↓
PaymentPresenter.onSubmitPayment
  ↓
ConfirmPaymentUseCase.execute
  ↓
EventBus.publishAsync(PaymentConfirmedEvent) ← Client-Side event
  ↓
PaymentWebhookHandler.handleAsync
  ↓
SavePaymentTransactionUseCase.execute
  ↓
SupabasePaymentStorage.insert → INSERT (succeeds)
  ↓
Supabase Realtime → Mobile app receives update (0-100ms)
```

### Stripe Webhook Path (Reliable)

```
Stripe servers detect successful payment
  ↓
Stripe sends webhook POST (1-3s delay)
  ↓
app/api/webhooks/stripe/route.ts (verifies signature)
  ↓
WebhookService.handleStripePaymentSucceeded
  ↓
SavePaymentTransactionUseCase.execute
  ↓
SupabasePaymentStorage.insert → INSERT (duplicate error 23505)
  ↓
Gracefully handles duplicate → returns Success
  ↓
Webhook acknowledged (returns 200 OK to Stripe)
```

## Testing

### Test Client-Side Path

```bash
# 1. Start dev server
cd webshops-specs/web-shop-payment
npm run dev

# 2. Complete payment in browser
# 3. Check console logs:
[PaymentConfirmedEvent] Published
[PaymentWebhookHandler] Handling payment confirmed event
[SupabasePaymentStorage] Payment data inserted successfully
```

### Test Webhook Path

```bash
# 1. Setup Stripe CLI (local development)
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# 2. Complete payment (trigger webhook)
# 3. Check logs:
[StripeWebhook] Signature verified successfully
[WebhookService] Processing payment succeeded webhook
[SupabasePaymentStorage] Transaction already exists (duplicate)
```

### Verify Duplicate Handling

Both paths should complete successfully:
- Client-Side: Creates transaction (INSERT succeeds)
- Webhook: Detects duplicate (error 23505 → Success)
- Result: Single transaction in database

## Setup Checklist

- [ ] Environment variables configured (see `WEBHOOK_SETUP.md`)
- [ ] Stripe webhook endpoint created in Stripe Dashboard
- [ ] Webhook secret added to `.env`
- [ ] Database UNIQUE constraint verified (see `DATABASE_SETUP.sql`)
- [ ] RLS policies configured for Supabase Realtime
- [ ] Client-Side path tested (logs show INSERT success)
- [ ] Webhook path tested (logs show duplicate handling)
- [ ] Mobile app tested (receives Realtime update)

## Why This Approach?

### Advantages

1. **Fast UX**: User sees success immediately (no 1-3s webhook delay)
2. **Reliable**: Stripe webhook ensures transaction is recorded even if client crashes
3. **Simple**: No complex retry logic, no queue systems
4. **Idempotent**: Database constraint prevents duplicates automatically
5. **Production-Ready**: Graceful handling of all edge cases

### Trade-offs

- Duplicate attempts (expected, handled gracefully)
- Requires UNIQUE constraint on `stripe_payment_intent_id`
- Both paths must use same payment intent ID

## Future Enhancements

1. **Supabase Realtime Integration** (Flow A)
   - Mobile app subscribes to `transaction_log` changes
   - Filters by `user_id` and `app_id`
   - Receives updates within 0-100ms

2. **Failed Payment Handling** (Flow C)
   - Webhook records failed payments
   - Mobile app can show retry UI

3. **Refund Support**
   - New webhook event: `charge.refunded`
   - Update transaction status in database
   - Mobile app receives refund notification

## References

- Clean Architecture: [LOGIC_THINKING_GUIDE.md](../../../app-docs(v.6.1)/architecture/LOGIC_THINKING_GUIDE.md)
- Webhook Setup: [WEBHOOK_SETUP.md](./WEBHOOK_SETUP.md)
- Database Setup: [DATABASE_SETUP.sql](./DATABASE_SETUP.sql)
- Purchase Flows: See user's Flow A, B, C description

