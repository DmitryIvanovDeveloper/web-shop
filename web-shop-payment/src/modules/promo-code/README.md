# Promo Code Module (Client)

## Overview

The Promo Code module is a client-side module for validating and applying promotional codes during checkout. It follows Clean Architecture principles and communicates with the backend through HTTP API endpoints.

## Architecture

This module follows Clean Architecture with clear separation of concerns:

```
promo-code/
├── domain/              # Business logic and entities
│   ├── entities/       # ValidatedPromoCode, AppliedDiscount
│   └── errors/         # Domain-specific errors
├── application/        # Use cases and business rules
│   ├── ports/         # Interfaces (validation port)
│   └── use-cases/     # Validation use case
└── infrastructure/     # External adapters
    ├── repositories/   # HTTP repository implementation
    └── bootstrap/      # DI container configuration
```

## Domain Layer

### Entities

#### `ValidatedPromoCode`

Represents a validated promo code that can be applied to an order.

**Properties:**
- `id`: Promo code ID
- `code`: Promo code string
- `discountType`: `'percent'` or `'fixed_amount'`
- `discountValue`: Discount amount
- `currency`: Currency code (null for percent discounts)
- `isFreeShipping`: Free shipping flag
- `campaignId`: Optional campaign ID

#### `AppliedDiscount`

Represents the calculated discount result after applying a promo code.

**Properties:**
- `promoCode`: The validated promo code
- `originalAmount`: Original order amount
- `discountAmount`: Calculated discount amount
- `finalAmount`: Final amount after discount
- `currency`: Order currency

**Factory Function:**
```typescript
createAppliedDiscount(
  promoCode: ValidatedPromoCode,
  originalAmount: number,
  currency: string
): AppliedDiscount
```

**Calculation Logic:**
- Percent discount: `discountAmount = originalAmount * (discountValue / 100)`
- Fixed amount: `discountAmount = discountValue`
- Discount is capped at `originalAmount` (cannot be negative)
- `finalAmount = max(0, originalAmount - discountAmount)`

### Errors

#### `PromoCodeError`

Client-side domain errors with specific error codes:

- `CODE_NOT_FOUND`: Promo code doesn't exist
- `CODE_INACTIVE`: Promo code is not active
- `CODE_EXPIRED`: Promo code has expired
- `CODE_NOT_STARTED`: Promo code hasn't started yet
- `MAX_REDEMPTIONS_REACHED`: Global usage limit reached
- `MAX_REDEMPTIONS_PER_USER_REACHED`: User usage limit reached
- `INVALID_DISCOUNT_VALUE`: Invalid discount configuration
- `VALIDATION_FAILED`: General validation failure
- `NETWORK_ERROR`: Network request failed

**Static Factory Methods:**
- `PromoCodeError.codeNotFound(code)`
- `PromoCodeError.codeInactive(code)`
- `PromoCodeError.codeExpired(code, endAt?)`
- `PromoCodeError.codeNotStarted(code, startAt?)`
- `PromoCodeError.maxRedemptionsReached(code)`
- `PromoCodeError.maxRedemptionsPerUserReached(code)`
- `PromoCodeError.validationFailed(reason)`
- `PromoCodeError.networkError(message)`

## Application Layer

### Use Cases

#### `ValidatePromoCodeUseCase`

Validates a promo code for a specific order context.

**Input:**
```typescript
{
  code: string;
  appId: string;
  userId?: string;
  orderAmount: number;
  currency: string;
}
```

**Process:**
1. Validate input (code not empty, appId present, orderAmount > 0)
2. Call `PromoCodeValidationPort.validate()`
3. Return `Result<AppliedDiscount, PromoCodeError>`

**Validation Rules:**
- Code cannot be empty
- AppId is required
- Order amount must be greater than zero

### Ports

#### `PromoCodeValidationPort`

Interface for validating promo codes (abstracts HTTP communication):

```typescript
interface PromoCodeValidationPort {
  validate(
    code: string,
    appId: string,
    userId: string | undefined,
    orderAmount: number,
    currency: string
  ): Promise<Result<AppliedDiscount, PromoCodeError>>;
}
```

## Infrastructure Layer

### Repository Implementation

#### `PromoCodeHttpRepository`

HTTP-based implementation of `PromoCodeValidationPort`.

**API Endpoint:**
- `POST /api/promo-codes/validate`

**Request:**
```typescript
{
  code: string;          // Normalized to uppercase
  appId: string;
  userId?: string;
  orderAmount: number;
  currency: string;
}
```

**Response (Success):**
```typescript
{
  isValid: true;
  promoCode: {
    id: string;
    code: string;
    discountType: 'percent' | 'fixed_amount';
    discountValue: number;
    currency: string | null;
    isFreeShipping: boolean;
    campaignId: string | null;
  };
  discountAmount: number;
  finalAmount: number;
}
```

**Response (Error):**
```typescript
{
  isValid: false;
  error: string;  // Error message
}
```

**Error Mapping:**
The repository maps API error messages to domain errors:
- "not found" → `CODE_NOT_FOUND`
- "not active" → `CODE_INACTIVE`
- "expired" → `CODE_EXPIRED`
- "not yet active" → `CODE_NOT_STARTED`
- "maximum redemptions" → `MAX_REDEMPTIONS_REACHED` or `MAX_REDEMPTIONS_PER_USER_REACHED`
- Other → `VALIDATION_FAILED`

**Data Flow:**
1. Receive validation request
2. Normalize code (trim, uppercase)
3. Send HTTP POST request
4. Handle response:
   - Success: Map to `ValidatedPromoCode` → Create `AppliedDiscount`
   - Error: Map error message to `PromoCodeError`
5. Return `Result<AppliedDiscount, PromoCodeError>`

### Dependency Injection

Configuration in:
- `infrastructure/bootstrap/bind.promo-code.ts`
- `infrastructure/bootstrap/types.ts`

**Types:**
- `PROMO_CODE_TYPES.PromoCodeValidation`: Validation port implementation
- `PROMO_CODE_TYPES.ValidatePromoCodeUseCase`: Use case

## Usage Example

### Validating a Promo Code

```typescript
import { container } from '@/infrastructure/bootstrap/container';
import { PROMO_CODE_TYPES } from '@/modules/promo-code/infrastructure/bootstrap/types';
import { ValidatePromoCodeUseCase } from '@/modules/promo-code/application/use-cases/validate-promo-code.use-case';

const useCase = container.get<ValidatePromoCodeUseCase>(
  PROMO_CODE_TYPES.ValidatePromoCodeUseCase
);

const result = await useCase.execute({
  code: 'SUMMER2024',
  appId: 'APP123',
  userId: 'user-456',
  orderAmount: 100.00,
  currency: 'USD',
});

if (result.isSuccess()) {
  const discount = result.data;
  // handle discount values from result
  // discount.discountAmount;
  // discount.finalAmount;
  // discount.promoCode.isFreeShipping;
} else {
  const error = result.error;
  // Handle specific errors
  switch (error.code) {
    case 'CODE_NOT_FOUND':
      // Show "Promo code not found" message
      break;
    case 'CODE_EXPIRED':
      // Show "This promo code has expired" message
      break;
    // ... other cases
  }
}
```

### Integration with Payment Flow

```typescript
// In payment presenter/component
async function applyPromoCode(code: string) {
  const result = await validatePromoCodeUseCase.execute({
    code,
    appId: currentAppId,
    userId: currentUserId,
    orderAmount: order.total,
    currency: order.currency,
  });

  if (result.isSuccess()) {
    const discount = result.data;
    // Update order with discount
    order.applyDiscount(discount);
    // Update UI
    setAppliedPromo(discount.promoCode);
    setDiscountAmount(discount.discountAmount);
    setFinalAmount(discount.finalAmount);
  } else {
    // Show error message
    setPromoError(result.error.message);
  }
}
```

## Data Flow

1. **User Input** → Promo code entered in checkout form
2. **UI Component** → Calls use case
3. **Use Case** → Validates input, calls validation port
4. **HTTP Repository** → Sends POST to `/api/promo-codes/validate`
5. **Backend API** → Validates against merchant-admin module
6. **Response** → Repository maps to domain entities
7. **Use Case** → Returns `Result<AppliedDiscount, PromoCodeError>`
8. **UI Component** → Updates state and displays result

## Error Handling

All operations use the `Result<T, E>` pattern:
- `Success.ok(data)`: Validation successful
- `Failure.fail(error)`: Validation failed

**Error Handling Strategy:**
1. Network errors → `NETWORK_ERROR` with retry capability
2. Validation errors → Specific error codes for UI messaging
3. Domain errors → Typed errors with user-friendly messages

## Backend Integration

This module communicates with the backend API endpoint:
- **Endpoint**: `POST /api/promo-codes/validate`
- **Backend Module**: Merchant-admin promo codes module
- **Data Source**: Supabase `promo_codes` table

The backend performs:
- Code lookup
- Active status check
- Date range validation
- Usage limit checks
- Discount calculation

## Testing

The module is designed for testability:
- Use case is pure business logic
- Validation port can be mocked
- Domain entities are value objects
- All dependencies injected via DI

**Mock Example:**
```typescript
const mockValidationPort: PromoCodeValidationPort = {
  async validate() {
    return Success.ok({
      promoCode: { /* ... */ },
      originalAmount: 100,
      discountAmount: 20,
      finalAmount: 80,
      currency: 'USD',
    });
  },
};
```

## Related Modules

- **Merchant Admin Promo Codes Module** (`web-shop/src/modules/merchant-admin/promo-codes`): Backend module that manages promo codes
- **Payment Module**: Applies validated discounts to payment intents
- **Analytics Module**: Tracks promo code application events

## Future Enhancements

- Remove promo code functionality
- Promo code sharing
- Client-side caching of validated codes
- Offline validation (with sync on reconnect)
- Multiple promo codes support (if business rules allow)

