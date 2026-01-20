export const DAILY_REWARDS_TYPES = {
  CheckDailyRewardAvailabilityUseCase: Symbol.for('CheckDailyRewardAvailabilityUseCase'),
  ClaimDailyRewardUseCase: Symbol.for('ClaimDailyRewardUseCase'),
  LoadDailyRewardsUseCase: Symbol.for('LoadDailyRewardsUseCase'),
  DailyRewardRepository: Symbol.for('DailyRewardRepository'),
  RewardClaimRepository: Symbol.for('RewardClaimRepository'),
  DailyRewardsPresenter: Symbol.for('DailyRewardsPresenter'),
    LocalizationLoadedEventHandler: Symbol.for('IAsyncEventHandler<LocalizationLoadedEvent>'),
  LocalizationChangedEventHandler: Symbol.for('IAsyncEventHandler<LocalizationChangedEvent>'),
} as const;
