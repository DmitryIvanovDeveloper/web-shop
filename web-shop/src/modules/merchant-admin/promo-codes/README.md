# Merchant Admin – Promo Codes

Admin module for creating and managing promo codes.

## Architecture
- **Domain**: promo code entity, value objects (code, validity), errors.
- **Application / use-cases**: create/update/delete promo codes, list/filter, activate/deactivate.
- **Ports**: promo-codes repository.
- **Infrastructure**: HTTP repository in `infrastructure/repositories` calling `/api/merchant-admin/promo-codes` endpoints; DI bindings in `infrastructure/bootstrap`.
- **Interface adapters**: presenter + view-model, admin views for promo code list/editor.

## Data flow
1) UI → presenter → use case → repository (REST).
2) Repository maps DTO ⇄ domain and persists changes.
3) Presenter updates view-model for admin UI.

## Notes
- Enforce uniqueness/validity period in use cases/API.
- No EventBus usage; request/response flow only.
# Promo Codes Module (Merchant Admin)

## Overview

The Promo Codes module is a merchant-admin module that manages promotional codes for e-commerce applications. It follows Clean Architecture (Hexagonal Architecture) principles, ensuring separation of concerns and maintainability.

## Architecture

This module is structured according to Clean Architecture with the following layers:

```
promo-codes/
├── domain/              # Business logic and entities
│   ├── entities/        # PromoCode domain entity
│   └── errors/          # Domain-specific errors
├── application/         # Use cases and business rules
│   ├── ports/           # Interfaces (repository contracts)
│   └── use-cases/       # Business operations
├── infrastructure/      # External adapters
│   ├── repositories/    # Supabase repository implementation
│   └── bootstrap/       # DI container configuration
└── interface-adapters/   # UI layer
    ├── presenters/      # ViewModel management
    └── views/           # React components
```

## Domain Layer

### Entities

#### `PromoCode`

The core domain entity representing a promotional code.

**Properties:**
- `id`: Unique identifier
- `appId`: Application identifier
- `campaignId`: Optional campaign association
- `code`: Promo code string (normalized to uppercase)
- `name`: Display name
- `description`: Optional description
- `discountType`: `'percent'` or `'fixed_amount'`
- `discountValue`: Discount amount (percentage or fixed)
- `currency`: Currency code (required for fixed_amount)
- `isFreeShipping`: Free shipping flag
- `startAt` / `endAt`: Validity period
- `maxRedemptions`: Global usage limit
- `maxRedemptionsPerUser`: Per-user usage limit
- `priority`: Priority for exclusive codes
- `isExclusive`: Whether code can be combined with others
- `isActive`: Active status
- `createdAt` / `updatedAt`: Timestamps

**Methods:**
- `create(props)`: Factory method with validation
- `withUpdatedStatus(isActive)`: Immutable status update
- `withUpdatedProps(partial)`: Immutable property update

**Validation Rules:**
- Code cannot be empty
- Percent discount: 0 < value ≤ 100
- Fixed amount discount: value > 0 and currency required
- Date range: startAt ≤ endAt

### Errors

#### `PromoCodeError`

Domain-specific error class with error codes:

- `CodeAlreadyExists`: Code already exists for the app
- `InvalidDiscountValue`: Invalid discount value
- `InvalidDateRange`: Invalid date range
- `Inactive`: Code is not active
- `Expired`: Code has expired
- `NotStartedYet`: Code hasn't started yet
- `RedemptionLimitReached`: Global limit reached
- `PerUserLimitReached`: User limit reached

## Application Layer

### Use Cases

#### `CreatePromoCodeUseCase`

Creates a new promotional code.

**Input:**
```typescript
{
  id: string;
  appId: string;
  campaignId?: string | null;
  code: string;
  name: string;
  description?: string | null;
  discountType: 'percent' | 'fixed_amount';
  discountValue: number;
  currency?: string | null;
  isFreeShipping?: boolean;
  startAt?: string | null;
  endAt?: string | null;
  maxRedemptions?: number | null;
  maxRedemptionsPerUser?: number | null;
  priority?: number;
  isExclusive?: boolean;
}
```

**Process:**
1. Check if code already exists for the app
2. Validate domain entity creation
3. Save to repository
4. Return created entity

#### `UpdatePromoCodeUseCase`

Updates an existing promotional code.

**Input:**
```typescript
{
  id: string;
  appId: string;
  code?: string;
  name?: string;
  discountType?: 'percent' | 'fixed_amount';
  discountValue?: number;
  isActive?: boolean;
}
```

**Process:**
1. Load existing promo code
2. Verify appId matches
3. Apply updates using immutable methods
4. Save to repository
5. Return updated entity

#### `ListPromoCodesUseCase`

Lists promotional codes with filtering and pagination.

**Input:**
```typescript
{
  appId: string;
  status?: 'active' | 'expired' | 'upcoming';
  campaignId?: string;
  discountType?: 'percent' | 'fixed_amount';
  query?: string;
  pagination: {
    page: number;
    pageSize: number;
  };
}
```

**Returns:**
```typescript
{
  items: PromoCode[];
  total: number;
}
```

### Ports

#### `PromoCodeRepositoryPort`

Interface defining repository operations:

```typescript
interface PromoCodeRepositoryPort {
  findById(id: string): Promise<Result<PromoCode | null, Error>>;
  findByCode(appId: string, code: string): Promise<Result<PromoCode | null, Error>>;
  existsByCode(appId: string, code: string): Promise<Result<boolean, Error>>;
  search(filter: PromoCodeSearchFilter, pagination: PaginationParams): Promise<Result<PaginatedResult<PromoCode>, Error>>;
  save(promoCode: PromoCode): Promise<Result<PromoCode, Error>>;
  update(promoCode: PromoCode): Promise<Result<PromoCode, Error>>;
}
```

## Infrastructure Layer

### Repository Implementation

#### `PromoCodeSupabaseRepository`

HTTP-based repository implementation that communicates with Next.js API routes.

**API Endpoints:**
- `GET /api/merchant-admin/promo-codes/by-id?id={id}` - Find by ID
- `GET /api/merchant-admin/promo-codes/by-code?appId={appId}&code={code}` - Find by code
- `GET /api/merchant-admin/promo-codes?{filters}` - Search with filters
- `POST /api/merchant-admin/promo-codes` - Create
- `PUT /api/merchant-admin/promo-codes` - Update

**Data Flow:**
1. Repository receives domain entity
2. Maps entity to DTO
3. Sends HTTP request via `HttpClient`
4. Receives DTO response
5. Maps DTO back to domain entity
6. Returns Result

### Dependency Injection

The module uses InversifyJS for dependency injection. Configuration is in:
- `infrastructure/bootstrap/promo-codes.container.ts`
- `infrastructure/bootstrap/promo-codes.types.ts`

**Types:**
- `PROMO_CODE_TYPES.PromoCodeRepository`: Repository port implementation
- `PROMO_CODE_TYPES.CreatePromoCodeUseCase`
- `PROMO_CODE_TYPES.UpdatePromoCodeUseCase`
- `PROMO_CODE_TYPES.ListPromoCodesUseCase`

## Interface Adapters Layer

### Presenter

#### `PromoCodesPresenter`

Manages view model state for the promo codes UI.

**Responsibilities:**
- Loading state management
- Error handling
- Pagination state
- Filter state
- View model updates

### Views

#### `PromoCodesPage`

Main page component for managing promo codes.

#### `PromoCodesList`

List component displaying promo codes with filtering and pagination.

## API Routes

The module exposes Next.js API routes in `app/api/merchant-admin/promo-codes/`:

- `route.ts`: Main CRUD operations (GET list, POST create, PUT update)
- `by-id/route.ts`: Get promo code by ID
- `by-code/route.ts`: Get promo code by code

## Usage Example

### Creating a Promo Code

```typescript
import { container } from '@/infrastructure/bootstrap/container';
import { PROMO_CODE_TYPES } from '@/modules/merchant-admin/promo-codes/infrastructure/bootstrap/promo-codes.types';
import { CreatePromoCodeUseCase } from '@/modules/merchant-admin/promo-codes/application/use-cases/create-promo-code.use-case';

const useCase = container.get<CreatePromoCodeUseCase>(PROMO_CODE_TYPES.CreatePromoCodeUseCase);

const result = await useCase.execute({
  id: 'promo-123',
  appId: 'APP123',
  code: 'SUMMER2024',
  name: 'Summer Sale',
  discountType: 'percent',
  discountValue: 20,
  isActive: true,
});

if (result.isSuccess()) {
  // handle created promo code: result.data
} else {
  console.error('Error:', result.error);
}
```

### Listing Promo Codes

```typescript
import { ListPromoCodesUseCase } from '@/modules/merchant-admin/promo-codes/application/use-cases/list-promo-codes.use-case';

const useCase = container.get<ListPromoCodesUseCase>(PROMO_CODE_TYPES.ListPromoCodesUseCase);

const result = await useCase.execute({
  appId: 'APP123',
  status: 'active',
  pagination: { page: 1, pageSize: 20 },
});

if (result.isSuccess()) {
  // handle list result: result.data.items and result.data.total
}
```

## Data Flow

1. **UI Action** → Presenter method called
2. **Presenter** → Use case executed
3. **Use Case** → Repository port called
4. **Repository** → HTTP request to API route
5. **API Route** → Supabase query (if needed)
6. **Response** → Repository maps DTO to entity
7. **Use Case** → Returns Result
8. **Presenter** → Updates view model
9. **UI** → Re-renders with new state

## Error Handling

All operations return `Result<T, Error>` pattern:
- `Result.ok(data)`: Success with data
- `Result.error(error)`: Failure with error

Domain errors are typed as `PromoCodeError` with specific error codes for UI handling.

## Testing

The module is designed for testability:
- Use cases are pure business logic (no dependencies on infrastructure)
- Repository port can be mocked
- Domain entities are value objects (easy to test)
- All dependencies injected via DI container

## Related Modules

- **Client Promo Code Module** (`web-shop-payment/src/modules/promo-code`): Client-side validation module that uses this module's API endpoints
- **Analytics Module**: Tracks promo code usage events
- **Orders Module**: Applies promo codes during checkout

## Future Enhancements

- Usage tracking (`promo_usages` table integration)
- Advanced validation rules (minimum order amount, product restrictions)
- Promo code sharing functionality
- Campaign management integration

