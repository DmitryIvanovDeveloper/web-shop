import { inject, injectable } from 'inversify';
import { Result, Success, Failure } from '../../../../shared/result/result';
import { DAILY_REWARDS_TYPES } from '../../infrastructure/daily-rewards.container';
import type { DailyRewardRepositoryPort } from '../ports/daily-reward-repository.port';
import type { CreateDailyRewardInput, DailyRewardOutput } from '../types/daily-reward.types';
import { DailyReward, RewardId, RewardType } from '../../domain';
import { RewardAlreadyExistsError } from '../../domain';

@injectable()
export class CreateDailyRewardUseCase {
  constructor(
    @inject(DAILY_REWARDS_TYPES.DailyRewardRepository)
    private readonly _dailyRewardRepository: DailyRewardRepositoryPort
  ) {}

  async execute(input: CreateDailyRewardInput): Promise<Result<DailyRewardOutput, Error>> {
    try {
      // Check if reward with this title already exists for this app
      const existingRewards = await this._dailyRewardRepository.findAll({
        appId: input.appId,
        status: 'all'
      });

      if (existingRewards.isSuccess) {
        const duplicate = existingRewards.data.find(
          reward => reward.title.toLowerCase() === input.title.toLowerCase()
        );
        if (duplicate) {
          return Failure.fail(new RewardAlreadyExistsError(duplicate.id.value, input.appId));
        }
      }

      // Generate ID and create reward
      const rewardId = RewardId.create(crypto.randomUUID());
      const rewardType = RewardType.create(input.type);

      const dailyReward = DailyReward.create(
        rewardId,
        input.appId,
        rewardType,
        input.title,
        input.description,
        input.points
      );

      // Save to repository
      const saveResult = await this._dailyRewardRepository.save(dailyReward);
      if (!saveResult.isSuccess) {
        return Failure.fail(saveResult.error);
      }

      return Success.ok(this.mapToOutput(saveResult.data));
    } catch (error) {
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
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
      createdAt: dailyReward.createdAt.toISOString(),
      updatedAt: dailyReward.updatedAt.toISOString()
    };
  }
}
