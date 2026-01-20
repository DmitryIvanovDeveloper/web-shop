import { inject, injectable } from 'inversify';
import { Result } from '@/shared/result/result';
import { DAILY_REWARDS_TYPES } from '../../infrastructure/bootstrap/daily-rewards.container';
import type { DailyRewardRepositoryPort } from '../ports/daily-reward-repository.port';
import type { ActivateDailyRewardInput, DailyRewardOutput } from '../types/daily-reward.types';
import type { DailyReward } from '../../domain/entities/daily-reward';

@injectable()
export class ActivateDailyRewardUseCase {
  constructor(
    @inject(DAILY_REWARDS_TYPES.DailyRewardRepository)
    private readonly _dailyRewardRepository: DailyRewardRepositoryPort
  ) {}

  async execute(input: ActivateDailyRewardInput): Promise<Result<DailyRewardOutput, Error>> {
    try {
      
      const findResult = await this._dailyRewardRepository.findById(input.id);
      if (!findResult.isSuccess) {
        return Result.fail(findResult.error || new Error('Failed to find reward'));
      }

      const reward = findResult.value!;
      if (!reward.isActive) {
        
        const activatedReward = reward.activate();

        const saveResult = await this._dailyRewardRepository.save(activatedReward);
        if (!saveResult.isSuccess) {
          return Result.fail(saveResult.error || new Error('Failed to save activated reward'));
        }

        return Result.ok(this.mapToOutput(saveResult.value!));
      }

      return Result.ok(this.mapToOutput(reward));
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
