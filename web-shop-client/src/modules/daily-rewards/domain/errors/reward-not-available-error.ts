export class RewardNotAvailableError extends Error {
  constructor(rewardId?: string) {
    const message = rewardId
      ? `Daily reward with ID '${rewardId}' is not available`
      : 'No daily reward is currently available';
    super(message);
    this.name = 'RewardNotAvailableError';
  }
}
