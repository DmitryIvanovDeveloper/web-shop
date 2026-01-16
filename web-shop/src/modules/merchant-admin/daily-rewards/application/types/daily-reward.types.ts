import type { RewardTypeValue } from '../../domain/value-objects/reward-type';

export interface CreateDailyRewardInput {
  appId: string;
  type: RewardTypeValue;
  title: string;
  description: string;
  points: number;
  dayNumber?: number | null;
}

export interface UpdateDailyRewardInput {
  id: string;
  title?: string;
  description?: string;
  points?: number;
  isActive?: boolean;
  dayNumber?: number | null;
}

export interface DeleteDailyRewardInput {
  id: string;
}

export interface GetDailyRewardsInput {
  appId: string;
  status?: 'active' | 'inactive' | 'all';
  limit?: number;
  offset?: number;
  dayNumber?: number | null;
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
  dayNumber: number | null;
  createdAt: string;
  updatedAt: string;
}





