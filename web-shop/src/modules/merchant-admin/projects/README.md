# Merchant Admin – Projects

Admin module for managing projects/apps metadata and related configs.

## Architecture
- **Domain**: project entity, value objects (ids/version), events.
- **Application / use-cases**: create/update projects, list/fetch details, publish/clone configs.
- **Ports**: project repository.
- **Infrastructure**: API repository in `infrastructure/repositories`, DI bindings in `infrastructure/bootstrap`.
- **Interface adapters**: presenter + view-model, admin views for project list/details.

## Data flow
1) UI → presenter → use case → repository (REST to `/api/merchant-admin/projects` or equivalent).
2) Repository maps DTO ⇄ domain and persists.
3) Presenter updates view-model for admin pages.

## Notes
- Ensure appId scoping is enforced at API level.
- EventBus not used here; flows are request/response.

