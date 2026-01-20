import { inject, injectable } from 'inversify';
import { Result } from '@/shared/result/result';
import { DailyReward, RewardId, RewardType } from '../../domain';
import type { DailyRewardRepositoryPort } from '../../application/ports/daily-reward-repository.port';
import type { GetDailyRewardsInput } from '../../application/types/daily-reward.types';
import type { HttpClient } from '@/application/ports/http-client.port';
import type { Logger } from '@/application/ports/logger.port';
import { TYPES } from '@/infrastructure/bootstrap/types';

interface DailyRewardDto {
  id: string;
  app_id: string;
  type: string;
  title: string;
  description: string;
  points: number;
  is_active: boolean;
  day_number: number | null;
  created_at: string;
  updated_at: string;
}

interface DailyRewardsApiResponse {
  rewards: DailyRewardDto[];
}

interface DailyRewardApiResponse {
  reward: DailyRewardDto;
}

interface CreateDailyRewardRequest {
  appId: string;
  type: string;
  title: string;
  description: string;
  points: number;
  dayNumber?: number | null;
}

interface UpdateDailyRewardRequest {
  id: string;
  title?: string;
  description?: string;
  points?: number;
  isActive?: boolean;
  dayNumber?: number | null;
}

const mapDtoToDomain = (dto: DailyRewardDto): Result<DailyReward, Error> => {
  try {
    return Result.ok(DailyReward.fromDatabase(
      RewardId.fromString(dto.id),
      dto.app_id,
      RewardType.fromString(dto.type),
      dto.title,
      dto.description,
      dto.points,
      dto.is_active,
      dto.day_number ?? null,
      new Date(dto.created_at),
      new Date(dto.updated_at)
    ));
  } catch (error) {
    return Result.fail(error instanceof Error ? error : new Error('Unknown mapping error'));
  }
};

const mapDomainToDto = (reward: DailyReward): DailyRewardDto => ({
  id: reward.id.value,
  app_id: reward.appId,
  type: reward.type.value,
  title: reward.title,
  description: reward.description,
  points: reward.points,
  is_active: reward.isActive,
  day_number: reward.dayNumber,
  created_at: reward.createdAt.toISOString(),
  updated_at: reward.updatedAt.toISOString(),
});

@injectable()
export class DailyRewardApiRepository implements DailyRewardRepositoryPort {
  constructor(
    @inject(TYPES.HttpClient)
    private readonly httpClient: HttpClient,
    @inject(TYPES.Logger)
    private readonly logger: Logger
  ) {}

  async save(dailyReward: DailyReward): Promise<Result<DailyReward, Error>> {
    try {
            const requestData: CreateDailyRewardRequest = {
        appId: dailyReward.appId,
        type: dailyReward.type.value,
        title: dailyReward.title,
        description: dailyReward.description,
        points: dailyReward.points,
        dayNumber: dailyReward.dayNumber,
      };

      const response = await this.httpClient.post<DailyRewardApiResponse>(
        '/api/merchant-admin/daily-rewards',
        requestData
      );

      if (response.status !== 201 && response.status !== 200) {
                return Result.fail(new Error(`Failed to save daily reward: ${response.statusText}`));
      }

      if (!response.data?.reward) {
        return Result.fail(new Error('Invalid response format from API'));
      }

      const mappingResult = mapDtoToDomain(response.data.reward);
      if (mappingResult.isFailure) {
        return Result.fail(mappingResult.error!);
      }

            return Result.ok(mappingResult.value!);
    } catch (error) {
            return Result.fail(error instanceof Error ? error : new Error('Unknown save error'));
    }
  }

  async findById(id: string): Promise<Result<DailyReward, Error>> {
    try {
            const response = await this.httpClient.get<DailyRewardApiResponse>(
        `/api/merchant-admin/daily-rewards/${id}`
      );

      if (response.status !== 200) {
        if (response.status === 404) {
                    return Result.fail(new Error('Daily reward not found'));
        }
                return Result.fail(new Error(`Failed to find daily reward: ${response.statusText}`));
      }

      if (!response.data?.reward) {
        return Result.fail(new Error('Invalid response format from API'));
      }

      const mappingResult = mapDtoToDomain(response.data.reward);
      if (mappingResult.isFailure) {
        return Result.fail(mappingResult.error!);
      }

            return Result.ok(mappingResult.value!);
    } catch (error) {
            return Result.fail(error instanceof Error ? error : new Error('Unknown find error'));
    }
  }

  async findAll(input: GetDailyRewardsInput): Promise<Result<DailyReward[], Error>> {
    try {
            const params = new URLSearchParams({
        appId: input.appId,
        ...(input.status && { status: input.status }),
        ...(input.limit && { limit: input.limit.toString() }),
        ...(input.offset && { offset: input.offset.toString() }),
        ...(input.dayNumber !== undefined && input.dayNumber !== null && { dayNumber: input.dayNumber.toString() }),
      });

      const url = `/api/merchant-admin/daily-rewards?${params.toString()}`;

      const response = await this.httpClient.get<DailyRewardsApiResponse>(url);

      if (response.status !== 200) {
                return Result.fail(new Error(`Failed to find daily rewards: ${response.statusText}`));
      }

      if (!response.data?.rewards) {
                return Result.ok([]);
      }

      const rewards: DailyReward[] = [];
      for (const dto of response.data.rewards) {
        const mappingResult = mapDtoToDomain(dto);
        if (mappingResult.isFailure) {
                    continue;
        }
        rewards.push(mappingResult.value!);
      }

      return Result.ok(rewards);
    } catch (error) {
            return Result.fail(error instanceof Error ? error : new Error('Unknown findAll error'));
    }
  }

  async update(dailyReward: DailyReward): Promise<Result<DailyReward, Error>> {
    try {
            const requestData: UpdateDailyRewardRequest = {
        id: dailyReward.id.value,
        title: dailyReward.title,
        description: dailyReward.description,
        points: dailyReward.points,
        isActive: dailyReward.isActive,
        dayNumber: dailyReward.dayNumber,
      };

      const response = await this.httpClient.put<DailyRewardApiResponse>(
        `/api/merchant-admin/daily-rewards/${dailyReward.id.value}`,
        requestData
      );

      if (response.status !== 200) {
                return Result.fail(new Error(`Failed to update daily reward: ${response.statusText}`));
      }

      if (!response.data?.reward) {
        return Result.fail(new Error('Invalid response format from API'));
      }

      const mappingResult = mapDtoToDomain(response.data.reward);
      if (mappingResult.isFailure) {
        return Result.fail(mappingResult.error!);
      }

            return Result.ok(mappingResult.value!);
    } catch (error) {
            return Result.fail(error instanceof Error ? error : new Error('Unknown update error'));
    }
  }

  async delete(id: string): Promise<Result<void, Error>> {
    try {
            const response = await this.httpClient.delete(
        `/api/merchant-admin/daily-rewards/${id}`
      );

      if (response.status !== 200 && response.status !== 204) {
        if (response.status === 404) {
                    return Result.fail(new Error('Daily reward not found'));
        }
                return Result.fail(new Error(`Failed to delete daily reward: ${response.statusText}`));
      }

            return Result.ok(undefined);
    } catch (error) {
            return Result.fail(error instanceof Error ? error : new Error('Unknown delete error'));
    }
  }

  async findActiveReward(appId: string): Promise<Result<DailyReward | null, Error>> {
    try {
            const response = await this.httpClient.get<DailyRewardsApiResponse>(
        `/api/merchant-admin/daily-rewards?appId=${encodeURIComponent(appId)}&status=active&limit=1`
      );

      if (response.status !== 200) {
                return Result.fail(new Error(`Failed to find active daily reward: ${response.statusText}`));
      }

      const rewards = response.data?.rewards || [];
      if (rewards.length === 0) {
                return Result.ok(null);
      }

      const mappingResult = mapDtoToDomain(rewards[0]);
      if (mappingResult.isFailure) {
        return Result.fail(mappingResult.error!);
      }

            return Result.ok(mappingResult.value!);
    } catch (error) {
            return Result.fail(error instanceof Error ? error : new Error('Unknown findActive error'));
    }
  }
}
