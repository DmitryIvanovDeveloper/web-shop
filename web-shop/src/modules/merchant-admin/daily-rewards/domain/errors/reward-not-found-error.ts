export class RewardNotFoundError extends Error {
  constructor(rewardId: string) {
    super(`Daily reward with ID '${rewardId}' not found`);
    this.name = 'RewardNotFoundError';
  }
}
