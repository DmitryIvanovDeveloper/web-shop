import type { Container } from 'inversify';
import { DAILY_REWARDS_TYPES } from '../daily-rewards.container';
import { SupabaseDailyRewardRepository } from '../repositories/supabase-daily-reward.repository';
import { SupabaseRewardClaimRepository } from '../repositories/supabase-reward-claim.repository';
import { CheckDailyRewardAvailabilityUseCase } from '../../application/use-cases/check-daily-reward-availability-use-case.use-case';
import { ClaimDailyRewardUseCase } from '../../application/use-cases/claim-daily-reward-use-case.use-case';
import { DailyRewardsPresenter } from '../../interface-adapters/presenters/daily-rewards-presenter';

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

  // Presenters
  container
    .bind(DAILY_REWARDS_TYPES.DailyRewardsPresenter)
    .to(DailyRewardsPresenter);
}
