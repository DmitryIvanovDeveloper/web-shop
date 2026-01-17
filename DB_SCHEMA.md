## Webshops Data Schema (Supabase → Mobile Arts Infra)

This file describes the **logical data model** currently stored in Supabase for the Webshops stack.  
It is meant to be used as a **migration reference** when moving the data to Mobile Arts infrastructure (ADLS or another store).

All tables live in the **`public`** schema. Most relationships are expressed via IDs (`app_id`, `user_id`, `product_id`, etc.) without foreign-key constraints, which simplifies export/import. However, some tables do have foreign keys:
- `translations.language_code` → `languages.code` (ON DELETE CASCADE)
- `languages.fallback_code` → `languages.code` (ON DELETE SET NULL)
- `daily_reward_claims.reward_id` → `daily_rewards.id` (ON DELETE CASCADE)

---

### Table: `app_configs`

- **Purpose**: App-level UI configuration (equivalent of `app-config.json` per app).
- **Columns**:
  - `id uuid PK`
  - `app_id text`
  - `merchant_id text`
  - `config jsonb` – full app configuration document
  - `version int` (default `1`)
  - `is_active bool` (default `true`)
  - `is_draft bool` (default `false`)
  - `created_at timestamptz` (default `now()`)
  - `updated_at timestamptz` (default `now()`)
- **Indexes**:
  - `app_configs_pkey (id)` – PK
  - `idx_app_configs_app_id (app_id)` – lookup by app
  - `idx_app_configs_draft (app_id, is_draft, created_at DESC)` – latest drafts
  - `idx_app_configs_merchant (merchant_id, is_active)` – active configs per merchant
  - `unique_active_app_config (app_id) WHERE is_active = true` – only one active config per app
- **Relations (logical)**:
  - `app_id` is referenced by: `users`, `user_offer_context`, `offer_engine_rules`, `offer_scenarios`, `page_configs`, `products`, `transaction_log`.
- **Minimal example**:
  - `app_id: "APP123"`, `merchant_id: "merchant-1"`, `config: { ... }`, `version: 1`, `is_active: true`, `is_draft: false`.

---

### Table: `page_configs`

- **Purpose**: Per-page layout definitions for UI Builder / Page Renderer.
- **Columns**:
  - `id uuid PK`
  - `app_id varchar`
  - `page_slug varchar` (default `'home'`)
  - `version int` (default `1`)
  - `is_active bool` (default `false`)
  - `is_draft bool` (default `true`)
  - `sections jsonb` (default `'[]'`) – array of page sections; each section includes layout + ComponentNode trees.
  - `page_styles jsonb` (default `'{}'`) – page-level styles (padding, background, etc.)
  - `merchant_id varchar` (default `'550e8400-e29b-41d4-a716-446655440000'`)
  - `created_at timestamptz` (default `now()`)
  - `updated_at timestamptz` (default `now()`)
- **Indexes**:
  - `page_configs_pkey (id)`
  - `idx_page_configs_app_id (app_id)`
  - `idx_page_configs_active (is_active, page_slug) WHERE is_active = true`
  - `idx_page_configs_draft (is_draft, page_slug) WHERE is_draft = true`
  - `unique_page_draft (app_id, page_slug) WHERE is_draft = true`
- **Minimal example**:
  - `app_id: "APP123"`, `page_slug: "home"`, `is_active: true`, `sections: [{ id: "section-1", type: "header", ... }]`.

---

### Table: `templates`

- **Purpose**: Reusable templates for app and page configurations.
- **Columns**:
  - `id uuid PK`
  - `name varchar`
  - `app_config jsonb` – template for `app_configs.config`
  - `page_configs jsonb` – array of page config templates
  - `metadata jsonb` – e.g. `{ "description": "...", "category": "...", "createdBy": "...", "previewImageUrl": "...", "tags": ["..."] }`
  - `is_active bool` (default `true`)
  - `published bool` (default `false`)
  - `created_at timestamptz` (default `now()`)
  - `updated_at timestamptz` (default `now()`)
- **Indexes**:
  - `templates_pkey (id)`
  - `idx_templates_category ((metadata->>'category'))`
  - `idx_templates_created_at (created_at DESC)`
  - `idx_templates_is_active (is_active)`
- **Minimal example**:
  - `name: "Default Shop Template"`, `is_active: true`, `metadata.category: "starter"`.

---

### Table: `products`

- **Purpose**: Product catalog shared across admin, client and payment flows.
- **Columns**:
  - `id text PK` – product ID
  - `main_image text`
  - `background_image text`
  - `title text`
  - `description text` – product description text
  - `rarity text`
  - `discount text`
  - `player_limit text`
  - `limited_offer int` – number of limited offers available
  - `expires_at timestamptz`
  - `rp_bonus int`
  - `lp_bonus int`
  - `created_at timestamptz` (default `now()`)
  - `updated_at timestamptz` (default `now()`)
  - `appid text` – app/game ID
  - `price numeric`
- **Indexes**:
  - `products_pkey (id)`
- **Relations (logical)**:
  - `transaction_log.product_id` → `products.id` (by convention).
  - Product IDs also appear in `offer_scenarios.configuration` and `offer_engine_rules.rule_tree` JSON.
- **Minimal example**:
  - `id: "product-1763386231177-oyg8dde"`, `appid: "APP123"`, `title: "Test Product"`, `price: 100.00`, `limited_offer: 100`.

#### Migration SQL for adding `limited_offer` field

```sql
ALTER TABLE products ADD COLUMN limited_offer int;
```

---

### Table: `offer_scenarios`

- **Purpose**: Per-app offer scenarios (welcome offers, reactivation, VIP, etc.).
- **Columns**:
  - `app_id text`
  - `slug text`
  - `priority int`
  - `tags text[]`
  - `configuration jsonb` – scenario definition (trigger, items, offerIds, etc.)
  - `updated_at timestamptz` (default `now()`)
- **Primary key**:
  - `(app_id, slug)`
- **Indexes**:
  - `offer_scenarios_pkey (app_id, slug)`
  - `idx_offer_scenarios_app_id (app_id)`
  - `idx_offer_scenarios_slug (slug)`
- **Minimal example**:
  - `app_id: "APP123"`, `slug: "welcome-new-user-new_user_welcome"`, `priority: 90`, `tags: ["welcome", "new_user"]`, `configuration: { ... }`.

---

### Table: `offer_engine_rules`

- **Purpose**: JSON rule graph for the offer engine per application.
- **Columns**:
  - `app_id text PK`
  - `version text` – version tag (e.g. `"v1764152298453"`)
  - `rule_tree jsonb` – full rule set with conditions and actions
  - `updated_at timestamptz` (default `now()`)
- **Indexes**:
  - `offer_engine_rules_pkey (app_id)`
  - `idx_offer_engine_rules_app_id (app_id)`
- **Minimal example (shape)**:
  - `rule_tree.appId: "APP123"`
  - `rule_tree.ruleSet` with conditions on user metrics (e.g. `daysSinceLastActive >= 30`) and actions `showOffer`.
  - `rule_tree.scenarios[]` listing scenario slugs and product IDs.

---

### Table: `users`

- **Purpose**: In-app user registry (per application).
- **Columns**:
  - `id bigint PK` (sequence)
  - `app_id text`
  - `user_id uuid`
  - `created_at timestamptz` (default `now()`)
  - `updated_at timestamptz` (default `now()`)
  - `last_active_at timestamptz` (default `now()`)
- **Indexes**:
  - `users_pkey (id)`
  - `idx_users_app_user (app_id, user_id)`
  - `idx_users_last_active_at (last_active_at)`
  - `unique_app_user (app_id, user_id)` – one record per app/user pair
- **Minimal example**:
  - `app_id: "APP123"`, `user_id: "550e8400-e29b-41d4-a716-446655440000"`, `last_active_at: 2025-11-26T10:00:00Z`.

---

### Table: `user_offer_context`

- **Purpose**: Per-user JSON context used by the offer engine (segments, flags, attributes).
- **Columns**:
  - `id uuid PK`
  - `user_id uuid`
  - `app_id text`
  - `context jsonb` (default `'{}'`) – e.g. `{ "segment": "vip", "region": "EU", "daysSinceLastActive": 45 }`
  - `created_at timestamptz` (default `now()`)
  - `updated_at timestamptz` (default `now()`)
- **Indexes**:
  - `user_offer_context_pkey (id)`
  - `user_offer_context_app_user_idx (app_id, user_id)`
  - `user_offer_context_user_app_unique (user_id, app_id)` – unique per user/app
- **Minimal example**:
  - `user_id: "550e8400-e29b-41d4-a716-446655440000"`, `app_id: "APP123"`, `context: { "segment": "vip", "daysSinceLastActive": 10 }`.

---

### Table: `transaction_log`

- **Purpose**: Central ledger of payments (used by payment app and analytics).
- **Columns**:
  - `id uuid PK`
  - `user_id text` – external user identifier
  - `merchant_id uuid` (nullable)
  - `app_id text`
  - `product_id text`
  - `paid_amount numeric`
  - `created_at timestamptz` (default `now()`)
  - `stripe_payment_intent_id varchar` (unique, nullable)
  - `payment_status varchar` (default `'pending'`)
  - `payment_method varchar`
  - `error_message text` (nullable)
  - `updated_at timestamptz` (default `now()`)
- **Indexes**:
  - `payments_pkey (id)`
  - `transaction_log_stripe_payment_intent_id_key (stripe_payment_intent_id)` – unique
  - `idx_payments_app_id (app_id)`
  - `idx_payments_created_at (created_at)`
  - `idx_payments_merchant_id (merchant_id)`
  - `idx_payments_product_id (product_id)`
  - `idx_payments_user_id (user_id)`
  - `idx_transaction_log_payment_method (payment_method)`
  - `idx_transaction_log_payment_status (payment_status)`
  - `idx_transaction_log_stripe_payment_intent_id (stripe_payment_intent_id)`
- **Minimal examples**:
  - `id: "ef328db1-ad59-4bc5-9114-d335718983ac"`, `user_id: "anonymous"`, `app_id: "APP123"`, `product_id: "product-1763386231177-oyg8dde"`, `paid_amount: 100.00`, `payment_status: "succeeded"`, `payment_method: "stripe"`, `stripe_payment_intent_id: "pi_3SXjAoI7WlzwsAbQ0CHzPtYA"`.
  - `id: "10ad8d9f-5a5b-4d83-ba6d-b1ec7b3ef874"`, `paid_amount: 31.00`, `product_id: "987c391b-a24c-46c1-9628-ed5e1a2f6b8f"`, `payment_status: "succeeded"`.

---

### Table: `analytics`

- **Purpose**: Generic analytics payloads / metric snapshots for dashboards.
- **Columns**:
  - `id uuid PK`
  - `key text` (unique) – identifies metric set (e.g. `"sales_summary_2025-11-26"`)
  - `payload jsonb` – arbitrary analytics data (counts, aggregates, time series)
  - `created_at timestamptz` (default `now()`)
- **Indexes**:
  - `analytics_pkey (id)`
  - `analytics_key_key (key)`
- **Minimal example**:
  - `key: "sales_summary_APP123_2025-11-26"`, `payload: { "totalRevenue": 1234.56, "orders": 42, ... }`.

---

### Table: `languages`

- **Purpose**: Supported languages for localization system.
- **Columns**:
  - `id uuid PK`
  - `code varchar(5)` (unique) – ISO 639-1 language code (e.g. `'en'`, `'ar'`)
  - `name varchar(100)` – display name (e.g. `'English'`, `'Arabic'`)
  - `native_name varchar(100)` – native name (e.g. `'English'`, `'العربية'`)
  - `direction varchar(3)` – text direction: `'ltr'` or `'rtl'` (check constraint)
  - `is_active bool` (default `false`)
  - `fallback_code varchar(5)` (nullable) – fallback language code for missing translations
  - `flag varchar` (nullable) – flag emoji or identifier
  - `created_at timestamptz` (default `now()`)
  - `updated_at timestamptz` (default `now()`)
- **Indexes**:
  - `languages_pkey (id)`
  - `languages_code_key (code)` – unique
  - `idx_languages_active (is_active)`
  - `idx_languages_direction (direction)`
- **Foreign keys**:
  - `fallback_code` → `languages.code` (ON DELETE SET NULL)
- **Relations (logical)**:
  - Referenced by `translations.language_code`
- **Minimal example**:
  - `code: "en"`, `name: "English"`, `native_name: "English"`, `direction: "ltr"`, `is_active: true`.

---

### Table: `translations`

- **Purpose**: Translation strings for different languages and keys.
- **Columns**:
  - `id uuid PK`
  - `key varchar(255)` – translation key in dot notation (e.g. `'products.buyButton'`)
  - `language_code varchar(5)` – reference to `languages.code`
  - `value text` – translated text
  - `is_translated bool` (default `true`) – whether translation is complete
  - `context text` (nullable) – additional context for translators
  - `created_at timestamptz` (default `now()`)
  - `updated_at timestamptz` (default `now()`)
- **Primary key**:
  - `(key, language_code)` – unique constraint
- **Indexes**:
  - `translations_pkey (id)`
  - `idx_translations_language_code (language_code)`
  - `idx_translations_key (key)`
  - `idx_translations_language_key (language_code, key)`
  - `idx_translations_is_translated (is_translated)`
- **Foreign keys**:
  - `language_code` → `languages.code` (ON DELETE CASCADE)
- **Minimal example**:
  - `key: "products.buyButton"`, `language_code: "en"`, `value: "Buy Now"`, `is_translated: true`.

---

### Table: `daily_rewards`

- **Purpose**: Daily reward configurations managed by merchants.
- **Columns**:
  - `id uuid PK`
  - `app_id text` – app/game ID
  - `type text` – reward type: `'points'`, `'currency'`, or `'item'` (check constraint)
  - `title text` – reward title
  - `description text` – reward description
  - `points integer` – number of points/currency awarded (check: `points > 0`)
  - `is_active bool` (default `true`) – whether reward is currently available
  - `day_number integer` (nullable) – day number for this reward (1, 2, 3, etc.). NULL means reward is not day-specific.
  - `created_at timestamptz` (default `now()`)
  - `updated_at timestamptz` (default `now()`)
- **Indexes**:
  - `daily_rewards_pkey (id)`
  - `idx_daily_rewards_app_id (app_id)`
  - `idx_daily_rewards_active (is_active)`
  - `idx_daily_rewards_app_active (app_id, is_active)`
  - `idx_daily_rewards_day_number (day_number)`
  - `idx_daily_rewards_app_day (app_id, day_number)`
  - `daily_rewards_app_day_unique (app_id, day_number) WHERE day_number IS NOT NULL` – unique per app/day
  - `daily_rewards_app_title_unique (app_id, title)` – unique title per app
- **Relations (logical)**:
  - Referenced by `daily_reward_claims.reward_id`
- **Minimal example**:
  - `app_id: "APP123"`, `type: "points"`, `title: "Daily Bonus"`, `points: 100`, `day_number: 1`, `is_active: true`.

---

### Table: `daily_reward_claims`

- **Purpose**: Tracks user claims of daily rewards.
- **Columns**:
  - `id uuid PK`
  - `user_id text` – external user identifier
  - `reward_id uuid` – reference to `daily_rewards.id`
  - `claimed_at timestamptz` (default `now()`) – when the user claimed the reward
  - `points_awarded integer` – actual points awarded (check: `points_awarded > 0`)
  - `created_at timestamptz` (default `now()`)
  - `updated_at timestamptz` (default `now()`)
- **Indexes**:
  - `daily_reward_claims_pkey (id)`
  - `idx_reward_claims_user_id (user_id)`
  - `idx_reward_claims_reward_id (reward_id)`
  - `idx_reward_claims_user_date (user_id, DATE(claimed_at))`
  - `idx_reward_claims_claimed_at (claimed_at)`
- **Foreign keys**:
  - `reward_id` → `daily_rewards.id` (ON DELETE CASCADE)
- **Constraints**:
  - `UNIQUE(user_id, DATE(claimed_at))` – one claim per user per day
- **Minimal example**:
  - `user_id: "user-123"`, `reward_id: "550e8400-e29b-41d4-a716-446655440000"`, `points_awarded: 100`, `claimed_at: 2025-01-17T10:00:00Z`.

---

### Table: `patch_notes`

- **Purpose**: Application patch notes and version management.
- **Columns**:
  - `id uuid PK`
  - `version varchar` (unique) – semantic version (e.g. `'1.2.3'`, check: `version ~ '^\\d+\\.\\d+\\.\\d+$'`)
  - `title varchar` – patch note title
  - `description text` (nullable) – patch note description
  - `changes jsonb` (default `'[]'`) – array of changes (e.g. `[{ "type": "feature", "description": "..." }]`)
  - `status varchar` (default `'draft'`) – status: `'draft'`, `'published'`, or `'scheduled'` (check constraint)
  - `app_id varchar` (default `'default-app'`) – application identifier
  - `published_at timestamptz` (nullable) – when the patch note was published
  - `scheduled_for timestamptz` (nullable) – scheduled publication time (check: `scheduled_for > now()`)
  - `created_at timestamptz` (default `now()`)
  - `updated_at timestamptz` (default `now()`)
- **Indexes**:
  - `patch_notes_pkey (id)`
  - `patch_notes_version_key (version)` – unique
- **Minimal example**:
  - `version: "1.2.3"`, `title: "New Features Update"`, `status: "published"`, `app_id: "APP123"`, `published_at: 2025-01-17T10:00:00Z`.

---

### Table: `projects`

- **Purpose**: Application projects (games/apps) managed by merchants.
- **Columns**:
  - `id uuid PK`
  - `app_id varchar` (unique) – application identifier
  - `name varchar` – project name
  - `description text` (nullable) – project description
  - `status varchar` (default `'active'`) – status: `'active'`, `'archived'`, or `'draft'` (check constraint)
  - `merchant_id uuid` – merchant identifier
  - `created_at timestamptz` (default `now()`)
  - `updated_at timestamptz` (default `now()`)
- **Indexes**:
  - `projects_pkey (id)`
  - `projects_app_id_key (app_id)` – unique
- **Minimal example**:
  - `app_id: "APP123"`, `name: "My Game"`, `status: "active"`, `merchant_id: "550e8400-e29b-41d4-a716-446655440000"`.

---

## Merchant‑Admin: Promo Codes Module

This section describes the **implemented** Merchant‑Admin "promo codes" module.

### Domain concepts

- **PromoCode**
  - A concrete code that users can enter at checkout (e.g. `"IVANOV10"`, `"STREAMER_X_15"`).
  - Belongs to an app (`app_id`) and may optionally belong to a campaign (`campaign_id`).
  - Encodes a **discount rule** and restrictions (time window, limits).
  - Note: `promo_campaigns` and `promo_usages` tables are not yet implemented in the current schema.

#### PromoCode invariants (business rules)

- **Uniqueness**
  - `code` is unique **per app** (case‑insensitive match at validation time).
- **Validity window**
  - `start_at` / `end_at` define when the code can be used.
  - Before `start_at` → code is considered **not yet active**.
  - After `end_at` (or if `end_at` is in the past) → code is considered **expired**.
- **Activation flag**
  - `is_active` controls whether the merchant/admin allows the code to be used at all.
  - Expired codes are effectively inactive even if `is_active = true`.
- **Limits**
  - Global limit: `max_redemptions` – maximum number of total uses across all users.
  - Per‑user limit: `max_redemptions_per_user` – how many times a single user can use the code.
  - Note: Per-campaign limits are not yet implemented (no `promo_campaigns` table exists).
- **Discount types (v1)**
  - Percentage discount: `discount_type = 'percent'`, `discount_value` in range `(0, 100]`.
  - Fixed‑amount discount: `discount_type = 'fixed_amount'`, `discount_value` in base currency of the app.
  - Optional free‑shipping flag can be added later as a separate boolean or discount type.
- **Compatibility**
  - v1 assumes **one promo code per order** (no stacking).
  - A boolean flag `is_exclusive` can be used to express future stacking/priority rules; in v1 it is always treated as exclusive.

---

### Table: `promo_codes`

- **Purpose**: Concrete promo codes that can be applied at checkout.
- **Columns**:
  - `id uuid PK`
  - `app_id text`
  - `campaign_id uuid` (nullable) – optional campaign identifier (for future `promo_campaigns` table if implemented).
  - `code text` – visible code string (stored in canonical form, e.g. upper‑case).
  - `name text` – internal/admin name (e.g. `"Streamer X 10% off"`).
  - `description text` (nullable)
  - `discount_type text` – `percent` or `fixed_amount`.
  - `discount_value numeric` – percentage value (0–100] or fixed amount in base currency.
  - `currency text` (nullable) – when `discount_type = 'fixed_amount'`; base currency of the app/shop.
  - `is_free_shipping bool` (default `false`) – optional flag for future support of free‑shipping promos.
  - `start_at timestamptz` (nullable) – when the code becomes valid; `NULL` means immediately.
  - `end_at timestamptz` (nullable) – when the code expires; `NULL` means no explicit expiry.
  - `max_redemptions int` (nullable) – global maximum number of uses across all users.
  - `max_redemptions_per_user int` (nullable) – per‑user limit.
  - `priority int` (default `0`) – used to resolve conflicts when multiple codes could apply (for future stacking rules).
  - `is_exclusive bool` (default `true`) – whether this code can be combined with other discounts.
  - `is_active bool` (default `true`) – admin‑controlled flag.
  - `created_by text` (nullable) – identifier of admin who created the code.
  - `updated_by text` (nullable) – identifier of admin who last updated the code.
  - `created_at timestamptz` (default `now()`)
  - `updated_at timestamptz` (default `now()`)
- **Indexes**:
  - `promo_codes_pkey (id)`
  - Unique constraint on `(app_id, code)` should be enforced at the application layer (case-insensitive).
- **Constraints (logical)**:
  - Unique `(app_id, code)` – case‑insensitive check should be enforced at the application layer.
  - For `discount_type = 'percent'`, `discount_value` must be in `(0, 100]`.
  - For `discount_type = 'fixed_amount'`, `discount_value > 0` and `currency` must be set.
- **Relations (logical)**:
  - `campaign_id` is nullable and can reference future `promo_campaigns` table if implemented.

---

## Supabase Storage: `Images` bucket

In addition to database tables, the project uses a **Supabase Storage bucket** named **`Images`** to store product images.

- **Bucket**: `Images`
- **Path structure**:
  - Paths usually look like: `Images/products/<filename>.png` (or `.jpg`, `.webp`, etc.).
- **How it is accessed in the apps**:
  - The `web-shop` app exposes a proxy endpoint:
    - `GET /api/products/image/[...path]`
    - Example: `/api/products/image/Images/products/filename.png`
  - Backend logic:
    - Reconstructs the path from the URL segments.
    - Strips the `Images/` prefix → `products/filename.png`.
    - Calls Supabase Storage: `supabase.storage.from('Images').download('products/filename.png')`.
    - Streams the file back with the appropriate `Content-Type` and cache headers.
- **Relation to DB**:
  - `public.products.main_image` / `background_image` may refer to these paths or URLs that resolve via this proxy.

### Storage migration notes

When migrating away from Supabase Storage:

- **Preserve logical paths**: keep the `Images/` → `products/` hierarchy so any stored references continue to make sense.
- **Re-implement the proxy**:
  - Keep the external contract `/api/products/image/Images/...` unchanged.
  - Inside the route, read from the new storage backend (e.g. ADLS) instead of Supabase.
- **Match behavior**:
  - Configure similar caching and CORS/ORB behavior so existing clients work the same way.

---

### Table: `offer_engine_rules` (data example)

One real record (shortened) to illustrate how rules and scenarios are combined:

- `app_id: "APP123"`
- `version: "v1764152298453"`
- `rule_tree` (selected fields):
  - `ruleSet.condition`: compares `user.metrics.daysSinceLastActive` with `30` (e.g. win-back rule).
  - `ruleSet.nextOperation.action`: `{ actionType: "showOffer", params: { offerId: ["83322bf7-2ceb-42dc-ad59-4001c525560d"], scenario: "reactivation-offer-inactive_30_days" } }`
  - `scenarios[]`: multiple entries such as:
    - `"reactivation-offer-inactive_30_days"` – uses product `83322bf7-2ceb-42dc-ad59-4001c525560d`.
    - `"welcome-new-user-new_user_welcome"` – uses test products `product-1763386231177-oyg8dde`, `product-1763547891508-1r10bfh`.

This structure is important to keep intact when migrating, since it’s interpreted by the offer engine in the client.

---

## Notes for Migration

- Most tables have **no foreign keys**, so:
  - You can export most tables independently.
  - Logical relationships should be re-defined in the target system by joining on `app_id`, `user_id`, `product_id`, etc.
- **Tables with foreign keys** (export in order):
  - Export `languages` before `translations` (due to `translations.language_code` → `languages.code`).
  - Export `daily_rewards` before `daily_reward_claims` (due to `daily_reward_claims.reward_id` → `daily_rewards.id`).
- JSONB fields (`config`, `sections`, `page_styles`, `metadata`, `payload`, `context`, `rule_tree`, `configuration`, `changes`) should be preserved as JSON documents.
- Indexes listed above represent current access patterns; when moving to ADLS or another analytical store, use them as a hint for:
  - partitioning keys (e.g. by `app_id`, `created_at`, `page_slug`),
  - clustered/secondary indexes in serving layers (e.g. lakehouse engine, warehouse).

---

## Useful SQL to extract full schema (Postgres/Supabase)

The following queries can be used (from `psql` or a migration script) to extract **tables, constraints, indexes, RLS, schemas, extensions, sequences, views, triggers and grants** as DDL.

### Tables, constraints, indexes

```sql
select pg_catalog.pg_get_tabledef(oid) as ddl
from pg_class
where relkind in ('r','p') -- ordinary and partitioned tables
  and relnamespace in (
    select oid from pg_namespace
    where nspname not in ('pg_catalog','information_schema','pg_toast')
  )
order by relnamespace::regnamespace::text, relname;
```

### RLS policies

```sql
select format(
  'CREATE POLICY %I ON %I.%I FOR %s TO %s%s%s;',
  pol.policyname,
  pol.schemaname,
  pol.tablename,
  pol.cmd,
  case when array_length(pol.roles,1) is null then 'PUBLIC' else array_to_string(pol.roles, ',') end,
  case when pol.qual is not null then format(' USING (%s)', pol.qual) else '' end,
  case when pol.with_check is not null then format(' WITH CHECK (%s)', pol.with_check) else '' end
) as ddl
from pg_policies pol
where pol.schemaname not in ('pg_catalog','information_schema')
order by pol.schemaname, pol.tablename, pol.policyname;
```

### Schemas

```sql
select format('create schema if not exists %I;', nspname) as ddl
from pg_namespace
where nspname not in ('pg_catalog','information_schema','pg_toast')
order by nspname;
```

### Extensions

```sql
select format('create extension if not exists %I with schema %I;', e.extname, n.nspname) as ddl
from pg_extension e
join pg_namespace n on n.oid = e.extnamespace
order by e.extname;
```

### Sequences

```sql
select pg_get_serial_sequence(format('%I.%I', n.nspname, c.relname), a.attname) as seq
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
join pg_attribute a on a.attrelid = c.oid and a.attnum > 0 and not a.attisdropped
where c.relkind in ('r','p')
  and n.nspname not in ('pg_catalog','information_schema','pg_toast')
  and pg_get_serial_sequence(format('%I.%I', n.nspname, c.relname), a.attname) is not null
group by n.nspname, c.relname, a.attname;
```

### Views

```sql
select pg_get_viewdef(format('%I.%I', n.nspname, c.relname)::regclass, true) as view_sql,
       n.nspname as schema, c.relname as view_name
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where c.relkind = 'v'
  and n.nspname not in ('pg_catalog','information_schema')
order by 2, 3;
```

### Materialized views

```sql
select pg_get_viewdef(format('%I.%I', n.nspname, c.relname)::regclass, true) as view_sql,
       n.nspname as schema, c.relname as mview_name
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where c.relkind = 'm'
  and n.nspname not in ('pg_catalog','information_schema')
order by 2, 3;
```

### Trigger functions

```sql
select pg_get_functiondef(p.oid) as ddl
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname not in ('pg_catalog','information_schema','pg_toast')
  and exists (
    select 1 from pg_trigger t where t.tgfoid = p.oid and not t.tgisinternal
  )
order by n.nspname, p.proname;
```

### Triggers

```sql
select format(
  'create trigger %I %s %s on %I.%I for each %s execute function %s;',
  t.tgname,
  case when t.tgtype & 1 = 1 then 'before'
       when t.tgtype & 2 = 2 then 'after'
       when t.tgtype & 4 = 4 then 'instead of' end,
  array_to_string(array_remove(array[
    case when t.tgtype & 16 = 16 then 'insert' end,
    case when t.tgtype & 32 = 32 then 'delete' end,
    case when t.tgtype & 64 = 64 then 'update' end,
    case when t.tgtype & 128 = 128 then 'truncate' end
  ], null), ' or '),
  ns.nspname,
  c.relname,
  case when t.tgtype & 8 = 8 then 'row' else 'statement' end,
  pg_get_function_identity_arguments(p.oid)::text || ' ' ||
  format('%I.%I', np.nspname, p.proname) || '(' ||
  array_to_string(ARRAY(
    select quote_literal(x) from unnest(coalesce(t.tgargs::text[], '{}')) as x
  ), ', ') || ')'
) as ddl
from pg_trigger t
join pg_class c on c.oid = t.tgrelid
join pg_namespace ns on ns.oid = c.relnamespace
join pg_proc p on p.oid = t.tgfoid
join pg_namespace np on np.oid = p.pronamespace
where not t.tgisinternal
  and ns.nspname not in ('pg_catalog','information_schema','pg_toast')
order by ns.nspname, c.relname, t.tgname;
```

### Table grants

```sql
select format(
  'grant %s on %I.%I to %s;',
  string_agg(privilege_type, ', '),
  table_schema,
  table_name,
  grantee
) as ddl
from information_schema.table_privileges
where table_schema not in ('pg_catalog','information_schema')
group by table_schema, table_name, grantee
order by table_schema, table_name, grantee;
```



