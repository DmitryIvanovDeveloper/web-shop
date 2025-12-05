## Webshops Data Schema (Supabase → Mobile Arts Infra)

This file describes the **logical data model** currently stored in Supabase for the Webshops stack.  
It is meant to be used as a **migration reference** when moving the data to Mobile Arts infrastructure (ADLS or another store).

All tables live in the **`public`** schema. There are **no foreign-key constraints** – relationships are expressed via IDs (`app_id`, `user_id`, `product_id`, etc.), which simplifies export/import.

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
  - `rarity text`
  - `discount text`
  - `player_limit text`
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
  - `id: "product-1763386231177-oyg8dde"`, `appid: "APP123"`, `title: "Test Product"`, `price: 100.00`.

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

## Merchant‑Admin: Promo Codes Module (logical model)

This section describes the **logical data model** for the future Merchant‑Admin "promo codes" module.  
It is a design reference for future migrations and implementation – tables may evolve, but the core
concepts and invariants should stay stable.

### Domain concepts

- **PromoCampaign / Affiliate**
  - A logical grouping for promo codes owned by an **influencer, partner or internal campaign**.
  - Examples: `"influencer-123"`, `"twitch-partner-42"`, `"summer_sale_2026"`.
  - Used for reporting and aggregation (usage, revenue, AOV per campaign/affiliate).

- **PromoCode**
  - A concrete code that users can enter at checkout (e.g. `"IVANOV10"`, `"STREAMER_X_15"`).
  - Belongs to an app (`app_id`) and may optionally belong to a campaign/affiliate.
  - Encodes a **discount rule** and restrictions (time window, limits).

- **PromoUsage**
  - A logical record of a successful promo code application.
  - Links promo code / campaign / affiliate to a concrete **payment / order**.
  - Used primarily for analytics (how many times a code was used, how much revenue it generated).

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
  - Optional per‑campaign limit: total allowed redemptions across all codes in the same campaign.
- **Discount types (v1)**
  - Percentage discount: `discount_type = 'percent'`, `discount_value` in range `(0, 100]`.
  - Fixed‑amount discount: `discount_type = 'fixed_amount'`, `discount_value` in base currency of the app.
  - Optional free‑shipping flag can be added later as a separate boolean or discount type.
- **Compatibility**
  - v1 assumes **one promo code per order** (no stacking).
  - A boolean flag `is_exclusive` can be used to express future stacking/priority rules; in v1 it is always treated as exclusive.

---

### Table: `promo_campaigns`

- **Purpose**: Grouping of promo codes by influencer, partner or internal campaign.
- **Columns**:
  - `id uuid PK`
  - `app_id text` – app/merchant application ID.
  - `slug text` – short identifier (e.g. `"streamer_x"`, `"summer_2026"`).
  - `name text` – human‑readable name.
  - `description text` (nullable)
  - `owner_type text` – `influencer`, `partner`, `internal` (enum at the application level).
  - `owner_id text` (nullable) – external identifier of influencer/partner in another system.
  - `metadata jsonb` (default `'{}'`) – arbitrary attributes for reporting (channels, tags, etc.).
  - `is_active bool` (default `true`)
  - `created_at timestamptz` (default `now()`)
  - `updated_at timestamptz` (default `now()`)
- **Indexes**:
  - `promo_campaigns_pkey (id)`
  - `idx_promo_campaigns_app_id (app_id)`
  - `idx_promo_campaigns_slug (app_id, slug)`
  - `idx_promo_campaigns_owner (owner_type, owner_id)`
- **Relations (logical)**:
  - `promo_codes.campaign_id` → `promo_campaigns.id` (optional).
  - Analytics can aggregate by `campaign_id` / `owner_type` / `owner_id`.

---

### Table: `promo_codes`

- **Purpose**: Concrete promo codes that can be applied at checkout.
- **Columns**:
  - `id uuid PK`
  - `app_id text`
  - `campaign_id uuid` (nullable) – links to `promo_campaigns.id` when the code belongs to a campaign/affiliate.
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
  - `idx_promo_codes_app_code (app_id, code)` – unique per app (enforced by a unique index).
  - `idx_promo_codes_campaign (campaign_id)`
  - `idx_promo_codes_active (is_active, start_at, end_at)`
- **Constraints (logical)**:
  - Unique `(app_id, code)` – case‑insensitive check should be enforced at the application layer.
  - For `discount_type = 'percent'`, `discount_value` must be in `(0, 100]`.
  - For `discount_type = 'fixed_amount'`, `discount_value > 0` and `currency` must be set.

---

### Table: `promo_usages`

- **Purpose**: Log of successful promo code applications (used for reporting and analytics).
- **Columns**:
  - `id uuid PK`
  - `app_id text`
  - `promo_code_id uuid` – reference to `promo_codes.id`.
  - `campaign_id uuid` (nullable) – denormalized link to `promo_campaigns.id` for faster analytics.
  - `user_id text` (nullable) – external user identifier (same semantics as in `transaction_log.user_id`).
  - `order_id uuid` (nullable) – logical order identifier; may reuse `transaction_log.id` when applicable.
  - `transaction_log_id uuid` (nullable) – explicit link to `transaction_log.id` when the integration is implemented.
  - `used_at timestamptz` (default `now()`)
  - `order_amount_before numeric` (nullable) – order total before applying the promo.
  - `order_amount_after numeric` (nullable) – order total after applying the promo.
  - `discount_amount numeric` (nullable) – actual discount applied (for percentage promos it depends on order total).
  - `currency text` (nullable) – currency of the order.
  - `source text` – where the usage came from: `webshop`, `mobile`, `external`, etc.
  - `metadata jsonb` (default `'{}'`) – optional extra fields (e.g. channel, device, checkout variant).
- **Indexes**:
  - `promo_usages_pkey (id)`
  - `idx_promo_usages_app (app_id)`
  - `idx_promo_usages_promo_code (promo_code_id)`
  - `idx_promo_usages_campaign (campaign_id)`
  - `idx_promo_usages_user (user_id)`
  - `idx_promo_usages_used_at (used_at)`
- **Relations (logical)**:
  - `promo_usages.promo_code_id` → `promo_codes.id`.
  - `promo_usages.transaction_log_id` → `transaction_log.id` (when wired).
  - Used by future analytics to compute **usage counts, revenue, AOV and performance per code/campaign/affiliate**.

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

- There are **no foreign keys**, so:
  - You can export each table independently.
  - Logical relationships should be re-defined in the target system by joining on `app_id`, `user_id`, `product_id`, etc.
- JSONB fields (`config`, `sections`, `page_styles`, `metadata`, `payload`, `context`, `rule_tree`, `configuration`) should be preserved as JSON documents.
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



