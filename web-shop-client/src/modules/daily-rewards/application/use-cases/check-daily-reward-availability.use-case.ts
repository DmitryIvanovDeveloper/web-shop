import { inject, injectable } from 'inversify';
import { Result, Success, Failure, isFailure } from '../../../../shared/result/result';
import { DAILY_REWARDS_TYPES } from '../../infrastructure/bootstrap/types';
import type { DailyRewardRepositoryPort } from '../ports/daily-reward-repository.port';
import type { RewardClaimRepositoryPort } from '../ports/reward-claim-repository.port';
import type { CheckDailyRewardAvailabilityInput, DailyRewardAvailabilityOutput } from '../types/daily-reward.types';
import { RewardNotAvailableError } from '../../domain';

@injectable()
export class CheckDailyRewardAvailabilityUseCase {
  constructor(
    @inject(DAILY_REWARDS_TYPES.DailyRewardRepository)
    private readonly _dailyRewardRepository: DailyRewardRepositoryPort,
    @inject(DAILY_REWARDS_TYPES.RewardClaimRepository)
    private readonly _rewardClaimRepository: RewardClaimRepositoryPort
  ) {}

  async execute(input: CheckDailyRewardAvailabilityInput): Promise<Result<DailyRewardAvailabilityOutput, Error>> {
    try {
      console.log('[CheckDailyRewardAvailabilityUseCase] Executing', { appId: input.appId, userId: input.userId });

      // Get all rewards to find the next one based on day_number
      const allRewardsResult = await this._dailyRewardRepository.findAllRewards(input.appId);
      if (isFailure(allRewardsResult)) {
        console.error('[CheckDailyRewardAvailabilityUseCase] Failed to get all rewards:', allRewardsResult.error);
        return Failure.fail(allRewardsResult.error);
      }

      const allRewards = allRewardsResult.data;
      if (!allRewards || allRewards.length === 0) {
        return Failure.fail(new RewardNotAvailableError());
      }

      // Get last claim by user to determine next reward
      const lastClaimResult = await this._rewardClaimRepository.findLastClaimByUser(input.userId);
      if (isFailure(lastClaimResult)) {
        return Failure.fail(lastClaimResult.error);
      }

      const lastClaim = lastClaimResult.data;
      
      // Determine next day_number
      let nextDayNumber: number;
      if (!lastClaim) {
        // No claims yet, start with DAY 1
        nextDayNumber = 1;
        console.log('[CheckDailyRewardAvailabilityUseCase] No last claim, starting with day_number:', nextDayNumber);
      } else {
        // Find the reward that was claimed
        const lastClaimedReward = allRewards.find(r => r.id.value === lastClaim.rewardId.value);
        console.log('[CheckDailyRewardAvailabilityUseCase] Last claim found', {
          lastClaimRewardId: lastClaim.rewardId.value,
          lastClaimedReward: lastClaimedReward ? {
            id: lastClaimedReward.id.value,
            dayNumber: lastClaimedReward.dayNumber
          } : null
        });
        
        if (!lastClaimedReward || lastClaimedReward.dayNumber === null) {
          // If last claimed reward doesn't have day_number, start from DAY 1
          nextDayNumber = 1;
          console.log('[CheckDailyRewardAvailabilityUseCase] Last claimed reward has no day_number, starting from DAY 1');
        } else {
          // Next reward is the day after the last claimed one
          nextDayNumber = lastClaimedReward.dayNumber + 1;
          console.log('[CheckDailyRewardAvailabilityUseCase] Next day_number calculated:', nextDayNumber);
        }
      }

      // Find the reward with the next day_number
      const nextReward = allRewards.find(r => r.dayNumber === nextDayNumber);
      console.log('[CheckDailyRewardAvailabilityUseCase] Looking for reward with day_number:', nextDayNumber, {
        found: !!nextReward,
        rewardId: nextReward?.id.value,
        allRewardsDayNumbers: allRewards.map(r => ({ id: r.id.value, dayNumber: r.dayNumber })).slice(0, 10)
      });
      
      if (!nextReward) {
        // No reward found for next day - return success with null reward
        console.warn('[CheckDailyRewardAvailabilityUseCase] No reward found for day_number:', nextDayNumber);
        return Success.ok({
          canClaim: false,
          reward: null,
          lastClaimDate: lastClaim?.claimedAt,
          lastClaimRewardId: lastClaim?.rewardId.value ?? null
        });
      }

      // Check if user already claimed today
      const canClaim = nextReward.canBeClaimedBy(input.userId, lastClaim?.claimedAt);

      const output: DailyRewardAvailabilityOutput = {
        canClaim,
        reward: this.mapRewardToOutput(nextReward),
        lastClaimDate: lastClaim?.claimedAt,
        lastClaimRewardId: lastClaim?.rewardId.value ?? null
      };

      if (!canClaim && lastClaim) {
        // Calculate next claim date (tomorrow at midnight)
        const nextClaimDate = new Date(lastClaim.claimedAt);
        nextClaimDate.setDate(nextClaimDate.getDate() + 1);
        nextClaimDate.setHours(0, 0, 0, 0);
        output.nextClaimDate = nextClaimDate;
      }

      return Success.ok(output);
    } catch (error) {
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
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
