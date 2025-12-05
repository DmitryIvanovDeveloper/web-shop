### Analytics Events & Merchant Admin Panel (ENG)

---

### 1. Overview

**Purpose**

This document defines:

- The **event schema** used for analytics.
- The **data sources**: Stripe, SDK, Publishers.
- How the **Merchant Admin Panel** consumes analytics data (Revenue, ARPU, Retention, Country).

**Data Flow (high‑level)**

1. Events are produced by:
   - **Stripe** – billing and payment events.
   - **SDK** – in‑app user events.
   - **Publishers** – traffic / attribution events.
2. Events are ingested into the analytics backend and stored in a unified format.
3. Aggregations are computed (Revenue, ARPU, Retention by Country / App / Plan).
4. The Merchant Admin Panel queries pre‑aggregated data via analytics APIs.

---

### 2. Event Schema

#### 2.1. Core Event Shape

All events share a common envelope:

```json
{
  "event_name": "purchase_completed",
  "event_id": "uuid",
  "occurred_at": "2025-12-01T12:34:56Z",
  "source": "stripe | sdk | publisher",
  "environment": "production | staging",
  "app_id": "APP123",
  "user_id": "user_123",
  "anonymous_id": "anon_abc",
  "session_id": "session_456",
  "country": "US",
  "currency": "USD",
  "revenue": 99.99,
  "arpu": 4.21,
  "retention_day": 7,
  "retention_cohort": "2025-11-01",
  "properties": {}
}
```

#### 2.2. Fields (logical event model)

For readability, fields are grouped by purpose. This is a **logical event model**, not a strict physical table schema: some fields are only used for specific event types.

##### 2.2.1. Core event fields (for all events)

| Field         | Type     | Required | Description                                                              |
|---------------|----------|----------|--------------------------------------------------------------------------|
| `event_name`  | string   | yes      | Logical event type (e.g. `purchase_completed`, `subscription_renewed`). |
| `event_id`    | uuid     | yes      | Unique identifier of the event.                                         |
| `occurred_at` | datetime | yes      | UTC timestamp when the event occurred.                                  |
| `source`      | enum     | yes      | `stripe`, `sdk`, `publisher`.                                           |
| `environment` | enum     | yes      | `production`, `staging`, etc.                                           |
| `app_id`      | string   | yes      | Application / merchant app identifier.                                  |

##### 2.2.2. User / session context

| Field          | Type   | Required | Used by      | Description                                      |
|----------------|--------|----------|--------------|--------------------------------------------------|
| `user_id`      | string | no       | sdk, stripe  | Authenticated user id (if available).           |
| `anonymous_id` | string | no       | sdk          | Anonymous user id from client SDK.              |
| `session_id`   | string | no       | sdk          | Session identifier.                              |

##### 2.2.3. Geo / currency context

| Field     | Type   | Required | Used by      | Description                                      |
|-----------|--------|----------|--------------|--------------------------------------------------|
| `country` | string | yes\*    | stripe, sdk  | ISO‑2 country (billing country or geo‑IP).      |
| `currency`| string | no       | stripe       | ISO‑4217 currency code (for revenue events).    |

> `country` is required for analytics use‑cases (Revenue by country, Geography, etc.),  
> but in the technical implementation it may be `NULL` for some sources.

##### 2.2.4. Metric fields (not populated for all events)

| Field             | Type    | Used by          | Description                                                     |
|-------------------|---------|------------------|-----------------------------------------------------------------|
| `revenue`         | number  | stripe, derived  | Monetary amount in `currency` (positive for charge, negative for refund). |
| `arpu`            | number  | derived          | Average Revenue Per User for aggregated events.                |
| `retention_day`   | int     | derived          | Retention bucket: 0, 1, 7, 30, etc.                            |
| `retention_cohort`| date    | derived          | Cohort start date (e.g. first purchase date).                  |

##### 2.2.5. Flexible attributes

| Field        | Type   | Description                                     |
|--------------|--------|-------------------------------------------------|
| `properties` | object | Event‑specific attributes (see 2.3 for examples). |

#### 2.3. `properties` Examples

> Note: this section describes the **logical model for raw events** (ingestion layer).
> In the current implementation of the dashboard we work only with **pre‑aggregated payloads**
> in the `analytics` table and typed DTOs – there is no generic `properties` field there yet.

Depending on `event_name` and `source`, `properties` may include:

- **Billing (Stripe)**:
  - `plan_id` (string)
  - `product_id` (string)
  - `stripe_charge_id` (string)
  - `stripe_customer_id` (string)
- **User / Device (SDK)**:
  - `device_type` (`ios` / `android` / `web`)
  - `os_version` (string)
  - `app_version` (string)
- **Attribution (Publishers)**:
  - `publisher_id` (string)
  - `campaign_id` (string)
  - `channel` (string)

---

### 3. Metrics Definitions

#### 3.1. Revenue

- **Definition**: Total revenue generated over the selected period.
- **Formula**: Sum of `revenue` for events with `event_name` in:
  - `purchase_completed`
  - `subscription_renewed`
- **Dimensions**:
  - `app_id`
  - `country`
  - `currency`
  - `plan_id` (from `properties.plan_id`)

#### 3.2. ARPU

- **Definition**: Average Revenue Per User over a selected period.
- **Formula**:  
  \[
  ARPU = \frac{\sum revenue}{\text{number of active users in period}}
  \]
- **Dimensions**:
  - `app_id`
  - `country`
  - `plan_id`

#### 3.3. Retention

- **Definition**: Share of users that return on day N after their first event (or first purchase).
- **Fields**:
  - `retention_day` – 0, 1, 7, 30, etc.
  - `retention_cohort` – cohort start date.
- **Dimensions**:
  - `app_id`
  - `country`

---

### 4. Analytics API Contracts (current implementation)

Currently the Merchant Admin Panel uses a **single analytics endpoint** with a key‑based contract.

#### 4.1. Endpoint

- **URL**: `GET /api/analytics/[key]`
- **Path param**:
  - `key` – analytics payload key, one of:
    - `sales.summary`
    - `revenue.summary`
    - `geography.summary`
    - `conversion.summary`
    - `retention.summary`
    - `cohorts.summary`
    - `transactions.summary`
    - `payment-methods.summary`
    - `refunds.summary`
    - `marketing-channels.summary`

The API reads from the Supabase `analytics` table and returns the `payload` field **as‑is** for the given key.  
Each key has its own DTO and domain entity on the client side.

#### 4.2. Keys and Payload Shapes

- **`sales.summary`**
  - KPI block:
    - `totalSales` – total number of sales.
    - `transactions` – number of transactions.
    - `arpu` – average revenue per user for the period.
    - `currency` – reporting currency.
  - Optional trend:
    - Array of points `{ timestamp, value }`, where `value` is sales at that moment.

- **`revenue.summary`**
  - KPI block:
    - `totalRevenue` – total revenue for the period.
    - `averageOrderValue` – average order value.
    - `revenuePerVisitor` – revenue per visitor.
    - `netIncome` – net income.
    - `monthlyGrowth` – month‑over‑month growth (in percent or ratio).
    - `currency` – currency.
  - Optional trend:
    - Array of points `{ timestamp, value }`, where `value` is revenue at that moment.

- **`geography.summary`**
  - Set of regions:
    - `country` – ISO country code.
    - `percentage` – share of traffic/revenue from this country.

- **`conversion.summary`**
  - KPI block:
    - `conversionRate` – overall conversion rate (e.g. to purchase).
    - `refundRate` – share of refunds.
  - Channels:
    - Array `{ name, value, percentage }` for each marketing channel.

- **`retention.summary`**
  - Set of retention curves:
    - For each curve:
      - `cohortId` / `cohortName` – cohort identifier and name.
      - `points` – array of `{ day, retention }`, where `day` is D0/D1/D7/... and `retention` is the share of returning users.

- **`cohorts.summary`**
  - List of cohorts by acquisition channel:
    - For each record:
      - `channel` – acquisition channel.
      - `users` – number of users in the cohort.
      - `revenue` – revenue from the cohort.
      - `retention` – aggregated retention metric.

- **`payment-methods.summary`**
  - List of payment methods:
    - For each method:
      - `method` – name/type (card, paypal, apple_pay, etc.).
      - `revenue` – revenue through this method.
      - `transactions` – number of transactions.
      - `percentage` – share of total volume.

- **`refunds.summary`**
  - List of refunds:
    - `id` – refund identifier.
    - `transactionId` – original transaction.
    - `createdAt` – refund time.
    - `amount` – amount.
    - `currency` – currency.
    - `reason` – refund reason.
    - `type` – type (e.g. full / partial).

- **`marketing-channels.summary`**
  - Time series by marketing channels:
    - For each point:
      - `label` – X‑axis label (date/week/month).
      - `segments` – set of segments by channels:
        - `id`, `name`, `color`, `value` – identifier, name, color and metric value for the channel.

- **`transactions.summary`**
  - List of transactions:
    - `id` – transaction identifier.
    - `createdAt` – date/time.
    - `user` – user (display name/identifier).
    - `amount` – amount.
    - `currency` – currency.
    - `country` – country.
    - `method` – payment method.
    - `status` – status (e.g. `succeeded`, `pending`, `failed`).

---

### 5. Merchant Admin Panel – Screens & Widgets

#### 5.1. Dashboard

- **Revenue Over Time (chart)**
  - Data: `/api/analytics/revenue?groupBy=day`
- **Revenue by Country (bar / map)**
  - Data: `/api/analytics/revenue?groupBy=country`
- **Top Plans by Revenue (table)**
  - Data: `/api/analytics/revenue?groupBy=plan`

#### 5.2. Retention View

- **Cohort Heatmap**
  - Data: `/api/analytics/retention`

#### 5.3. ARPU View

- **ARPU by Country / Plan**
  - Data: `/api/analytics/arpu?groupBy=country` or `plan`

---

### 6. Event Names & Examples

#### 6.1. Billing / Revenue (Stripe)

- **`purchase_completed`** – one‑time purchase

```json
{
  "event_name": "purchase_completed",
  "event_id": "uuid",
  "occurred_at": "2025-12-01T12:34:56Z",
  "source": "stripe",
  "environment": "production",
  "app_id": "APP123",
  "user_id": "user_123",
  "country": "US",
  "currency": "USD",
  "revenue": 49.99,
  "properties": {
    "stripe_charge_id": "ch_123",
    "stripe_customer_id": "cus_456",
    "product_id": "prod_789",
    "plan_id": "one_time_49",
    "publisher_id": "pub_001"
  }
}
```

- **`subscription_started`** – subscription start

```json
{
  "event_name": "subscription_started",
  "source": "stripe",
  "app_id": "APP123",
  "user_id": "user_123",
  "country": "US",
  "currency": "USD",
  "revenue": 9.99,
  "properties": {
    "stripe_subscription_id": "sub_123",
    "plan_id": "monthly_9",
    "product_id": "prod_abc"
  }
}
```

- **`subscription_renewed`** – subscription renewal

```json
{
  "event_name": "subscription_renewed",
  "source": "stripe",
  "app_id": "APP123",
  "user_id": "user_123",
  "country": "US",
  "currency": "USD",
  "revenue": 9.99,
  "properties": {
    "stripe_subscription_id": "sub_123",
    "plan_id": "monthly_9"
  }
}
```

- **`refund_issued`** – refund

```json
{
  "event_name": "refund_issued",
  "source": "stripe",
  "app_id": "APP123",
  "user_id": "user_123",
  "country": "US",
  "currency": "USD",
  "revenue": -9.99,
  "properties": {
    "stripe_charge_id": "ch_123",
    "reason": "requested_by_customer"
  }
}
```

#### 6.2. Product / Usage (SDK)

- **`session_started`**

```json
{
  "event_name": "session_started",
  "source": "sdk",
  "app_id": "APP123",
  "user_id": "user_123",
  "anonymous_id": "anon_abc",
  "session_id": "sess_001",
  "country": "DE",
  "properties": {
    "device_type": "ios",
    "os_version": "17.1",
    "app_version": "1.3.0"
  }
}
```

- **`session_ended`**

```json
{
  "event_name": "session_ended",
  "source": "sdk",
  "app_id": "APP123",
  "user_id": "user_123",
  "session_id": "sess_001",
  "country": "DE",
  "properties": {
    "duration_seconds": 420
  }
}
```

- **`feature_used`** (optional product analytics)

```json
{
  "event_name": "feature_used",
  "source": "sdk",
  "app_id": "APP123",
  "user_id": "user_123",
  "country": "US",
  "properties": {
    "feature_key": "offers.apply_coupon",
    "context": "checkout"
  }
}
```

#### 6.3. Attribution (Publishers)

- **`attribution_click`**

```json
{
  "event_name": "attribution_click",
  "source": "publisher",
  "app_id": "APP123",
  "properties": {
    "publisher_id": "pub_001",
    "campaign_id": "camp_black_friday",
    "channel": "facebook_ads"
  }
}
```

- **`attribution_install`**

```json
{
  "event_name": "attribution_install",
  "source": "publisher",
  "app_id": "APP123",
  "properties": {
    "publisher_id": "pub_001",
    "campaign_id": "camp_black_friday",
    "channel": "facebook_ads"
  }
}
```

---

### 7. Stripe → Event Schema Mapping

This section explains how typical Stripe events are translated into our logical `event_name` and fields.

#### 7.1. `checkout.session.completed` → `purchase_completed`

- **When**: a one‑time purchase via Stripe Checkout has been successfully completed.
- **Resulting event**: `event_name = "purchase_completed"`.
- **Field mapping**:
  - `checkout_session.amount_total` → `revenue`.
  - `checkout_session.currency` → `currency`.
  - `checkout_session.customer` → `user_id` и/или `properties.stripe_customer_id`.
  - `checkout_session.id` → `properties.stripe_charge_id` (или связанный `charge_id`, если нужен).
  - `billing_details.address.country` → `country`.

#### 7.2. `invoice.paid` (first payment) → `subscription_started`

- **When**: the first paid invoice for a subscription (subscription has just started).
- **Resulting event**: `event_name = "subscription_started"`.
- **Condition**: `invoice.billing_reason` indicates the first subscription payment (e.g. `subscription_create`).
- **Field mapping**:
  - `invoice.amount_paid` → `revenue`.
  - `invoice.currency` → `currency`.
  - `invoice.subscription` → `properties.stripe_subscription_id`.
  - `invoice.lines[0].plan.id` → `properties.plan_id`.
  - `invoice.customer` → `user_id` и/или `properties.stripe_customer_id`.

#### 7.3. `invoice.paid` (renewal) → `subscription_renewed`

- **When**: a recurring payment for an active subscription.
- **Resulting event**: `event_name = "subscription_renewed"`.
- **Condition**: `invoice.billing_reason = "subscription_cycle"` (or equivalent for auto‑renewals).
- **Field mapping**:
  - Same as for `subscription_started`:
    - `amount_paid` → `revenue`.
    - `currency` → `currency`.
    - `subscription` → `properties.stripe_subscription_id`.
    - `lines[0].plan.id` → `properties.plan_id`.
    - `customer` → `user_id` / `properties.stripe_customer_id`.

-#### 7.4. `charge.refunded` / `charge.refund` → `refund_issued`
+#### 7.4. `charge.refunded` / `charge.refund` → `refund_issued`

- **When**: a refund (full or partial) has been issued for a transaction.
- **Resulting event**: `event_name = "refund_issued"`.
- **Field mapping**:
  - `refund.amount` or `charge.amount_refunded` → `revenue` **with a negative sign**.
  - `currency` → `currency`.
  - `charge` → `properties.stripe_charge_id`.
  - `reason` → `properties.reason`.
  - If needed: `payment_method_details` → additional details in `properties` (payment method type, masked card, etc.).

---

### 8. Links to Supporting Docs

- **Notion**:
  - Event schema table (fields, types, examples).
  - Page describing each metric and its business meaning.
- **Miro**:
  - Data flow diagram:  
    `Stripe / SDK / Publishers → Ingestion → Storage/Warehouse → Aggregation → API → Merchant Admin Panel`.

---

### 9. Promo Codes Analytics (design)

This section defines analytics events related to **influencer / partner promo codes**.  
These events are part of the logical event model; the current dashboard may later consume
aggregated data derived from them.

#### 9.1. Admin actions (Merchant Admin source)

- `promo_code_created` – operator creates a new promo code in Merchant Admin.
  - Source: `merchant_admin`.
  - Key fields:
    - `app_id` – app where the code is valid.
    - `properties.promo_code` – visible code string.
    - `properties.promo_code_id` – internal promo code ID.
    - `properties.campaign_id` – promo campaign / affiliate ID (if any).
    - `properties.discount_type` – `percent` or `fixed_amount`.
    - `properties.discount_value` – configured value.
    - `properties.owner_type` / `properties.owner_id` – influencer/partner/internal.

- `promo_code_activated` / `promo_code_deactivated` – toggle of promo code status.
  - Source: `merchant_admin`.
  - Key fields:
    - `properties.promo_code_id`, `properties.promo_code`, `properties.campaign_id`.
    - `properties.new_status` – `active` or `inactive`.
    - `properties.changed_by` – admin identifier (if available).

#### 9.2. Client usage (Webshop / SDK source)

- `promo_code_applied` – promo code successfully validated and applied to an order.
  - Source: `sdk` / `webshop`.
  - Key fields:
    - `app_id`, `user_id` / `anonymous_id`, `country`, `currency`.
    - `properties.promo_code` – code the user entered.
    - `properties.promo_code_id` – internal ID (if resolved).
    - `properties.campaign_id` – campaign / affiliate ID.
    - `properties.order_amount_before` – order total before discount.
    - `properties.order_amount_after` – order total after discount.
    - `properties.discount_amount` – effective discount applied.
    - `properties.source` – `webshop`, `mobile`, etc.

- `promo_code_rejected` – user entered a code that was not accepted.
  - Source: `sdk` / `webshop`.
  - Key fields:
    - `app_id`, `user_id` / `anonymous_id`, `country`.
    - `properties.promo_code` – code as entered (may contain extra spaces).
    - `properties.rejection_reason` – one of:
      - `invalid_code`
      - `expired`
      - `not_started_yet`
      - `inactive`
      - `redemption_limit_reached`
      - `per_user_limit_reached`
      - `not_compatible_with_other_discounts`.

#### 9.3. Sharing & profile actions

- `promo_code_copied` – user copies their personal promo code from the profile screen.
  - Source: `sdk` / `webshop`.
  - Key fields:
    - `app_id`, `user_id`, `country`.
    - `properties.promo_code` – copied code.
    - `properties.promo_code_id` – internal ID (if personal/assigned).

- `promo_code_shared` – user shares a promo code via a share sheet / link.
  - Source: `sdk` / `webshop`.
  - Key fields:
    - `app_id`, `user_id`, `country`.
    - `properties.promo_code`, `properties.promo_code_id`.
    - `properties.channel` – `link`, `whatsapp`, `telegram`, `twitter`, etc.

> These events align with the existing schema (Sections 2 and 6):  
> `event_name` specifies the logical type, and promo‑specific data is carried in `properties`.  
> Aggregated metrics for promo codes (usage count, revenue, AOV per code/campaign/affiliate)
> can later be exposed via dedicated analytics keys or integrated into existing summaries.

