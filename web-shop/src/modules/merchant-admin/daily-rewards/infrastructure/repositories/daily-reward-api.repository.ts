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
      this.logger.info('[DailyRewardApiRepository] Saving daily reward', {
        id: dailyReward.id.value,
        appId: dailyReward.appId
      });

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
        this.logger.error('[DailyRewardApiRepository] Failed to save daily reward', {
          status: response.status,
          statusText: response.statusText
        });
        return Result.fail(new Error(`Failed to save daily reward: ${response.statusText}`));
      }

      if (!response.data?.reward) {
        return Result.fail(new Error('Invalid response format from API'));
      }

      const mappingResult = mapDtoToDomain(response.data.reward);
      if (mappingResult.isFailure) {
        return Result.fail(mappingResult.error!);
      }

      this.logger.info('[DailyRewardApiRepository] Daily reward saved successfully', {
        id: dailyReward.id.value
      });

      return Result.ok(mappingResult.value!);
    } catch (error) {
      this.logger.error('[DailyRewardApiRepository] Unexpected save error', { error });
      return Result.fail(error instanceof Error ? error : new Error('Unknown save error'));
    }
  }

  async findById(id: string): Promise<Result<DailyReward, Error>> {
    try {
      this.logger.info('[DailyRewardApiRepository] Finding daily reward by ID', { id });

      const response = await this.httpClient.get<DailyRewardApiResponse>(
        `/api/merchant-admin/daily-rewards/${id}`
      );

      if (response.status !== 200) {
        if (response.status === 404) {
          this.logger.info('[DailyRewardApiRepository] Daily reward not found', { id });
          return Result.fail(new Error('Daily reward not found'));
        }
        this.logger.error('[DailyRewardApiRepository] Failed to find daily reward', {
          id,
          status: response.status,
          statusText: response.statusText
        });
        return Result.fail(new Error(`Failed to find daily reward: ${response.statusText}`));
      }

      if (!response.data?.reward) {
        return Result.fail(new Error('Invalid response format from API'));
      }

      const mappingResult = mapDtoToDomain(response.data.reward);
      if (mappingResult.isFailure) {
        return Result.fail(mappingResult.error!);
      }

      this.logger.info('[DailyRewardApiRepository] Daily reward found', { id });
      return Result.ok(mappingResult.value!);
    } catch (error) {
      this.logger.error('[DailyRewardApiRepository] Unexpected find error', { error, id });
      return Result.fail(error instanceof Error ? error : new Error('Unknown find error'));
    }
  }

  async findAll(input: GetDailyRewardsInput): Promise<Result<DailyReward[], Error>> {
    try {
      this.logger.info('[DailyRewardApiRepository] Finding all daily rewards', input);

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
        this.logger.error('[DailyRewardApiRepository] Failed to find daily rewards', {
          input,
          status: response.status,
          statusText: response.statusText
        });
        return Result.fail(new Error(`Failed to find daily rewards: ${response.statusText}`));
      }

      if (!response.data?.rewards) {
        this.logger.info('[DailyRewardApiRepository] No rewards found', input);
        return Result.ok([]);
      }

      const rewards: DailyReward[] = [];
      for (const dto of response.data.rewards) {
        const mappingResult = mapDtoToDomain(dto);
        if (mappingResult.isFailure) {
          this.logger.error('[DailyRewardApiRepository] Failed to map reward DTO', {
            error: mappingResult.error!,
            dto
          });
          continue;
        }
        rewards.push(mappingResult.value!);
      }

      return Result.ok(rewards);
    } catch (error) {
      this.logger.error('[DailyRewardApiRepository] Unexpected findAll error', { error, input });
      return Result.fail(error instanceof Error ? error : new Error('Unknown findAll error'));
    }
  }

  async update(dailyReward: DailyReward): Promise<Result<DailyReward, Error>> {
    try {
      this.logger.info('[DailyRewardApiRepository] Updating daily reward', {
        id: dailyReward.id.value,
        appId: dailyReward.appId
      });

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
        this.logger.error('[DailyRewardApiRepository] Failed to update daily reward', {
          id: dailyReward.id.value,
          status: response.status,
          statusText: response.statusText
        });
        return Result.fail(new Error(`Failed to update daily reward: ${response.statusText}`));
      }

      if (!response.data?.reward) {
        return Result.fail(new Error('Invalid response format from API'));
      }

      const mappingResult = mapDtoToDomain(response.data.reward);
      if (mappingResult.isFailure) {
        return Result.fail(mappingResult.error!);
      }

      this.logger.info('[DailyRewardApiRepository] Daily reward updated successfully', {
        id: dailyReward.id.value
      });

      return Result.ok(mappingResult.value!);
    } catch (error) {
      this.logger.error('[DailyRewardApiRepository] Unexpected update error', { error });
      return Result.fail(error instanceof Error ? error : new Error('Unknown update error'));
    }
  }

  async delete(id: string): Promise<Result<void, Error>> {
    try {
      this.logger.info('[DailyRewardApiRepository] Deleting daily reward', { id });

      const response = await this.httpClient.delete(
        `/api/merchant-admin/daily-rewards/${id}`
      );

      if (response.status !== 200 && response.status !== 204) {
        if (response.status === 404) {
          this.logger.info('[DailyRewardApiRepository] Daily reward not found for deletion', { id });
          return Result.fail(new Error('Daily reward not found'));
        }
        this.logger.error('[DailyRewardApiRepository] Failed to delete daily reward', {
          id,
          status: response.status,
          statusText: response.statusText
        });
        return Result.fail(new Error(`Failed to delete daily reward: ${response.statusText}`));
      }

      this.logger.info('[DailyRewardApiRepository] Daily reward deleted successfully', { id });
      return Result.ok(undefined);
    } catch (error) {
      this.logger.error('[DailyRewardApiRepository] Unexpected delete error', { error, id });
      return Result.fail(error instanceof Error ? error : new Error('Unknown delete error'));
    }
  }

  async findActiveReward(appId: string): Promise<Result<DailyReward | null, Error>> {
    try {
      this.logger.info('[DailyRewardApiRepository] Finding active daily reward', { appId });

      const response = await this.httpClient.get<DailyRewardsApiResponse>(
        `/api/merchant-admin/daily-rewards?appId=${encodeURIComponent(appId)}&status=active&limit=1`
      );

      if (response.status !== 200) {
        this.logger.error('[DailyRewardApiRepository] Failed to find active daily reward', {
          appId,
          status: response.status,
          statusText: response.statusText
        });
        return Result.fail(new Error(`Failed to find active daily reward: ${response.statusText}`));
      }

      const rewards = response.data?.rewards || [];
      if (rewards.length === 0) {
        this.logger.info('[DailyRewardApiRepository] No active daily reward found', { appId });
        return Result.ok(null);
      }

      const mappingResult = mapDtoToDomain(rewards[0]);
      if (mappingResult.isFailure) {
        return Result.fail(mappingResult.error!);
      }

      this.logger.info('[DailyRewardApiRepository] Active daily reward found', {
        appId,
        rewardId: mappingResult.value!.id.value
      });

      return Result.ok(mappingResult.value!);
    } catch (error) {
      this.logger.error('[DailyRewardApiRepository] Unexpected findActive error', { error, appId });
      return Result.fail(error instanceof Error ? error : new Error('Unknown findActive error'));
    }
  }
}
