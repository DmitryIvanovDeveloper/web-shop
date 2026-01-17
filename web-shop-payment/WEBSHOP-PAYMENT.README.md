## Web Shop Payment (Stripe & Realtime Payments)

### Stack

- Next.js 15 (App Router), React 18, TypeScript
- Tailwind CSS
- Stripe (`stripe`, `@stripe/stripe-js`, `@stripe/react-stripe-js`)
- Supabase realtime client
- Inversify + `reflect-metadata`, ports & adapters
- Vitest, Testing Library

### Dependencies (high-level)

- `next`, `react`, `react-dom`
- `inversify`, `reflect-metadata`
- Stripe SDKs, Supabase client (via shared infra)
- Tooling: `typescript`, `eslint`, `eslint-config-next`, `tailwindcss`, `vitest`, `@testing-library/*`

### Routing

- **Top-level pages**
  - `/` – entry/demo page.
  - `/payment` – main payment flow page.
  - `/payment/success` – success screen after payment confirmation.
  - `/payment/cancel` – cancel screen when payment is aborted.
  - `/payment/history` – payment history page.
  - `/test-realtime` – realtime demo/testing page.
- **API routes (`/api/**`)**
  - `/api/payments/create-intent` – creates Stripe PaymentIntent.
  - `/api/payments/confirm` – confirms a payment using PaymentIntent data.
  - `/api/payments/status/[paymentIntentId]` – retrieves status of a specific PaymentIntent.
  - `/api/products/by-id` – retrieves product information by appId and productId for payment processing.
  - `/api/promo-codes/validate` – validates and applies promotional codes during checkout.
  - `/api/webhooks/stripe` – Stripe webhook endpoint for asynchronous events.

### Pages overview

- `/` – simple landing page that introduces the payment demo and links to key flows.
- `/payment` – main checkout UI where the user sees order details and enters card or wallet data.
- `/payment/success` – confirmation screen after a successful payment, used as a redirect target.
- `/payment/cancel` – “payment cancelled” screen when the user aborts or Stripe declines the flow.
- `/payment/history` – list of past payments for the current context, backed by `transaction_log`.
- `/test-realtime` – technical demo page to verify Supabase realtime updates and event handling.

### Stripe payment flow (high level)

- **Create payment**
  - The shop calls an API endpoint to create a Stripe **PaymentIntent** for a specific product and amount.
  - Stripe returns a client secret that the frontend uses to complete the payment.

- **Complete payment in the UI**
  - The customer enters card or wallet details on the payment page.
  - Stripe processes the payment and returns a success or failure result.

- **Receive confirmation from Stripe**
  - Stripe sends a webhook back to this app with the final status of the PaymentIntent.
  - The app writes or updates a record in `transaction_log` so we have a reliable audit trail of all payments.

- **Show status and history**
  - The payment pages read data from `transaction_log` to show:
    - The current status of the ongoing payment.
    - A simple history of what the user has paid for in the past.

### Environments and sandbox

- In the current setup, Stripe is used with **test (sandbox) keys**:
  - `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` are test credentials.
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is a test publishable key used by Stripe Elements.
- The app can also be wired to a **mock payment service** (`mock-payment.service.ts` + `in-memory-payment.storage.ts`)
  via DI, which allows running flows without calling Stripe at all.

### What happens after a successful payment

- When a PaymentIntent is successfully confirmed:
  - Stripe sends a webhook (`payment_intent.succeeded`) to `/api/webhooks/stripe`.
  - The webhook handler reads metadata (`userId`, `appId`, `productId`, amount, currency),
    and the `WebhookService` saves a transaction record into `public.transaction_log`.
  - All UIs (payment history, admin analytics) rely on `transaction_log` as the single source of truth
    for “this payment really happened”.

### Production considerations

- For production you should:
  - Use **separate live keys** for Stripe (secret, publishable and webhook secret) stored in a secure vault.
  - Treat Stripe **webhooks as the authoritative source** of payment result; do not trust only client-side status.
  - Ensure metadata for PaymentIntents (`userId`, `appId`, `productId`) comes from a trusted backend,
    not directly from arbitrary query parameters.
  - Monitor and log webhook failures and consider idempotency on `payment_intent_id` if you expect retries.

### Where webhooks should live

- In this project, the webhook handler is implemented as a **Next.js API route**:
  - `app/api/webhooks/stripe/route.ts`.
- For a production deployment it is recommended that this endpoint:
  - Runs in a **stable backend environment** (not tightly coupled to frontend deployments),
  - Has a persistent connection to your primary database (where `transaction_log` will live after migration),
  - Is reachable from Stripe under a stable HTTPS URL.

### Subscriptions (current state)

- The current implementation focuses on **one-off payments via PaymentIntents**.
- There is **no dedicated subscription model** or handlers for subscription-related Stripe events
  (such as `invoice.paid` or `customer.subscription.updated`).
- If you need full subscription lifecycle support, you will need to:
  - Introduce subscription tables (plans, statuses, billing periods),
  - Add webhook handlers for Stripe’s subscription events,
  - Map those events into your own subscription state machine in addition to `transaction_log`.

### Data types per module (Supabase)

- **Payments module (`src/modules/payments`)**
  - **`public.transaction_log`** – central table for all payments  
    - Records who (`user_id`, `app_id`, `product_id`) bought what, for how much, with which method and final status.
    - Also stores `stripe_payment_intent_id` and optional error message if the payment fails.

- **Promo Code module (`src/modules/promo-code`)**
  - Client-side module for validating promotional codes during checkout.
  - Communicates with backend API (`/api/promo-codes/validate`) which validates against merchant-admin promo codes module.
  - Calculates discounts (percent or fixed amount) and returns `AppliedDiscount` with final order amount.

- **Shared catalog / offers**
  - **`public.products`** – shared product catalog used both for display and price calculation.
  - **`public.users`** – shared users table used to link transactions back to specific players.
  - **`public.promo_codes`** – promo codes managed by merchant-admin module, validated by this payment app.

### Folder Structure

```text
web-shop-payment/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── payment/
│   │   ├── page.tsx
│   │   ├── success/page.tsx
│   │   ├── cancel/page.tsx
│   │   └── history/page.tsx
│   ├── test-realtime/page.tsx
│   └── api/
│       ├── payments/
│       │   ├── create-intent/route.ts
│       │   ├── confirm/route.ts
│       │   └── status/[paymentIntentId]/route.ts
│       ├── products/
│       │   └── by-id/route.ts
│       ├── promo-codes/
│       │   └── validate/route.ts
│       └── webhooks/
│           └── stripe/route.ts
├── src/
│   ├── application/
│   │   └── ports/
│   │       ├── event-bus.port.ts
│   │       ├── http-client.port.ts
│   │       ├── logger.port.ts
│   │       └── realtime-client.port.ts
│   ├── infrastructure/
│   │   ├── bootstrap/
│   │   │   ├── container.ts
│   │   │   └── types.ts
│   │   ├── events/
│   │   │   ├── event-bus.ts
│   │   │   ├── event-bus.plugin.ts
│   │   │   ├── events-handler.plugin.ts
│   │   │   ├── event.ts
│   │   │   └── __tests__/event-bus.test.ts
│   │   ├── http/
│   │   │   ├── http-client.ts
│   │   │   ├── retry-http-client.ts
│   │   │   └── http-client.mock.ts
│   │   ├── logger/console.logger.ts
│   │   ├── logging/console-logger.ts
│   │   └── realtime/supabase-realtime-client.ts
│   ├── modules/
│   │   ├── payments/
│   │   │   ├── domain/
│   │   │   │   ├── entities/payment.entity.ts
│   │   │   │   └── errors/payment.error.ts
│   │   │   ├── application/
│   │   │   │   ├── ports/
│   │   │   │   │   ├── payment-product.repository.port.ts
│   │   │   │   │   ├── payment-repository.port.ts
│   │   │   │   │   ├── payment-service.port.ts
│   │   │   │   │   └── payment-storage.port.ts
│   │   │   │   ├── services/
│   │   │   │   │   ├── index.ts
│   │   │   │   │   └── webhook.service.ts
│   │   │   │   └── use-cases/
│   │   │   │       ├── create-payment-intent.use-case.ts
│   │   │   │       ├── confirm-payment.use-case.ts
│   │   │   │       ├── load-payment-product.use-case.ts
│   │   │   │       ├── save-payment-transaction.use-case.ts
│   │   │   │       └── input-output/
│   │   │   ├── infrastructure/
│   │   │   │   ├── bootstrap/
│   │   │   │   │   ├── bind.payments.ts
│   │   │   │   │   └── types.ts
│   │   │   │   ├── repositories/
│   │   │   │   │   ├── payment-product-http.repository.ts
│   │   │   │   │   └── payment.repository.ts
│   │   │   │   ├── services/
│   │   │   │   │   ├── stripe-payment.service.ts
│   │   │   │   │   └── mock-payment.service.ts
│   │   │   │   └── storages/
│   │   │   │       ├── in-memory-payment.storage.ts
│   │   │   │       └── supabase-payment.storage.ts
│   │   │   └── interface-adapters/
│   │   │       ├── handlers/payment-webhook.handler.ts
│   │   │       ├── presenters/
│   │   │       │   ├── payment.presenter.ts
│   │   │       │   └── payment-realtime.presenter.ts
│   │   │       ├── ui/
│   │   │       │   ├── payment-page.tsx
│   │   │       │   ├── components/payment-flow.tsx
│   │   │       │   ├── components/payment-form.tsx
│   │   │       │   └── components/payment-history.tsx
│   │   │       └── view-models/payment.view-model.ts
│   │   └── promo-code/
│   │       ├── domain/
│   │       │   ├── entities/validated-promo-code.entity.ts
│   │       │   └── errors/promo-code.error.ts
│   │       ├── application/
│   │       │   ├── ports/
│   │       │   │   └── promo-code-validation.port.ts
│   │       │   └── use-cases/
│   │       │       └── validate-promo-code.use-case.ts
│   │       ├── infrastructure/
│   │       │   ├── bootstrap/
│   │       │   │   ├── bind.promo-code.ts
│   │       │   │   └── types.ts
│   │       │   └── repositories/
│   │       │       └── promo-code-http.repository.ts
│   │       └── README.md
│   ├── shared/
│   │   ├── domain/
│   │   ├── components/
│   │   │   ├── atoms/
│   │   │   └── molecules/
│   │   ├── events/
│   │   ├── result/
│   │   └── utils/
│   └── __tests__/
│       ├── e2e/
│       └── setup.ts
└── public/
    └── mocks/api/** (auth, authentication, offers, products, shop, ui-renderer, user)
```


