import { Result } from '../../../../shared/result/result';
import { DailyReward } from '../../domain/entities/daily-reward';

export interface NextRewardResult {
  reward: DailyReward | null;
  canClaim: boolean;
  nextClaimDate: Date | null;
  lastClaimDate: Date | null;
  lastClaimRewardId: string | null;
}

export interface DailyRewardRepositoryPort {
  findActiveReward(appId: string): Promise<Result<DailyReward | null, Error>>;
  findAllRewards(appId: string): Promise<Result<readonly DailyReward[], Error>>;
  findNextRewardAvailability(appId: string, userId: string): Promise<Result<NextRewardResult, Error>>;
}
