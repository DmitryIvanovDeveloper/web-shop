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

- **Merchant Admin · Promo Codes**
  - **`public.promo_campaigns`**: promo campaigns / affiliates.  
    - Grouping of promo codes by influencer, partner or internal campaign.  
    - Key fields: `id`, `app_id`, `slug`, `name`, `owner_type`, `owner_id`, `is_active`, `metadata`, timestamps.
  - **`public.promo_codes`**: concrete promo codes.  
    - Codes per app with discount rules and limits.  
    - Key fields: `id`, `app_id`, `campaign_id`, `code`, `name`, `discount_type`, `discount_value`, `currency`,  
      validity window (`start_at`, `end_at`), limits (`max_redemptions`, `max_redemptions_per_user`), `priority`, `is_exclusive`, `is_active`, audit fields.
  - **`public.promo_usages`**: promo usage log.  
    - Links promo codes to payments/orders for analytics.  
    - Key fields: `id`, `app_id`, `promo_code_id`, `campaign_id`, `user_id`, `order_id` / `transaction_log_id`,  
      `used_at`, `order_amount_before`, `order_amount_after`, `discount_amount`, `currency`, `source`, `metadata`.

  - **Implemented use cases** (module: `modules/merchant-admin/promo-codes`):
    - `CreatePromoCodeUseCase`, `UpdatePromoCodeUseCase`, `ChangePromoCodeStatusUseCase`, `ListPromoCodesUseCase`, `GetPromoCodeDetailsUseCase` (and bulk/create flows where applicable).

  - **Ports / Infrastructure**:
    - `PromoCodeRepositoryPort`, `PromoUsageRepositoryPort`, `PromoCampaignRepositoryPort`.
    - Supabase-backed repositories in `infrastructure` using the tables above; DTO ↔ domain mapping only.

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
│   │   │   ├── products/
│   │   │   │   ├── domain/
│   │   │   │   ├── application/
│   │   │   │   ├── infrastructure/
│   │   │   │   └── interface-adapters/
│   │   │   └── promo-codes/   (planned)
│   │   │       ├── domain/
│   │   │       ├── application/
│   │   │       ├── infrastructure/
│   │   │       └── interface-adapters/

### Merchant Admin · Promo Codes UI (design)

At the UI layer the promo codes module is expected to provide:

- **Promo Codes List Page**
  - Table with columns: Code, Campaign/Affiliate, Type (percent/fixed), Value, Status (active/expired/upcoming),
    total usages, revenue, created/updated timestamps.
  - Filters: by status (active/expired/upcoming), campaign/affiliate, owner type, discount type, search by code/name.
  - Actions:
    - Create new promo code.
    - Quick enable/disable.
    - Open details.

- **Promo Code Form (Create / Edit)**
  - Fields:
    - Basic: code, internal name, description.
    - Campaign / affiliate: select existing campaign or leave empty for generic codes.
    - Discount: type (`percent` or `fixed_amount`) and value; optional free‑shipping toggle (if enabled).
    - Validity: start date/time, end date/time.
    - Limits: max total redemptions, max redemptions per user.
    - Flags: `is_active`, `is_exclusive`.
  - Behaviour:
    - Client‑side validation for discount ranges and dates.
    - On submit → call the corresponding use case via presenter/controller.

- **Promo Code Details / Analytics Panel**
  - High‑level metrics (read from analytics layer when implemented):
    - Total usages for the code.
    - Revenue attributed to the code.
    - AOV with this code vs overall.
    - Breakdown by country and platform (if available).
  - Recent usages table (based on `promo_usages` / derived view):
    - Time, user (or anonymised), order amount before/after, discount amount.
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


