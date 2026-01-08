import type { Container } from 'inversify';
import { DAILY_REWARDS_TYPES } from './daily-rewards.container';
import { DailyRewardApiRepository } from '../repositories/daily-reward-api.repository';
import { CreateDailyRewardUseCase } from '../../application/use-cases/create-daily-reward.use-case';
import { UpdateDailyRewardUseCase } from '../../application/use-cases/update-daily-reward.use-case';
import { DeleteDailyRewardUseCase } from '../../application/use-cases/delete-daily-reward.use-case';
import { GetDailyRewardsUseCase } from '../../application/use-cases/get-daily-rewards.use-case';
import { GetDailyRewardByIdUseCase } from '../../application/use-cases/get-daily-reward-by-id.use-case';
import { ActivateDailyRewardUseCase } from '../../application/use-cases/activate-daily-reward.use-case';
import { DeactivateDailyRewardUseCase } from '../../application/use-cases/deactivate-daily-reward.use-case';

export function bindDailyRewards(container: Container): void {
  // Repositories
  container
    .bind(DAILY_REWARDS_TYPES.DailyRewardRepository)
    .to(DailyRewardApiRepository)
    .inSingletonScope();

  // Use Cases
  container
    .bind(DAILY_REWARDS_TYPES.CreateDailyRewardUseCase)
    .to(CreateDailyRewardUseCase);

  container
    .bind(DAILY_REWARDS_TYPES.UpdateDailyRewardUseCase)
    .to(UpdateDailyRewardUseCase);

  container
    .bind(DAILY_REWARDS_TYPES.DeleteDailyRewardUseCase)
    .to(DeleteDailyRewardUseCase);

  container
    .bind(DAILY_REWARDS_TYPES.GetDailyRewardsUseCase)
    .to(GetDailyRewardsUseCase);

  container
    .bind(DAILY_REWARDS_TYPES.GetDailyRewardByIdUseCase)
    .to(GetDailyRewardByIdUseCase);

  container
    .bind(DAILY_REWARDS_TYPES.ActivateDailyRewardUseCase)
    .to(ActivateDailyRewardUseCase);

  container
    .bind(DAILY_REWARDS_TYPES.DeactivateDailyRewardUseCase)
    .to(DeactivateDailyRewardUseCase);
}
