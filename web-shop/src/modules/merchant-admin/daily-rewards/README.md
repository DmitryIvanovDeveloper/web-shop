# Merchant Admin – Daily Rewards

CRUD and activation flows for daily rewards on the admin side.

## Architecture
- **Domain**: `DailyReward`, VOs (`RewardId`, `RewardType`), errors (already exists, not found, invalid type/data).
- **Application / use-cases**: create, update, delete, activate/deactivate, get by id, list rewards.
- **Ports**: `DailyRewardRepositoryPort`.
- **Infrastructure**: `DailyRewardApiRepository` hitting `/api/merchant-admin/daily-rewards` (GET list/active/by-id, POST create, PUT update, DELETE), logs via `Logger`.
- **Interface adapters**: `DailyRewardsAdminPresenter`, `DailyRewardsPage` (admin React view).
- **DI**: bindings in `infrastructure/bootstrap/bind.daily-rewards.ts` + container in `daily-rewards.container.ts`.

## Data flow
1) UI calls presenter → use case.
2) Use case validates duplicates (by `dayNumber` or title when `dayNumber` is null) and invokes repository.
3) Repository maps DTO ⇄ domain and calls REST; presenter updates view.

## Notes
- Duplicate detection is in use case before save.
- `findAll` supports filters: `status`, `limit`, `offset`, `dayNumber`, `appId`.
- Activation/deactivation handled via dedicated use cases (toggle `isActive`).

