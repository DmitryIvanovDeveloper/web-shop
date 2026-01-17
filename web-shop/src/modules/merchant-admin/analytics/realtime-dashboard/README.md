# Merchant Admin – Realtime Analytics Dashboard

Dashboard for merchant analytics (revenue, sales, geography, transactions, etc.).

## Architecture
- **Domain**: metric entities/VOs per dashboard widget, errors, types.
- **Application / use-cases**: load metric series, load tables, refresh panels; ports for repositories/services feeding data.
- **Ports**: repositories for metrics, charts, transactions, cohorts, geography.
- **Infrastructure**: API/Supabase repositories in `infrastructure/repositories`, services (formatting/aggregation), DI bindings in `infrastructure/bootstrap`.
- **Interface adapters**: presenters/hooks (`useRealtimeDashboard`), formatters, React views/components under `interface-adapters/ui/views`.
- **Tests**: extensive unit/integration/data-flow coverage in `__tests__`.

## Data flow
1) UI view → presenter/hook → use cases fetch data via repositories.
2) Repositories hit analytics endpoints (e.g., `/api/merchant-admin/analytics/*`) or Supabase views.
3) Presenter formats data (formatters) → view-model → dashboard widgets.

## Notes
- Data sources are request/response; no live websocket streaming here.
- Keep API filters (date ranges, segments) consistent with repository contract.
- Tests cover real-data flows; run before changing DTOs/endpoints.

