import type { RewardTypeValue } from '../../domain/value-objects/reward-type';

export interface CheckDailyRewardAvailabilityInput {
  userId: string;
  appId: string;
}

export interface ClaimDailyRewardInput {
  userId: string;
  appId: string;
}

export interface DailyRewardAvailabilityOutput {
  canClaim: boolean;
  reward: DailyRewardOutput | null;
  nextClaimDate?: Date;
  lastClaimDate?: Date;
}

export interface ClaimDailyRewardOutput {
  success: boolean;
  pointsAwarded: number;
  claimId: string;
  message: string;
}

export interface DailyRewardOutput {
  id: string;
  type: RewardTypeValue;
  title: string;
  description: string;
  points: number;
  isActive: boolean;
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




