export class RewardAlreadyClaimedTodayError extends Error {
  constructor(userId: string, lastClaimDate: Date) {
    super(`User '${userId}' has already claimed today's daily reward on ${lastClaimDate.toLocaleDateString()}`);
    this.name = 'RewardAlreadyClaimedTodayError';
  }
}
