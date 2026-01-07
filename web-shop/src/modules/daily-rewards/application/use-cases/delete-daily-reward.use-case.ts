import { inject, injectable } from 'inversify';
import { Result } from '../../../../shared/result/result';
import { DAILY_REWARDS_TYPES } from '../../infrastructure/daily-rewards.container';
import type { DailyRewardRepositoryPort } from '../ports/daily-reward-repository.port';
import type { DeleteDailyRewardInput } from '../types/daily-reward.types';

@injectable()
export class DeleteDailyRewardUseCase {
  constructor(
    @inject(DAILY_REWARDS_TYPES.DailyRewardRepository)
    private readonly _dailyRewardRepository: DailyRewardRepositoryPort
  ) {}

  async execute(input: DeleteDailyRewardInput): Promise<Result<void, Error>> {
    try {
      const result = await this._dailyRewardRepository.delete(input.id);
      if (!result.isSuccess) {
        return Result.fail(result.error || new Error('Failed to delete reward'));
      }
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }
}
