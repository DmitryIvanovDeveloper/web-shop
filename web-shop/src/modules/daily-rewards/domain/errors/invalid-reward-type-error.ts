export class InvalidRewardTypeError extends Error {
  constructor(invalidType: string) {
    super(`Invalid reward type: '${invalidType}'. Must be one of: points, currency, item`);
    this.name = 'InvalidRewardTypeError';
  }
}
