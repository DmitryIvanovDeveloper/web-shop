# User Offer Context Module

Maintains per-user offer context for the offers/rule engine. Event-driven: domain events → use cases → Supabase via REST.

## Architecture
- **Domain events**: `UserRegisteredEvent`, `UserReturnedEvent`, `PurchaseRecordedEvent`, `FirstPaymentCompletedEvent`, `LifetimeSpendMilestoneReachedEvent`, `WeeklyPurchaseMetricsCalculatedEvent`, `UserActivitySnapshotEvent`, `ProductViewRecordedEvent`, `CategoryIntentDetectedEvent`, `CartStatusChangedEvent`, `WeekendPurchaseWindowUpdatedEvent`, `UserGeoSegmentResolvedEvent`, `SubscriptionStatusChangedEvent`, `SubscriptionPlanChangedEvent`. All include `appId`/`userId`.
- **Ports**: `UserOfferContextWriterPort` (upsert, removeKeys, setValue), `UserOfferContextReaderPort` (load snapshot).
- **Use cases**: one per event, mapping payload → patch keys (e.g., `user.flags.isNew`, `user.metrics.daysSinceLastActive`, `metrics.weeklyPurchaseCount`, `segments.geo`, `behavior.productView.*`, etc.).
- **Infrastructure**: `UserOfferContextSupabaseRepository` (implements reader/writer) normalizes `userId` with deterministic UUID and calls REST:
  - `GET /api/user/offer-context?appId=...&userId=...`
  - `POST /api/user/offer-context` with `{ appId, userId, patch?, removeKeys? }`
- **Interface adapters**:
  - `UserOfferContextEventHandler` routes all supported domain events to their use cases.
  - `UserAuthenticatedEventHandler` converts `UserAuthenticatedEvent` into `UserRegistered` or `UserReturned` based on `metadata.isNewUser`, using `metadata.lastActiveAt` when provided.
- **DI**: `infrastructure/bootstrap/bind.user-offer-context.ts` binds repository, all use cases, handlers, and event-type-specific bindings via `USER_OFFER_CONTEXT_TYPES`.

## Data flow
1) EventBus receives a user-context domain event or `UserAuthenticatedEvent`.
2) Handler invokes the matching Handle* use case → builds a minimal patch.
3) Writer port POSTs patch to `/api/user/offer-context` (deterministic UUID for `userId`).
4) Supabase merges/removes keys in `user_offer_context`. Reader port can `load(appId, userId)` via GET.

## Usage
- Produce domain events; this module reacts and persists context.
- To read context elsewhere, resolve `UserOfferContextReaderPort` and call `load(appId, userId)`.

## Known limitations
- No conflict resolution beyond last write; upstream should deduplicate events.
- No schema validation of patch keys; relies on naming conventions.
- No caching: every `load` hits `/api/user/offer-context`.
- Repository owns deterministic UUID conversion; callers pass plain `userId`.











