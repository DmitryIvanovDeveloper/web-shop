// DI bootstrap for daily-rewards
export const DAILY_REWARDS_TYPES = {
  // Repositories
  DailyRewardRepository: Symbol.for('DailyRewardRepository'),

  // Use Cases
  CreateDailyRewardUseCase: Symbol.for('CreateDailyRewardUseCase'),
  UpdateDailyRewardUseCase: Symbol.for('UpdateDailyRewardUseCase'),
  DeleteDailyRewardUseCase: Symbol.for('DeleteDailyRewardUseCase'),
  GetDailyRewardsUseCase: Symbol.for('GetDailyRewardsUseCase'),
  GetDailyRewardByIdUseCase: Symbol.for('GetDailyRewardByIdUseCase'),
  ActivateDailyRewardUseCase: Symbol.for('ActivateDailyRewardUseCase'),
  DeactivateDailyRewardUseCase: Symbol.for('DeactivateDailyRewardUseCase'),

  // Presenters
  DailyRewardsAdminPresenter: Symbol.for('DailyRewardsAdminPresenter')
};
