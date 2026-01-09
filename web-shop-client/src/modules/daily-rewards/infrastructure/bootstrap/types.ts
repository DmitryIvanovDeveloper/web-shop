export const DAILY_REWARDS_TYPES = {
  CheckDailyRewardAvailabilityUseCase: Symbol.for('CheckDailyRewardAvailabilityUseCase'),
  ClaimDailyRewardUseCase: Symbol.for('ClaimDailyRewardUseCase'),
  DailyRewardRepository: Symbol.for('DailyRewardRepository'),
  RewardClaimRepository: Symbol.for('RewardClaimRepository'),
  DailyRewardsPresenter: Symbol.for('DailyRewardsPresenter'),
} as const;
