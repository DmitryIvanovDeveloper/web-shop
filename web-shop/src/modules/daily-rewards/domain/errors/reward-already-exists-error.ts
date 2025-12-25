export class RewardAlreadyExistsError extends Error {
  constructor(rewardId: string, appId: string) {
    super(`Daily reward with ID '${rewardId}' already exists for app '${appId}'`);
    this.name = 'RewardAlreadyExistsError';
  }
}
