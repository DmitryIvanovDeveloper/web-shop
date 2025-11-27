## Web Shop Client (Config-Driven Storefront)

### Stack

- Next.js 15 (App Router), React 18, TypeScript
- Tailwind CSS
- Supabase (`@supabase/supabase-js`)
- Inversify + `reflect-metadata`, ports & adapters
- Stripe SDK (shared conventions with payment app)
- Event-driven patterns (event bus, presenters, view-models)
- Vitest, Testing Library, Playwright

### Dependencies (high-level)

- `next`, `react`, `react-dom`
- `inversify`, `reflect-metadata`, `@supabase/supabase-js`
- Stripe: `stripe`, `@stripe/stripe-js`, `@stripe/react-stripe-js`
- `recharts`
- Tooling: `typescript`, `eslint`, `eslint-config-next`, `tailwindcss`, `vitest`, `@testing-library/*`, `@playwright/test`

### Routing

- **Top-level pages**
  - `/` – entry point that loads shop configuration and initial page.
  - `/[pageSlug]` – dynamic pages rendered from UI configuration (page descriptor).
- **API routes (`/api/**`)**
  - `/api/app-config` – returns current app configuration.
  - `/api/auth/users` – user data endpoint.
  - `/api/authentication/ui-config` – UI config for auth flows.
  - `/api/offers/rules` – offers rules for client.
  - `/api/products` – main products list.
  - `/api/products/[id]` – single product details.
  - `/api/products/batch` – batch products loading.
  - `/api/products/image` – product image redirect/proxy.
  - `/api/products/list` – product list view for the UI builder.
  - `/api/products/offers` – mapping between products and offers.
  - `/api/purchases` – purchases list for the current user.
  - `/api/shop/config` – shop-level configuration.
  - `/api/shop/products` – shop products aggregated view.
  - `/api/user/offer-context` – effective offer context for current user.
  - `/api/user/purchases` – user purchase history.

### Pages overview

- `/` – loads the configured storefront, resolves the home page from Supabase config and renders it.
- `/[pageSlug]` – renders a specific storefront page (e.g. `offers`, `special-sale`) based on its page descriptor
  from `page_configs` and components registered in the UI Renderer.

### Authentication logic (query-only)

- **Source of truth is URL query**:
  - Authentication module reads `appId` and `userId` only from the URL query string.
  - If they are present, they override any stored values (localStorage, env, etc.).
- **On first load / page navigation**:
  - When the app starts and the user is not yet authenticated, the auth module resolves:
    - `appId = appId_from_query || appId_from_localStorage || appId_from_env`.
    - `userId = userId_from_query || userId_from_localStorage`.
  - The auth presenter then calls the login use case with these values.
  - The use case validates both values and calls a repository method that **creates the user in Supabase if they do not exist yet**, then stores a session on the backend side.
- **Resulting state and URL changes**:
  - On success, the user is considered authenticated for this specific `appId` / `userId` pair and `UserAuthenticatedEvent` is published.
  - Other modules (offers, user-offer-context, etc.) react to the authenticated user via events.
  - If you open the application again with a different `userId` in the URL and the app re-mounts, the auth module will re-run initialization and treat that new `userId` as the current user (creating a new user record if needed).
  - Merely editing the URL in the browser **without** navigation/remount does not change the in-memory auth state – the login flow is only triggered on initialisation.

### How user identity & session are stored

- **User identity in the backend**
  - The combination of `appId` + `userId` is persisted in **`public.users`** via the `ensureUserExists(appId, userId)` flow.
  - Other modules (offers, user-offer-context, payments) rely on these IDs when joining data.
- **Local browser storage (current behavior)**
  - There is an abstraction over `localStorage` (`SessionStoragePort`), but the main `SaveSessionUseCase` is currently a **no-op**:
    - It logs that session persistence is disabled and does **not** write to `localStorage`.
  - Older/auxiliary utilities still read from:
    - `localStorage["app_user_session"]` (JSON of `AppUser`),
    - `localStorage["user"]` (legacy JSON with `{ appId, userId, username }`),
    - `localStorage["user_id"]` / `["temp_user_id"]` for purchase tracking,
    - but these are best-effort helpers and **not the primary source of truth**.

### Validation and security notes

- **What is validated**
  - `appId` is required, trimmed, and must be at least 3 characters long.
  - `userId` is required; if it is missing, authentication fails.
  - When restoring from storage, the code checks that stored objects contain `userId`, `appId` and `username` before using them.
- **What is NOT validated (important for security)**
  - There is **no strict whitelist of allowed characters** for `appId` / `userId`.
  - There is **no cryptographic verification** of query parameters (no signed token, HMAC, etc.); the app trusts that the host system generates correct URLs.
  - There is **no origin / referrer check** around the query-based login flow.
  - Data read from `localStorage` is only checked for JSON shape, not for authenticity.

When integrating this client into infrastructure, the expectation is that the **backend or launcher** is responsible for generating safe URLs (or tokens) that map to valid `(appId, userId)` pairs. If stronger guarantees are required, you should introduce signed tokens or a dedicated session service and treat raw `appId` / `userId` query parameters as untrusted input.

### Data types per module (Supabase)

- **Authentication (`src/modules/authentication`)**
  - Uses `public.users` – table of application users.  
    Stores which `user_id` belongs to which `app_id`, plus timestamps for creation and last activity.

- **Config & UI (`src/shared/config`, `src/modules/page-renderer`, `src/modules/ui-renderer`)**
  - Uses `public.app_configs` – full `app-config.json` for each `app_id` (active/draft versions).
  - Uses `public.page_configs` – page layouts (sections with ComponentNode trees and page‑level styles).
  - Uses `public.templates` – reusable presets that bundle `app_config`, `page_configs` and metadata.

- **Products (`src/modules/products`)**
  - Uses `public.products` – product catalog for a game/app.  
    Contains IDs, images, title, rarity, discounts, limits, bonuses and price for each product.

- **Offers & User Context (`src/modules/offers`, `src/modules/user-offer-context`)**
  - Uses `public.offer_engine_rules` – rule trees describing how offers are selected for a given `app_id`.
  - Uses `public.offer_scenarios` – individual offer scenarios with configuration and tags.
  - Uses `public.user_offer_context` – per‑user JSON context (segment, flags, experiment info, etc.) for offer decisions.

- **Payments & Purchases (`src/modules/products`, integration with payment app)**
  - Uses `public.transaction_log` – history of purchases per user/app/product.  
    Keeps amount, status, payment method, optional error message and Stripe PaymentIntent id.

### Folder Structure

```text
web-shop-client/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── [pageSlug]/page.tsx
│   └── api/
│       ├── _lib/supabase-server-client.ts
│       ├── app-config/route.ts
│       ├── auth/users/route.ts
│       ├── authentication/ui-config/route.ts
│       ├── offers/rules/route.ts
│       ├── products/
│       │   ├── route.ts
│       │   ├── [id]/route.ts
│       │   ├── batch/route.ts
│       │   ├── image/route.ts
│       │   ├── list/route.ts
│       │   └── offers/route.ts
│       ├── purchases/route.ts
│       ├── shop/
│       │   ├── config/route.ts
│       │   └── products/route.ts
│       └── user/
│           ├── offer-context/route.ts
│           └── purchases/route.ts
├── src/
│   ├── application/
│   │   ├── ports/
│   │   │   ├── config-subscription.port.ts
│   │   │   ├── database-client.port.ts
│   │   │   ├── event-bus.port.ts
│   │   │   ├── http-client.port.ts
│   │   │   ├── logger.port.ts
│   │   │   ├── realtime-client.port.ts
│   │   │   └── ui-renderer.port.ts
│   │   └── use-cases/
│   │       ├── load-app-config.use-case.ts
│   │       ├── load-app-config-from-message.use-case.ts
│   │       ├── subscribe-to-config-updates.use-case.ts
│   │       └── __tests__/
│   ├── infrastructure/
│   │   ├── bootstrap/
│   │   │   ├── container.ts
│   │   │   └── types.ts
│   │   ├── config/
│   │   │   ├── supabase-config-loader.ts
│   │   │   └── supabase-config-subscription.adapter.ts
│   │   ├── database/supabase-client.ts
│   │   ├── events/
│   │   │   ├── event-bus.ts
│   │   │   ├── event-bus.plugin.ts
│   │   │   ├── events-handler.plugin.ts
│   │   │   ├── event.ts
│   │   │   └── __tests__/event-bus.test.ts
│   │   ├── handlers/
│   │   │   ├── apply-background-on-config.handler.ts
│   │   │   └── ui-config-loaded.handler.ts
│   │   ├── http/
│   │   │   ├── http-client.ts
│   │   │   ├── retry-http-client.ts
│   │   │   └── http-client.mock.ts
│   │   ├── logger/console.logger.ts
│   │   ├── logging/console-logger.ts
│   │   └── services/
│   │       └── ui-renderer/
│   │           ├── ui-renderer.service.ts
│   │           ├── component-registry.service.ts
│   │           ├── style-builder.service.ts
│   │           ├── action-handler.service.ts
│   │           └── README.md
│   ├── modules/
│   │   ├── app-layout/
│   │   │   ├── domain/
│   │   │   ├── infrastructure/
│   │   │   └── interface-adapters/
│   │   ├── authentication/
│   │   │   ├── domain/
│   │   │   ├── application/
│   │   │   ├── infrastructure/
│   │   │   └── interface-adapters/
│   │   ├── offers/
│   │   │   ├── domain/
│   │   │   ├── application/
│   │   │   ├── infrastructure/
│   │   │   └── interface-adapters/
│   │   ├── page-renderer/
│   │   ├── personal-offers/
│   │   ├── products/
│   │   ├── ui-renderer/
│   │   └── user-offer-context/
│   ├── shared/
│   │   ├── components/
│   │   │   ├── atoms/
│   │   │   └── molecules/
│   │   ├── config/
│   │   ├── domain/
│   │   ├── events/
│   │   ├── ui/
│   │   ├── utils/
│   │   └── result/
│   └── __tests__/
│       ├── e2e/
│       └── setup.ts
└── public/
    ├── app-config.schema.json
    └── mocks/api/** (app-config, auth, offers, products, shop, ui-renderer, user)
```


