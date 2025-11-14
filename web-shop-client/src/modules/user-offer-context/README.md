## User Offer Context Module

This module owns the lifecycle of offer-related user context that drives the rule
engine inside the offers experience. Responsibilities:

- react to user lifecycle events (registration, purchases, activity, geo, etc.);
- coordinate use cases that translate events into context mutations;
- persist merged context into Supabase via the REST API layer;
- expose ports so other modules can query contextual data when needed.

### Structure

```
domain/events/                 # strongly typed domain events
application/ports/             # ports for reading/writing context
application/use-cases/         # use cases mapping events -> context mutations
infrastructure/repositories/   # Supabase-backed port implementations
interface-adapters/handlers/   # event handlers wired to the global event bus
```

The module follows the guidance from `LOGIC_THINKING_GUIDE.md`: event handlers
belong to interface adapters, use cases orchestrate through ports, and only
infrastructure touches Supabase. No business logic leaks to other modules.

### Event-driven flow

```
External service publishes event (EventBus)
    ↓
UserOfferContextEventHandler
    ↓
Specific Handle*UseCase
    ↓
UserOfferContextWriterPort (Supabase repository)
    ↓
Next.js API `/api/user/offer-context`
    ↓
Supabase table `user_offer_context`
```

Each event carries aggregated values so the use case can write a minimal patch
without additional reads. The repository merges patches and removes keys on
request, ensuring the context stays consistent with upstream systems.

### End-to-end Welcome Offer flow

1. **Authentication**
   - `ValidateAppLoginUseCase` authenticates the user against Supabase.
   - Publishes `UserAuthenticatedEvent` (always) with `metadata.isNewUser`.
   - Publishes `UserRegisteredEvent` if it’s a brand-new user, otherwise `UserReturnedEvent`.

2. **Context update**
   - The `user-offer-context` module subscribes to both event types:
     - `UserAuthenticatedEventHandler` translates them into `HandleUserRegisteredUseCase` or `HandleUserReturnedUseCase`.
     - `HandleUserRegisteredUseCase` sets `user.flags.isNew = true`; the returned use case updates last-active metrics.
   - Repository persists the merged patch through `/api/user/offer-context` → Supabase `user_offer_context`.

3. **Offers evaluation**
   - `OffersListPresenter` calls `SelectOffersUseCase`, passing authenticated `appId` and `userId`.
   - `SelectOffersUseCase` loads the context snapshot and feeds it to `EvaluateOffersUseCase`.
   - The rule tree checks `user.flags.isNew === true`, returns Welcome Offer IDs.
   - `OfferRepository` fetches offer details to display in the popup.

### Manual verification

```bash
# 1. Authenticate the user (triggers events and context upsert)
curl -X POST http://localhost:3001/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"appId":"APP123","userId":"test-user-123"}'

# 2. Inspect context
curl "http://localhost:3001/api/user/offer-context?appId=APP123&userId=test-user-123"
# → {"context":{"user.flags.isNew":true,...}, "updatedAt": "..."}

# 3. Open the client (Welcome Offer popup should appear)
open "http://localhost:3001/?appId=APP123&userId=test-user-123"
```











