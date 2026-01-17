# UI Builder

Config-driven page/template builder for the storefront.

## Architecture
- **Domain**: `AppConfig`, `PageConfig`, `Template`, `UserAppConfig`, VOs (`config-version`, etc.), errors for config/schema.
- **Application / use-cases**: load/save drafts, publish, list pages/templates, create/update/delete page/template, apply user app configs, validate configs, update offer cards.
- **Ports**: storage/repository ports for configs/pages/templates/user app configs, preview communication port, config validator port.
- **Infrastructure**: Supabase storages/repositories, JSON schema validator, postMessage preview adapter; DI bindings in `infrastructure/bootstrap`.
- **Interface adapters**: presenters (`ui-builder`, `page-constructor`, `templates`), rich React UI components (editors, palettes, canvas, preview, modal), pages `UIBuilderPage`.
- **Tests**: template creation use-case tests under `__tests__/templates`.

## Data flow
1) UI interacts with presenters → use cases → storage/repositories (Supabase + schema validation).
2) Drafts/publishes are versioned; validators run before save/publish.
3) Preview communication via postMessage adapter for live preview.

## Notes
- Config validation uses JSON schema; keep schemas in sync with backend.
- ID/version generation utilities in `shared/utils`.
- Ensure access control and appId scoping are enforced at API/storage level.

