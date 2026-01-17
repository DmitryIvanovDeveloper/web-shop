# Merchant Admin Modules

Admin-side tooling for operating the shop. Submodules:
- **analytics/realtime-dashboard** — loads metrics from Supabase/API, renders dashboard widgets via presenters and hooks.
- **daily-rewards** — CRUD for daily rewards (app-scoped), activates/deactivates rewards.
- **offers** — manages offer rule trees and scenarios.
- **products** — admin product catalog operations.
- **patch-notes** — manage patch notes entries.
- **projects** — manage project/app metadata.
- **promo-codes** — manage promo codes and their lifecycle.

Common patterns:
- Clean Architecture (domain / application / infrastructure / interface-adapters) with Inversify DI; bindings live in each submodule’s `infrastructure/bootstrap`.
- HTTP repositories talk to `/api/merchant-admin/*` endpoints and map DTOs to domain entities.
- Presenters/view-models drive React admin views; event bus is used where applicable.

