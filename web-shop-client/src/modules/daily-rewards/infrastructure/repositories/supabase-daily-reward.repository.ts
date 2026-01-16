import { inject, injectable } from 'inversify';
import { Result, Success, Failure } from '../../../../shared/result/result';
import { TYPES } from '../../../../infrastructure/bootstrap/types';
import type { HttpClient } from '../../../../application/ports/http-client.port';
import type { Logger } from '../../../../application/ports/logger.port';
import type { DailyRewardRepositoryPort } from '../../application/ports/daily-reward-repository.port';
import { DailyReward, RewardId, RewardType } from '../../domain';

interface DailyRewardApiDto {
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

interface DailyRewardsListApiResponseDto {
  rewards: DailyRewardApiDto[];
}

@injectable()
export class SupabaseDailyRewardRepository implements DailyRewardRepositoryPort {
  constructor(
    @inject(TYPES.HttpClient)
    private readonly _httpClient: HttpClient,
    @inject(TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  async findAllRewards(appId: string): Promise<Result<readonly DailyReward[], Error>> {
    try {
      this._logger.info('[SupabaseDailyRewardRepository] Finding all rewards via API', { appId });

      const url = `/api/daily-rewards?appId=${appId}`;
      this._logger.info('[SupabaseDailyRewardRepository] Making request to:', url);

      // Use HttpClient with proper base URL handling
      const response = await this._httpClient.get<DailyRewardsListApiResponseDto | DailyRewardApiDto[]>(url);

      if (response.status >= 400) {
        this._logger.error('[SupabaseDailyRewardRepository] Failed to find rewards via API', {
          status: response.status,
          statusText: response.statusText,
          appId
        });
        return Failure.fail(new Error(`Failed to find rewards: ${response.status} ${response.statusText}`));
      }

      const raw = response.data as DailyRewardsListApiResponseDto | DailyRewardApiDto[];
      const dtos: DailyRewardApiDto[] = Array.isArray(raw) ? raw : raw.rewards;
      const rewards = dtos.map(dto => this.mapApiDtoToEntity(dto));
      this._logger.info('[SupabaseDailyRewardRepository] Found rewards', {
        appId,
        count: rewards.length
      });

      return Success.ok(rewards);
    } catch (error) {
      this._logger.error('[SupabaseDailyRewardRepository] Unexpected error finding rewards', { error, appId });
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async findActiveReward(appId: string): Promise<Result<DailyReward | null, Error>> {
    try {
      this._logger.info('[SupabaseDailyRewardRepository] Finding active daily reward via API', { appId });

      const url = `/api/daily-rewards/active?appId=${appId}`;
      this._logger.info('[SupabaseDailyRewardRepository] Making request to:', url);

      // Use HttpClient with proper base URL handling
      const response = await this._httpClient.get<DailyRewardApiDto>(url);

      if (response.status === 404) {
        this._logger.info('[SupabaseDailyRewardRepository] No active daily reward found', { appId });
        return Success.ok(null);
      }

      if (response.status >= 400) {
        this._logger.error('[SupabaseDailyRewardRepository] Failed to find active daily reward via API', {
          status: response.status,
          statusText: response.statusText,
          appId
        });
        return Failure.fail(new Error(`Failed to find active daily reward: ${response.status} ${response.statusText}`));
      }

      const reward = this.mapApiDtoToEntity(response.data);
      this._logger.info('[SupabaseDailyRewardRepository] Found active daily reward', {
        appId,
        rewardId: reward.id.value
      });

      return Success.ok(reward);
    } catch (error) {
      this._logger.error('[SupabaseDailyRewardRepository] Unexpected error finding active daily reward', { error, appId });
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  private mapApiDtoToEntity(dto: DailyRewardApiDto): DailyReward {
    try {
      // Валидация и парсинг дат с fallback
      const createdAt = this.parseDate(dto.created_at, 'created_at');
      const updatedAt = this.parseDate(dto.updated_at, 'updated_at');

      return DailyReward.fromDatabase(
        RewardId.fromString(dto.id),
        RewardType.create(dto.type),
        dto.title,
        dto.description,
        dto.points,
        dto.is_active,
        dto.day_number ?? null,
        createdAt,
        updatedAt
      );
    } catch (error) {
      this._logger.error('[SupabaseDailyRewardRepository] Error mapping API DTO to entity', { error, dto });
      throw error;
    }
  }

  private parseDate(dateString: string | null | undefined, fieldName: string): Date {
    if (!dateString) {
      this._logger.warn(`[SupabaseDailyRewardRepository] ${fieldName} is null/undefined, using current date`);
      return new Date();
    }

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid ${fieldName} format: ${dateString}`);
    }

    return date;
  }
}
