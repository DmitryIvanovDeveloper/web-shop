import { inject, injectable } from 'inversify';
import { Result } from '@/shared/result/result';
import { DAILY_REWARDS_TYPES } from '../../infrastructure/bootstrap/daily-rewards.container';
import type { DailyRewardRepositoryPort } from '../ports/daily-reward-repository.port';
import type { GetDailyRewardsInput, DailyRewardOutput } from '../types/daily-reward.types';
import type { DailyReward } from '../../domain/entities/daily-reward';

@injectable()
export class GetDailyRewardsUseCase {
  constructor(
    @inject(DAILY_REWARDS_TYPES.DailyRewardRepository)
    private readonly _dailyRewardRepository: DailyRewardRepositoryPort
  ) {}

  async execute(input: GetDailyRewardsInput): Promise<Result<DailyRewardOutput[], Error>> {
    try {
      const result = await this._dailyRewardRepository.findAll(input);
      if (!result.isSuccess) {
        return Result.fail(result.error || new Error('Failed to find rewards'));
      }

      const rewards = result.value!.map(reward => this.mapToOutput(reward));
      return Result.ok(rewards);
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  private mapToOutput(dailyReward: DailyReward): DailyRewardOutput {
    return {
      id: dailyReward.id.value,
      appId: dailyReward.appId,
      type: dailyReward.type.value,
      title: dailyReward.title,
      description: dailyReward.description,
      points: dailyReward.points,
      isActive: dailyReward.isActive,
      dayNumber: dailyReward.dayNumber,
      createdAt: dailyReward.createdAt.toISOString(),
      updatedAt: dailyReward.updatedAt.toISOString()
    };
  }
}
