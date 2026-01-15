import type { Container } from 'inversify';
import { DAILY_REWARDS_TYPES } from './types';
import { SupabaseDailyRewardRepository } from '../repositories/supabase-daily-reward.repository';
import { SupabaseRewardClaimRepository } from '../repositories/supabase-reward-claim.repository';
import { CheckDailyRewardAvailabilityUseCase } from '../../application/use-cases/check-daily-reward-availability.use-case';
import { ClaimDailyRewardUseCase } from '../../application/use-cases/claim-daily-reward.use-case';
import { LoadDailyRewardsUseCase } from '../../application/use-cases/load-daily-rewards.use-case';
import { DailyRewardsPresenter } from '../../interface-adapters/presenters/daily-rewards-presenter';
import { DailyRewardsListPresenter } from '../../interface-adapters/presenters/daily-rewards-list.presenter';

export function bindDailyRewards(container: Container): void {
  // Repositories
  container
    .bind(DAILY_REWARDS_TYPES.DailyRewardRepository)
    .to(SupabaseDailyRewardRepository)
    .inSingletonScope();

  container
    .bind(DAILY_REWARDS_TYPES.RewardClaimRepository)
    .to(SupabaseRewardClaimRepository)
    .inSingletonScope();

  // Use Cases
  container
    .bind(DAILY_REWARDS_TYPES.CheckDailyRewardAvailabilityUseCase)
    .to(CheckDailyRewardAvailabilityUseCase);

  container
    .bind(DAILY_REWARDS_TYPES.ClaimDailyRewardUseCase)
    .to(ClaimDailyRewardUseCase);

  container
    .bind(DAILY_REWARDS_TYPES.LoadDailyRewardsUseCase)
    .to(LoadDailyRewardsUseCase);

  // Presenters
  container
    .bind(DAILY_REWARDS_TYPES.DailyRewardsPresenter)
    .to(DailyRewardsPresenter);

  container
    .bind(DAILY_REWARDS_TYPES.DailyRewardsListPresenter)
    .to(DailyRewardsListPresenter);
}




