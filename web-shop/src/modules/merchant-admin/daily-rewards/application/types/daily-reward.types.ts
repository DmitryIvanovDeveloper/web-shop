import type { RewardTypeValue } from '../../domain/value-objects/reward-type';

export interface CreateDailyRewardInput {
  appId: string;
  type: RewardTypeValue;
  title: string;
  description: string;
  points: number;
}

export interface UpdateDailyRewardInput {
  id: string;
  title?: string;
  description?: string;
  points?: number;
  isActive?: boolean;
}

export interface DeleteDailyRewardInput {
  id: string;
}

export interface GetDailyRewardsInput {
  appId: string;
  status?: 'active' | 'inactive' | 'all';
  limit?: number;
  offset?: number;
}

export interface GetDailyRewardByIdInput {
  id: string;
}

export interface ActivateDailyRewardInput {
  id: string;
}

export interface DeactivateDailyRewardInput {
  id: string;
}

export interface DailyRewardOutput {
  id: string;
  appId: string;
  type: RewardTypeValue;
  title: string;
  description: string;
  points: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}





