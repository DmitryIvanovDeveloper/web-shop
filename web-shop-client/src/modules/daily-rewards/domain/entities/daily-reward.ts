import type { RewardId } from '../value-objects/reward-id';
import type { RewardType } from '../value-objects/reward-type';

export class DailyReward {
  private constructor(
    public readonly id: RewardId,
    public readonly type: RewardType,
    public readonly title: string,
    public readonly description: string,
    public readonly points: number,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static fromDatabase(
    id: RewardId,
    type: RewardType,
    title: string,
    description: string,
    points: number,
    isActive: boolean,
    createdAt: Date,
    updatedAt: Date
  ): DailyReward {
    return new DailyReward(id, type, title, description, points, isActive, createdAt, updatedAt);
  }

  canBeClaimedBy(userId: string, lastClaimDate?: Date): boolean {
    if (!this.isActive) return false;

    // Check if user already claimed today
    if (lastClaimDate) {
      const today = new Date();
      const lastClaimDay = new Date(lastClaimDate);

      return today.toDateString() !== lastClaimDay.toDateString();
    }

    return true;
  }
}
