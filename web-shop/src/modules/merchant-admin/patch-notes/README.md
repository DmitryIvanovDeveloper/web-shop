# Merchant Admin – Patch Notes

Admin module for managing patch notes entries.

## Architecture
- **Domain**: `PatchNote`, value objects (version/date), errors.
- **Application / use-cases**: list, create, update, publish/archive patch notes.
- **Ports**: patch-notes repository.
- **Infrastructure**: API repository in `infrastructure/repositories`, DI bindings in `infrastructure/bootstrap`.
- **Interface adapters**: presenter + view-model, UI components for patch notes list/editor.

## Data flow
1) UI → presenter → use case → repository (REST to `/api/merchant-admin/patch-notes` or equivalent).
2) Repository maps DTO ⇄ domain, persists in Supabase via API.
3) Presenter updates view-model for admin screens.

## Notes
- Versioning and status (published/draft) handled in use cases; ensure API enforces uniqueness.

