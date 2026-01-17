# Daily Rewards (Storefront components)

Lightweight storefront UI components for daily rewards display.

## Contents
- `daily-reward-card.tsx`, `daily-rewards-cards-grid.tsx` — presentational React components.
- `index.ts` — barrel export.

## Usage
- Import components into pages or modules that already provide rewards data and claim logic.
- Grid/card expect props for title/description/points/type/state; no data fetching here.

## Notes
- This module is UI-only (no DI/use-cases/repositories).
- Admin CRUD for rewards lives in `merchant-admin/daily-rewards`; client-side claim flow is elsewhere.

