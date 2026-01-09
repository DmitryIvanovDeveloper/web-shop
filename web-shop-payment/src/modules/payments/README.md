# Payments Module

## Overview
The Payments module handles all payment-related operations in the web-shop-payment application. It provides a clean abstraction over payment providers (currently Stripe) and manages the complete payment lifecycle from intent creation to confirmation and status tracking.

## Architecture
This module follows Clean Architecture principles with clear separation of concerns:

```
payments/
├── domain/              # Business logic and entities
│   ├── entities/       # Payment entity and value objects
│   └── errors/         # Domain-specific payment errors
├── application/        # Use cases and business rules
│   ├── ports/         # Interfaces for payment services and repositories
│   └── use-cases/     # Payment operations (create, confirm, save)
├── infrastructure/     # External adapters
│   ├── repositories/   # HTTP repositories for external data
│   ├── services/       # Payment provider integrations (Stripe, Mock)
│   ├── storages/       # Data persistence (Supabase, In-memory)
│   └── bootstrap/      # DI container configuration
└── interface-adapters/  # UI and external interfaces
    ├── handlers/       # Webhook handlers
    ├── presenters/     # Payment presenters
    └── views/          # React components for payment UI
```

## Domain Layer

### Entities

#### `Payment`
The core domain entity representing a payment transaction.

**Properties:**
- `id`: Unique payment identifier
- `userId`: User who initiated the payment
- `productId`: Product being purchased
- `appId`: Application identifier (optional)
- `amount`: Payment amount
- `currency`: Payment currency
- `status`: Payment status (pending/processing/succeeded/failed/cancelled)
- `providerIntentId`: Payment provider's intent identifier
- `createdAt`/`updatedAt`: Timestamps

#### `PaymentStatus` Enum
```typescript
enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}
```

### Value Objects

#### `PaymentAmount`
Value object for payment amount validation.

**Validation Rules:**
- Must be greater than zero
- Maximum limit: 999999.99

**Methods:**
- `toCents()`: Converts to cents for Stripe
- `equals(other)`: Value comparison

#### `PaymentCurrency`
Value object for currency validation.

**Supported Currencies:**
- USD, EUR, GBP

**Validation Rules:**
- Must be uppercase
- Must be in supported currencies list

## Application Layer

### Use Cases

#### `CreatePaymentIntentUseCase`
Creates a new payment intent with the payment provider.

**Input:**
```typescript
{
  productId: string;
  amount: number;
  currency: string;
  metadata?: Record<string, any>;
}
```

**Process:**
1. Validates payment amount (> 0)
2. Validates currency (supported currencies)
3. Calls payment service to create intent
4. Returns intent ID and client secret

**Output:**
```typescript
Result<{
  intentId: string;
  clientSecret: string;
  status: string;
}, PaymentError>
```

#### `ConfirmPaymentUseCase`
Confirms a payment after successful provider processing.

**Input:**
```typescript
{
  intentId: string;
  paymentMethodId?: string;
}
```

**Process:**
1. Calls payment service to confirm payment
2. Saves transaction record if successful
3. Updates payment status

#### `SavePaymentTransactionUseCase`
Saves payment transaction details to persistent storage.

**Input:**
```typescript
{
  userId: string;
  productId: string;
  appId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  providerIntentId: string;
  errorMessage?: string;
}
```

### Ports

#### `PaymentServicePort`
Interface for payment provider operations.

```typescript
interface PaymentServicePort {
  createPaymentIntent(request: PaymentIntentRequest): Promise<Result<PaymentIntentResponse, PaymentError>>;
  confirmPayment(intentId: string, paymentMethodId?: string): Promise<Result<PaymentConfirmation, PaymentError>>;
  getPaymentStatus(intentId: string): Promise<Result<PaymentStatusResponse, PaymentError>>;
}
```

#### `PaymentRepositoryPort`
Interface for payment data operations.

```typescript
interface PaymentRepositoryPort {
  save(payment: Payment): Promise<Result<Payment, PaymentError>>;
  findById(id: string): Promise<Result<Payment | null, PaymentError>>;
  findByIntentId(intentId: string): Promise<Result<Payment | null, PaymentError>>;
  updateStatus(id: string, status: PaymentStatus): Promise<Result<Payment, PaymentError>>;
}
```

#### `PaymentStoragePort`
Interface for transaction log persistence.

```typescript
interface PaymentStoragePort {
  saveTransaction(transaction: PaymentTransaction): Promise<Result<void, PaymentError>>;
  getTransactions(filters: TransactionFilters): Promise<Result<PaymentTransaction[], PaymentError>>;
}
```

#### `PaymentProductRepositoryPort`
Interface for product information retrieval.

```typescript
interface PaymentProductRepositoryPort {
  getProduct(productId: string): Promise<Result<ProductInfo, PaymentError>>;
  validateProduct(productId: string, amount: number, currency: string): Promise<Result<boolean, PaymentError>>;
}
```

## Infrastructure Layer

### Services

#### `StripePaymentService`
Production implementation using Stripe SDK.

**Features:**
- Payment intent creation
- Payment confirmation
- Status checking
- Error mapping to domain errors

#### `MockPaymentService`
Development/testing implementation without external dependencies.

**Features:**
- Simulates payment flows
- Configurable success/failure rates
- No external API calls

### Storages

#### `SupabasePaymentStorage`
Persists payment transactions to Supabase `transaction_log` table.

**Table Schema:**
```sql
CREATE TABLE transaction_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  app_id VARCHAR(255),
  product_id VARCHAR(255) NOT NULL,
  paid_amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  payment_status VARCHAR(20) NOT NULL,
  payment_method VARCHAR(50),
  stripe_payment_intent_id VARCHAR(255),
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `InMemoryPaymentStorage`
In-memory storage for testing and development.

### Repositories

#### `PaymentRepository`
Manages payment entity persistence.

#### `PaymentProductHttpRepository`
Retrieves product information via HTTP API calls to the merchant admin.

## Interface Adapters Layer

### Handlers

#### `PaymentWebhookHandler`
Processes Stripe webhook events for asynchronous payment confirmations.

**Handled Events:**
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `payment_intent.canceled`

### Presenters

#### `PaymentPresenter`
Manages payment UI state and coordinates with use cases.

#### `PaymentRealtimePresenter`
Handles real-time payment status updates.

### Views

#### `PaymentFlow`
Main payment UI component with Stripe Elements integration.

#### `PaymentForm`
Credit card input form using Stripe Elements.

#### `PaymentHistory`
Displays user's payment history.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/create-intent` | Creates Stripe PaymentIntent |
| POST | `/api/payments/confirm` | Confirms payment with PaymentIntent |
| GET | `/api/payments/status/[intentId]` | Gets payment status by intent ID |
| POST | `/api/webhooks/stripe` | Stripe webhook endpoint |

## Usage Examples

### Creating a Payment Intent

```typescript
import { container } from '@/infrastructure/bootstrap/container';
import { PAYMENT_TYPES } from '@/modules/payments/infrastructure/bootstrap/types';
import { CreatePaymentIntentUseCase } from '@/modules/payments/application/use-cases/create-payment-intent.use-case';

const useCase = container.get<CreatePaymentIntentUseCase>(
  PAYMENT_TYPES.CreatePaymentIntentUseCase
);

const result = await useCase.execute({
  productId: 'product-123',
  amount: 29.99,
  currency: 'USD',
  metadata: { userId: 'user-456' }
});

if (result.isSuccess()) {
  const { intentId, clientSecret } = result.data;
  // Use clientSecret with Stripe Elements
} else {
  console.error('Payment creation failed:', result.error.message);
}
```

### Confirming a Payment

```typescript
import { ConfirmPaymentUseCase } from '@/modules/payments/application/use-cases/confirm-payment.use-case';

const confirmUseCase = container.get<ConfirmPaymentUseCase>(
  PAYMENT_TYPES.ConfirmPaymentUseCase
);

const result = await confirmUseCase.execute({
  intentId: 'pi_1234567890',
  paymentMethodId: 'pm_card_visa'
});

if (result.isSuccess()) {
  // Payment confirmed successfully
  redirectToSuccessPage();
} else {
  // Handle payment failure
  showError(result.error.message);
}
```

## Data Flow

### Payment Creation Flow
1. **User selects product** → Payment page loads
2. **UI calls CreatePaymentIntentUseCase** → Validates input
3. **Use Case calls PaymentService** → Creates Stripe PaymentIntent
4. **Stripe returns client_secret** → UI initializes Stripe Elements
5. **User enters payment details** → Stripe processes payment

### Payment Confirmation Flow
1. **Stripe processes payment** → Sends webhook or client confirms
2. **ConfirmPaymentUseCase called** → Calls Stripe API
3. **Payment confirmed** → SavePaymentTransactionUseCase saves to database
4. **UI updates status** → Shows success/failure to user

## Error Handling

All operations use the `Result<T, E>` pattern with domain-specific `PaymentError`:

**Common Error Codes:**
- `INVALID_PAYMENT_AMOUNT`: Amount validation failed
- `INVALID_CURRENCY`: Unsupported currency
- `PAYMENT_INTENT_FAILED`: Stripe intent creation failed
- `PAYMENT_CONFIRMATION_FAILED`: Payment confirmation failed
- `WEBHOOK_PROCESSING_ERROR`: Webhook processing failed

**Error Handling Strategy:**
1. Domain validation errors → User-friendly messages
2. Network errors → Retry logic with exponential backoff
3. Payment provider errors → Mapped to domain errors
4. System errors → Logged and fallback behavior

## Testing

The module supports comprehensive testing:

**Unit Tests:**
- Domain entities and value objects
- Use cases with mocked ports
- Error handling scenarios

**Integration Tests:**
- Repository implementations
- Payment service integrations
- API endpoint testing

**E2E Tests:**
- Complete payment flows
- Webhook processing
- UI interactions

**Test Configuration:**
- Mock payment service for development
- In-memory storage for testing
- Separate test database

## Dependencies

### External Dependencies
- `@stripe/stripe-js`: Stripe Elements for UI
- `@stripe/react-stripe-js`: React Stripe integration
- `stripe`: Server-side Stripe SDK

### Internal Dependencies
- `shared/result`: Result pattern
- `shared/domain`: Base entity and error classes
- `infrastructure/http-client`: HTTP client abstraction
- `application/ports`: Logger and event bus ports

## Related Modules

- **Merchant Admin Products**: Provides product catalog and pricing
- **Transaction Analytics**: Consumes payment data for analytics
- **User Management**: Links payments to user accounts
- **Email Notifications**: Sends payment confirmations

## Environment Configuration

### Stripe Configuration
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Database Configuration
The module uses Supabase for transaction logging. Table `transaction_log` must exist with the schema described above.

## Future Enhancements

- Multi-provider support (PayPal, Apple Pay, Google Pay)
- Subscription payments
- Payment method saving
- Refund processing
- Fraud detection integration
- Multi-currency support expansion
- Payment analytics dashboard

