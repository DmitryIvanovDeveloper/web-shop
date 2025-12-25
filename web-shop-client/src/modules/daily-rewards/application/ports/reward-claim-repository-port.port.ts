import { Result } from '../../../../shared/result/result';
import { DailyRewardClaim } from '../../domain/entities/daily-reward-claim';

export interface RewardClaimRepositoryPort {
  save(claim: DailyRewardClaim): Promise<Result<DailyRewardClaim, Error>>;
  findLastClaimByUser(userId: string): Promise<Result<DailyRewardClaim | null, Error>>;
}
