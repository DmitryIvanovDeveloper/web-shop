# Merchant Admin – Offers

Admin management of offer rule trees and scenarios.

## Architecture
- **Domain**: offer rule trees, scenarios, value objects (catalog), errors (not found/validation).
- **Application / use-cases**: load offer scenarios, sync rule tree, update scenario config, publish changes.
- **Ports**: repositories for rules/scenarios/config, storage for rule tree.
- **Infrastructure**: HTTP repositories calling `/api/merchant-admin/offers/*` endpoints; DI bindings in `infrastructure/bootstrap`.
- **Interface adapters**: presenters + view-model, admin views for scenarios/rules.

## Data flow
1) UI asks presenter → use case fetches scenarios/rules via repository.
2) Edits are applied through update/sync use cases → repository persists to API.
3) Presenter/view-model reflects updated scenarios/rules for admin UI.

## Notes
- Rule tree sync relies on repository to persist the full tree.
- Validation of scenarios/rules is domain-side; API errors are surfaced via use case failures.

