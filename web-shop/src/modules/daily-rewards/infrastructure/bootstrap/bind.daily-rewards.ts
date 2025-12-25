import type { Container } from 'inversify';
import { DAILY_REWARDS_TYPES } from '../daily-rewards.container';
import { SupabaseDailyRewardRepository } from '../repositories/supabase-daily-reward.repository';
import { CreateDailyRewardUseCase } from '../../application/use-cases/create-daily-reward-use-case.use-case';

export function bindDailyRewards(container: Container): void {
  // Repositories
  container
    .bind(DAILY_REWARDS_TYPES.DailyRewardRepository)
    .to(SupabaseDailyRewardRepository)
    .inSingletonScope();

  // Use Cases
  container
    .bind(DAILY_REWARDS_TYPES.CreateDailyRewardUseCase)
    .to(CreateDailyRewardUseCase);
}
