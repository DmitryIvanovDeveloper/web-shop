import type { ClaimId } from '../value-objects/claim-id';
import type { RewardId } from '../value-objects/reward-id';

export class DailyRewardClaim {
  private constructor(
    public readonly id: ClaimId,
    public readonly userId: string,
    public readonly rewardId: RewardId,
    public readonly claimedAt: Date,
    public readonly pointsAwarded: number
  ) {}

  static fromDatabase(
    id: ClaimId,
    userId: string,
    rewardId: RewardId,
    claimedAt: Date,
    pointsAwarded: number
  ): DailyRewardClaim {
    return new DailyRewardClaim(id, userId, rewardId, claimedAt, pointsAwarded);
  }

  static create(
    id: ClaimId,
    userId: string,
    rewardId: RewardId,
    pointsAwarded: number
  ): DailyRewardClaim {
    if (!userId || userId.trim().length === 0) {
      throw new Error('User ID cannot be empty');
    }

    if (pointsAwarded <= 0) {
      throw new Error('Points awarded must be positive');
    }

    return new DailyRewardClaim(id, userId.trim(), rewardId, new Date(), pointsAwarded);
  }

  isFromToday(): boolean {
    const today = new Date();
    const claimDay = new Date(this.claimedAt);
    return today.toDateString() === claimDay.toDateString();
  }
}
