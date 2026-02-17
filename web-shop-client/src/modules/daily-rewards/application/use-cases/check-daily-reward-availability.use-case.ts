import { inject, injectable } from 'inversify';
import { Result } from '../../../../shared/result/result';
import { DAILY_REWARDS_TYPES } from '../../infrastructure/bootstrap/types';
import type { DailyRewardRepositoryPort } from '../ports/daily-reward-repository.port';
import type { CheckDailyRewardAvailabilityInput, DailyRewardAvailabilityOutput } from '../types/daily-reward.types';

@injectable()
export class CheckDailyRewardAvailabilityUseCase {
  constructor(
    @inject(DAILY_REWARDS_TYPES.DailyRewardRepository)
    private readonly _dailyRewardRepository: DailyRewardRepositoryPort
  ) {}

  async execute(input: CheckDailyRewardAvailabilityInput): Promise<Result<DailyRewardAvailabilityOutput, Error>> {
    try {
                  const nextRewardResult = await this._dailyRewardRepository.findNextRewardAvailability(input.appId, input.userId);
      if (nextRewardResult.isFailure) {
                return Result.error(nextRewardResult.error || new Error('Failed to check reward availability'));
      }

      const availability = nextRewardResult.value!;

      const output: DailyRewardAvailabilityOutput = {
        canClaim: availability.canClaim,
        reward: availability.reward ? this.mapRewardToOutput(availability.reward) : null,
        lastClaimDate: availability.lastClaimDate,
        lastClaimRewardId: availability.lastClaimRewardId,
        nextClaimDate: availability.nextClaimDate
      };

            return Result.ok(output);
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  private mapRewardToOutput(reward: any): any {
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
