import { inject, injectable } from 'inversify';
import { Result, Success, Failure, isFailure } from '../../../../shared/result/result';
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
      console.log('[LoadDailyRewardsUseCase] Executing', { appId: input.appId });

      // Get all rewards for the app
      console.log('[LoadDailyRewardsUseCase] Calling repository.findAllRewards');
      const rewardsResult = await this._dailyRewardRepository.findAllRewards(input.appId);
      console.log('[LoadDailyRewardsUseCase] Repository result:', { success: !isFailure(rewardsResult) });

      if (isFailure(rewardsResult)) {
        console.error('[LoadDailyRewardsUseCase] Repository failed:', rewardsResult.error);
        return Failure.fail(rewardsResult.error);
      }

      const rewards = rewardsResult.data;
      const output: LoadDailyRewardsOutput = {
        rewards: rewards.map(reward => this.mapRewardToOutput(reward))
      };

      return Success.ok(output);
    } catch (error) {
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
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
      createdAt: reward.createdAt.toISOString(),
      updatedAt: reward.updatedAt.toISOString()
    };
  }
}
