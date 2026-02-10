import { inject, injectable } from 'inversify';
import { Result } from '@/shared/result/result';
// Import types would be needed here, but since this is a client-side module, we'll use simplified types

interface CheckDailyRewardAvailabilityInput {
  userId: string;
  appId: string;
}

interface CheckDailyRewardAvailabilityOutput {
  canClaim: boolean;
  reward: DailyRewardOutput | null;
  lastClaimDate: Date | undefined;
  lastClaimRewardId: string | undefined;
  nextClaimDate: Date | undefined;
}

interface DailyRewardOutput {
  id: string;
  appId: string;
  type: string;
  title: string;
  description: string;
  points: number;
  isActive: boolean;
  dayNumber: number | null;
  createdAt: string;
  updatedAt: string;
}

interface AvailabilityData {
  canClaim: boolean;
  reward: DailyRewardOutput | null;
  lastClaimDate: Date | null;
  lastClaimRewardId: string | null;
  nextClaimDate: Date | null;
}

@injectable()
export class CheckDailyRewardAvailabilityUseCase {
  // This would normally inject a repository, but for now we'll create a simple implementation

  async execute(input: CheckDailyRewardAvailabilityInput): Promise<Result<CheckDailyRewardAvailabilityOutput, Error>> {
    try {
      // Mock implementation - in real app this would call repository
      const availability: AvailabilityData = {
        canClaim: true,
        reward: null,
        lastClaimDate: null,
        lastClaimRewardId: null,
        nextClaimDate: null
      };

      return Result.ok({
        canClaim: availability.canClaim,
        reward: availability.reward ? this.mapRewardToOutput(availability.reward) : null,
        lastClaimDate: availability.lastClaimDate || undefined,
        lastClaimRewardId: availability.lastClaimRewardId || undefined,
        nextClaimDate: availability.nextClaimDate || undefined
      });
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  private mapRewardToOutput(reward: DailyRewardOutput): DailyRewardOutput {
    return {
      id: reward.id,
      appId: reward.appId,
      type: reward.type,
      title: reward.title,
      description: reward.description,
      points: reward.points,
      isActive: reward.isActive,
      dayNumber: reward.dayNumber,
      createdAt: reward.createdAt,
      updatedAt: reward.updatedAt
    };
  }
}