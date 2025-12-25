import type { RewardId } from '../value-objects/reward-id';

export class DailyRewardActivatedEvent {
  constructor(
    public readonly rewardId: RewardId,
    public readonly appId: string,
    public readonly occurredAt: Date = new Date()
  ) {}
}
