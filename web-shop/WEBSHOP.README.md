## Web Shop (Merchant Admin & Analytics)

### Stack

- Next.js 15 (App Router), React 18, TypeScript
- Tailwind CSS, Recharts, `@nivo/line`
- Supabase (`@supabase/supabase-js`)
- Inversify + `reflect-metadata` (ports & adapters / DDD)
- Vitest, Testing Library

### Dependencies (high-level)

- `next`, `react`, `react-dom`
- `inversify`, `reflect-metadata`, `@supabase/supabase-js`
- `recharts`, `@nivo/line`, `lucide-react`
- Tooling: `typescript`, `eslint`, `eslint-config-next`, `tailwindcss`, `vitest`, `@testing-library/*`

### Routing

- **Top-level pages**
  - `/` – landing / entry point.
  - `/dashboard` – demo dashboard.
  - `/products` – products list for merchant.
  - `/merchant-admin/analytics/dashboard` – main realtime analytics dashboard.
  - `/merchant-admin/offers` – merchant offers configuration.
  - `/ui-builder` – UI Builder editor.
- **API routes (`/api/**`)**
  - `/api/analytics/[key]` – analytics for specific metric group.
  - `/api/{cohorts|conversion|geography|marketing-channels|payment-methods|refunds|retention|revenue|sales|transactions}/summary` – per-domain summaries.
  - `/api/products` – products list and image upload (`/image/[...path]`, `/upload-image`).
  - `/api/filters/presets` – presets for analytics filters.
  - `/api/merchant-admin/offers/{publish|rules|scenarios}` – offers management operations.
  - `/api/mock/[...path]` – mock endpoints for local development.

### Pages overview

- `/` – starting point that links into dashboards, offers configuration and demos.
- `/dashboard` – example analytics dashboard used as a quick demo.
- `/products` – simple product list for merchants to browse available items.
- `/merchant-admin/analytics/dashboard` – main operator dashboard combining metrics from `analytics` and `transaction_log`.
- `/merchant-admin/offers` – UI for configuring offer rules and scenarios that will be consumed by the client app.
- `/ui-builder` – visual editor where operators assemble storefront pages from configurable components.

### Data types per module (Supabase)

- **Merchant Admin · Offers**
  - **`public.products`**: product catalog that merchants see and configure  
    - Key fields: `id`, images, `title`, `rarity`, discounts, bonuses, `price`, timestamps.
  - **`public.offer_scenarios`**: configured offer scenarios per app  
    - For each `app_id` + `slug` stores `priority`, `tags[]` and a JSON configuration.
  - **`public.offer_engine_rules`**: rule tree for the offer engine  
    - Single JSONB `rule_tree` per `app_id` with a version.

- **Merchant Admin · Analytics (realtime-dashboard)**
  - **`public.analytics`**: analytics payloads for the dashboard  
    - `key` + `payload jsonb` + `created_at` for each snapshot.
  - **`public.transaction_log`**: payment events used by the dashboard  
    - `paid_amount`, `payment_status`, `payment_method`, optional `error_message`, timestamps, and references to user/app/product.

- **UI Builder / Page Editor**
  - **`public.app_configs`**: app-level UI configurations  
    - Stores full app config JSON, version and `is_active` / `is_draft` flags per `app_id`.
  - **`public.page_configs`**: per-page layouts  
    - `page_slug`, `sections` (arrays of ComponentNode trees) and `page_styles` JSON.
  - **`public.templates`**: reusable templates for configs  
    - Bundles of `app_config`, `page_configs` and `metadata` (description, tags, preview image).

- **Shared · Users & Offer Context**
  - **`public.users`**: in-app users  
    - Links `user_id` to `app_id` and tracks creation / last activity timestamps.
  - **`public.user_offer_context`**: per-user offer context  
    - JSON context per (`user_id`, `app_id`) with segments, attributes and flags used by the offer engine.

### Folder Structure

```text
web-shop/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   ├── merchant-admin/
│   │   ├── analytics/
│   │   │   └── dashboard/page.tsx
│   │   └── offers/page.tsx
│   ├── products/page.tsx
│   ├── ui-builder/page.tsx
│   └── api/
│       ├── _lib/supabase-server-client.ts
│       ├── analytics/[key]/route.ts
│       ├── cohorts/summary/route.ts
│       ├── conversion/summary/route.ts
│       ├── filters/presets/route.ts
│       ├── geography/summary/route.ts
│       ├── marketing-channels/summary/route.ts
│       ├── payment-methods/summary/route.ts
│       ├── products/
│       │   ├── route.ts
│       │   ├── image/[...path]/route.ts
│       │   └── upload-image/route.ts
│       ├── refunds/summary/route.ts
│       ├── retention/summary/route.ts
│       ├── revenue/summary/route.ts
│       ├── sales/summary/route.ts
│       ├── transactions/summary/route.ts
│       ├── merchant-admin/offers/
│       │   ├── publish/route.ts
│       │   ├── rules/route.ts
│       │   └── scenarios/route.ts
│       └── mock/[...path]/route.ts
├── src/
│   ├── application/
│   │   └── ports/
│   │       ├── database-client.port.ts
│   │       ├── event-bus.port.ts
│   │       ├── http-client.port.ts
│   │       ├── logger.port.ts
│   │       └── realtime-client.port.ts
│   ├── infrastructure/
│   │   ├── bootstrap/
│   │   │   ├── container.ts
│   │   │   └── types.ts
│   │   ├── database/supabase-client.ts
│   │   ├── event-bus/event-bus.ts
│   │   ├── hooks/useContainer.ts
│   │   ├── http/
│   │   │   ├── http-client.ts
│   │   │   ├── retry-http-client.ts
│   │   │   └── http-client.mock.ts
│   │   ├── logger/console.logger.ts
│   │   ├── logging/console-logger.ts
│   │   └── realtime/
│   │       ├── mock-realtime-client.ts
│   │       └── throttled-realtime-client.ts
│   ├── modules/
│   │   ├── merchant-admin/
│   │   │   ├── analytics/
│   │   │   │   ├── domain/
│   │   │   │   ├── application/
│   │   │   │   ├── infrastructure/
│   │   │   │   ├── interface-adapters/
│   │   │   │   └── __tests__/
│   │   │   ├── offers/
│   │   │   │   ├── domain/
│   │   │   │   ├── application/
│   │   │   │   ├── infrastructure/
│   │   │   │   └── interface-adapters/
│   │   │   └── products/
│   │   │       ├── domain/
│   │   │       ├── application/
│   │   │       ├── infrastructure/
│   │   │       └── interface-adapters/
│   │   └── ui-builder/
│   │       ├── domain/
│   │       ├── application/
│   │       ├── infrastructure/
│   │       ├── interface-adapters/
│   │       └── shared/
│   └── shared/
│       ├── domain/
│       ├── ui/
│       ├── hooks/
│       ├── events/
│       └── result/
├── docs/
│   ├── realtime-dashboard/
│   └── *.md (analysis, plans, validation)
└── public/
    └── mocks/api/** (analytics, filters, settings, etc.)
```


