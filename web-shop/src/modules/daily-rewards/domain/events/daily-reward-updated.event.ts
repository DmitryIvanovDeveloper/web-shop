import type { RewardId } from '../value-objects/reward-id';

export class DailyRewardUpdatedEvent {
  constructor(
    public readonly rewardId: RewardId,
    public readonly appId: string,
    public readonly changes: Record<string, any>,
    public readonly occurredAt: Date = new Date()
  ) {}
}
