import type { RewardTypeValue } from '../../domain/value-objects/reward-type';

export interface CheckDailyRewardAvailabilityInput {
  userId: string;
  appId: string;
}

export interface ClaimDailyRewardInput {
  userId: string;
  appId: string;
  rewardId?: string;
}

export interface LoadDailyRewardsInput {
  appId: string;
  userId?: string;
}

export interface DailyRewardAvailabilityOutput {
  canClaim: boolean;
  reward: DailyRewardOutput | null;
  nextClaimDate?: Date;
  lastClaimDate?: Date;
  lastClaimRewardId?: string | null;
}

export interface ClaimDailyRewardOutput {
  success: boolean;
  pointsAwarded: number;
  claimId: string;
  message: string;
  nextRewardId?: string | null; // ID следующей награды
  nextClaimDate?: Date | null; // Дата следующего claim'а (завтра в полночь)
}

export interface LoadDailyRewardsOutput {
  rewards: DailyRewardOutput[];
}

export interface DailyRewardOutput {
  id: string;
  type: RewardTypeValue;
  title: string;
  description: string;
  points: number;
  isActive: boolean;
  dayNumber: number | null;
  isClaimedToday?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RewardClaimOutput {
  id: string;
  userId: string;
  rewardId: string;
  claimedAt: string;
  pointsAwarded: number;
}





