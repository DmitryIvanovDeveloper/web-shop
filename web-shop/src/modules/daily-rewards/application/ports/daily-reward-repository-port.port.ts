import { Result } from '../../../../shared/result/result';
import { DailyReward } from '../../domain/entities/daily-reward';
import type { GetDailyRewardsInput } from '../types/daily-reward.types';

export interface DailyRewardRepositoryPort {
  save(dailyReward: DailyReward): Promise<Result<DailyReward, Error>>;
  findById(id: string): Promise<Result<DailyReward, Error>>;
  findAll(input: GetDailyRewardsInput): Promise<Result<DailyReward[], Error>>;
  update(dailyReward: DailyReward): Promise<Result<DailyReward, Error>>;
  delete(id: string): Promise<Result<void, Error>>;
  findActiveReward(appId: string): Promise<Result<DailyReward | null, Error>>;
}
