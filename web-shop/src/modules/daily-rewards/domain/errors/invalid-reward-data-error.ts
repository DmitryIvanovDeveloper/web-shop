export class InvalidRewardDataError extends Error {
  constructor(field: string, reason: string) {
    super(`Invalid reward data for field '${field}': ${reason}`);
    this.name = 'InvalidRewardDataError';
  }
}
