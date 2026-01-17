# Authentication Module

App-based authentication backed by Supabase. Ensures a user exists (or creates one) in the `users` table, publishes `UserAuthenticatedEvent`, and exposes simple helpers for UI state. DI via `AUTH_TYPES` and `ROOT_TYPES`.

## Architecture
- **Domain**: `AppUser`, `AuthenticationError`, events (`UserAuthenticatedEvent`, `AuthenticationRequiredEvent`).
- **Application / ports**: `AuthRepositoryPort`, `SessionStoragePort`.
- **Application / use-case**: `TryAuthenticateUseCase` (the active flow).
- **Application / services**: `AuthService` is a thin facade over `AuthPresenter` (`isUserAuthenticated`, `getCurrentUserId`, `getCurrentUser`).
- **Infrastructure / repositories**:
  - `AuthRepository` (Supabase): deterministic UUID from `userId`, ensure-or-create user in `users`, update `last_active_at`, handle race on insert.
  - `SessionStorageRepository`: localStorage implementation of `SessionStoragePort` (currently not used by the UC; saving is commented out).
- **Bootstrap**: `infrastructure/bootstrap/bind.authentication.ts`, `types.ts` bind HttpClient/DatabaseClient/Logger and module services.
- **Interface Adapters**:
  - `AuthPresenter` holds auth state, labels, emits CustomEvent `authStateChanged`, can build UI descriptors (button/popup) from configs or fallback JSON.
  - Handlers: `authentication-required`, `user-authenticated`, `app-config-loaded`, `localization-*` wire events to presenter/UI.
  - Hooks/UI: `useAuth`, `useAuthPopup`, `AuthModule`, `AuthPopup`, `LoginButton`, `UserInfo`, skeletons.

## Flow (TryAuthenticateUseCase)
1) Validate inputs (`appId`, `userId` must be non-empty).
2) `AuthRepository.ensureUserExists(appId, userId)` against Supabase `users`:
   - lookup by (`app_id`, deterministic UUID from `userId`);
   - if found → update `last_active_at`; if not → insert; if insert conflicts → re-fetch and treat as existing.
3) Publish `UserAuthenticatedEvent` via EventBus (handler errors do not block success).
4) Presenter sets `isAuthenticated`, stores `currentUser`, dispatches `authStateChanged` (browser only).
5) Session storage write is currently disabled (commented).

## Supabase expectation
Table `users` with columns at least: `app_id`, `user_id` (UUID), `last_active_at`, optional `id` PK. The module returns the original string `userId` to callers.

## Usage (React + DI)
```tsx
const presenter = container.get(AuthPresenter);
await presenter.tryAuthenticate(appId, userId); // publishes UserAuthenticatedEvent
const { isAuthenticated, currentUser } = useAuth(); // in components
```

## Events
- Publishes: `UserAuthenticatedEvent`.
- Consumes: `AuthenticationRequiredEvent`, `AppConfigLoadedEvent`, localization events (for labels).

## Limitations / TODO
- No tokens/passwords; purely `appId` + `userId`. For production, add signed tokens or proper auth backend.
- Session persistence via localStorage is not active; enable and test if needed.
- UI config may come from fallback JSON (`/mocks/api/app-config.json`, `/mocks/api/authentication/ui-config.json`); for production, move to centralized config/feature flags.

