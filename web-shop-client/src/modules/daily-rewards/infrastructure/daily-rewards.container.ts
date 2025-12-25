// DI bootstrap for daily-rewards
export const DAILY_REWARDS_TYPES = {
  // Repositories
  DailyRewardRepository: Symbol.for('DailyRewardRepository'),
  RewardClaimRepository: Symbol.for('RewardClaimRepository'),

  // Use Cases
  CheckDailyRewardAvailabilityUseCase: Symbol.for('CheckDailyRewardAvailabilityUseCase'),
  ClaimDailyRewardUseCase: Symbol.for('ClaimDailyRewardUseCase'),

  // Presenters
  DailyRewardsPresenter: Symbol.for('DailyRewardsPresenter')
};

export function bindDailyRewards(container: any) {
  // Repositories
  // container.bind(DAILY_REWARDS_TYPES.DailyRewardRepository).to(SupabaseDailyRewardRepository);
  // container.bind(DAILY_REWARDS_TYPES.RewardClaimRepository).to(SupabaseRewardClaimRepository);

  // Use Cases
  // container.bind(DAILY_REWARDS_TYPES.CheckDailyRewardAvailabilityUseCase).to(CheckDailyRewardAvailabilityUseCase);
  // container.bind(DAILY_REWARDS_TYPES.ClaimDailyRewardUseCase).to(ClaimDailyRewardUseCase);

  // Presenters
  // container.bind(DAILY_REWARDS_TYPES.DailyRewardsPresenter).to(DailyRewardsPresenter);
}
