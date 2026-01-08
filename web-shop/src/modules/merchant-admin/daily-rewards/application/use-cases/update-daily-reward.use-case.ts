import { inject, injectable } from 'inversify';
import { Result } from '@/shared/result/result';
import { DAILY_REWARDS_TYPES } from '../../infrastructure/bootstrap/daily-rewards.container';
import type { DailyRewardRepositoryPort } from '../ports/daily-reward-repository.port';
import type { UpdateDailyRewardInput, DailyRewardOutput } from '../types/daily-reward.types';
import type { DailyReward } from '../../domain/entities/daily-reward';
import { RewardId } from '../../domain/value-objects/reward-id';
import { RewardType } from '../../domain/value-objects/reward-type';

@injectable()
export class UpdateDailyRewardUseCase {
  constructor(
    @inject(DAILY_REWARDS_TYPES.DailyRewardRepository)
    private readonly _dailyRewardRepository: DailyRewardRepositoryPort
  ) {}

  async execute(input: UpdateDailyRewardInput): Promise<Result<DailyRewardOutput, Error>> {
    try {
      // Find the existing reward
      const findResult = await this._dailyRewardRepository.findById(input.id);
      if (!findResult.isSuccess) {
        return Result.fail(findResult.error || new Error('Failed to find reward'));
      }

      const existingReward = findResult.value!;

      // Create updated reward using the existing reward's methods
      let updatedReward = existingReward;

      if (input.title !== undefined) {
        updatedReward = updatedReward.withTitle(input.title);
      }

      if (input.description !== undefined) {
        updatedReward = updatedReward.withDescription(input.description);
      }

      if (input.points !== undefined) {
        updatedReward = updatedReward.withPoints(input.points);
      }

      if (input.isActive !== undefined) {
        updatedReward = input.isActive ? updatedReward.activate() : updatedReward.deactivate();
      }

      // Save the updated reward
      const saveResult = await this._dailyRewardRepository.save(updatedReward);
      if (!saveResult.isSuccess) {
        return Result.fail(saveResult.error || new Error('Failed to save updated reward'));
      }

      return Result.ok(this.mapToOutput(saveResult.value!));
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
      createdAt: dailyReward.createdAt.toISOString(),
      updatedAt: dailyReward.updatedAt.toISOString()
    };
  }
}
