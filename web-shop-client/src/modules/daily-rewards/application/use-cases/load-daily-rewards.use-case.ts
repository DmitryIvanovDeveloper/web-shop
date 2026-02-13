import { inject, injectable } from 'inversify';
import { Result } from '../../../../shared/result/result';
import { DAILY_REWARDS_TYPES } from '../../infrastructure/bootstrap/types';
import type { DailyRewardRepositoryPort } from '../ports/daily-reward-repository.port';
import type { LoadDailyRewardsInput, LoadDailyRewardsOutput, DailyRewardOutput } from '../types/daily-reward.types';

@injectable()
export class LoadDailyRewardsUseCase {
  constructor(
    @inject(DAILY_REWARDS_TYPES.DailyRewardRepository)
    private readonly _dailyRewardRepository: DailyRewardRepositoryPort
  ) {}

  async execute(input: LoadDailyRewardsInput): Promise<Result<LoadDailyRewardsOutput, Error>> {
    try {
                        const rewardsResult = await this._dailyRewardRepository.findAllRewards(input.appId);
      console.log('[LoadDailyRewardsUseCase] Repository result:', { success: rewardsResult.isSuccess });

      if (rewardsResult.isFailure) {
                return Result.error(rewardsResult.error || new Error('Failed to load daily rewards'));
      }

      const rewards = rewardsResult.value!;
      const output: LoadDailyRewardsOutput = {
        rewards: rewards.map(reward => this.mapRewardToOutput(reward))
      };

      return Result.ok(output);
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  private mapRewardToOutput(reward: any): DailyRewardOutput {
    return {
      id: reward.id.value,
      type: reward.type.value,
      title: reward.title,
      description: reward.description,
      points: reward.points,
      isActive: reward.isActive,
      dayNumber: reward.dayNumber ?? null,
      createdAt: reward.createdAt.toISOString(),
      updatedAt: reward.updatedAt.toISOString()
    };
  }
}
