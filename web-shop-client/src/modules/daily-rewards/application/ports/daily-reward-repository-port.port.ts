import { Result } from '../../../../shared/result/result';
import { DailyReward } from '../../domain/entities/daily-reward';

export interface DailyRewardRepositoryPort {
  findActiveReward(appId: string): Promise<Result<DailyReward | null, Error>>;
}
