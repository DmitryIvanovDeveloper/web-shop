# Daily Rewards Module

Responsible for fetching, showing, and claiming daily rewards. Built with Clean Architecture (Domain → Application → Interface Adapters → Infrastructure) and wired through DI (`DAILY_REWARDS_TYPES`, `ROOT_TYPES`).

## Architecture
- **Domain**: `DailyReward`, `DailyRewardClaim`, value objects (`RewardId`, `RewardType`, `ClaimId`), errors (`RewardAlreadyClaimedTodayError`, `RewardNotAvailableError`).
- **Application / ports**: `DailyRewardRepositoryPort` (findAll, findActive, findNextRewardAvailability), `RewardClaimRepositoryPort` (save, findLastClaimByUser).
- **Application / use-cases**: `LoadDailyRewardsUseCase`, `CheckDailyRewardAvailabilityUseCase`, `ClaimDailyRewardUseCase` (determines next reward by `dayNumber` when `rewardId` not provided).
- **Infrastructure / repositories**:
  - `SupabaseDailyRewardRepository` → HTTP GET `/api/daily-rewards?appId=...`, `/api/daily-rewards/next?appId=...&userId=...`, `/api/daily-rewards/active?appId=...`
  - `SupabaseRewardClaimRepository` → POST `/api/daily-rewards/claim`, GET `/api/daily-rewards/claims/last?userId=...` (handles browser vs SSR base URL)
- **Interface Adapters / presenter**: `DailyRewardsPresenter` maps domain → view models, enriches active/claimed status, sets countdown to `nextClaimDate`, localizes labels.
- **Interface Adapters / UI**:
  - `DailyRewards` — single-card view with claim button and timer; `appId` comes from `useAppId`, requires `userId`.
  - `DailyRewardsPopup` — popup grid of active rewards with auto-show; currently imports `DailyRewardsListPresenter` (not present in code). Replace with an existing presenter or add the missing one.
  - `DailyRewardsCardsGrid`, `DailyRewardCard`, `DailyRewardCardSkeleton` — render sorted rewards, show skeleton on first load.
- **Bootstrap**: `infrastructure/bootstrap/bind.daily-rewards.ts` binds repositories, use-cases, presenter, localization handlers.

## Data flows
1) **Load**: UI → `DailyRewardsPresenter.loadRewards({ appId, userId? })` → `LoadDailyRewardsUseCase` → GET `/api/daily-rewards` → map to view models.
2) **Availability**: `CheckDailyRewardAvailabilityUseCase` → GET `/api/daily-rewards/next` → marks active reward, sets `nextClaimDate`, `isClaimedToday`.
3) **Claim**: UI → `DailyRewardsPresenter.claimReward({ userId, appId, rewardId? })` → `ClaimDailyRewardUseCase` → prevents double-claim per day using last claim check → POST `/api/daily-rewards/claim` → returns `nextRewardId` / `nextClaimDate` (tomorrow 00:00) → reloads rewards. If `rewardId` is missing, uses `dayNumber` sequencing (starts from day 1 for new users).

## API endpoints used by this module
- `GET /api/daily-rewards?appId={appId}`
- `GET /api/daily-rewards/next?appId={appId}&userId={userId}`
- `GET /api/daily-rewards/active?appId={appId}`
- `POST /api/daily-rewards/claim`
- `GET /api/daily-rewards/claims/last?userId={userId}`

## Usage (React + DI)
```tsx
const presenter = container.get<DailyRewardsPresenter>(DAILY_REWARDS_TYPES.DailyRewardsPresenter);
presenter.subscribe(() => forceUpdate());

await presenter.loadRewards({ appId, userId });
await presenter.claimReward({ appId, userId }); // rewardId is optional; picked from availability
```

## Known gaps / TODO
- `DailyRewardsPopup` references `DailyRewardsListPresenter` which does not exist; swap to the existing presenter or add the missing class + binding.
- Error handling for “already claimed” is text/name based; consider explicit error codes.
- If `dayNumber` is null, next reward falls back to the first reward; ensure backend provides `day_number` for deterministic sequencing.
