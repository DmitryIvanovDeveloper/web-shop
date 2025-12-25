import { inject, injectable } from 'inversify';
import { Result, Success, Failure } from '../../../../shared/result/result';
import { TYPES } from '../../../../infrastructure/bootstrap/types';
import type { HttpClient } from '../../../../application/ports/http-client.port';
import type { Logger } from '../../../../application/ports/logger.port';
import type { DailyRewardRepositoryPort } from '../../application/ports/daily-reward-repository-port.port';
import { DailyReward, RewardId, RewardType } from '../../domain';

interface DailyRewardApiDto {
  id: string;
  app_id: string;
  type: string;
  title: string;
  description: string;
  points: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

@injectable()
export class SupabaseDailyRewardRepository implements DailyRewardRepositoryPort {
  constructor(
    @inject(TYPES.HttpClient)
    private readonly _httpClient: HttpClient,
    @inject(TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  async findActiveReward(appId: string): Promise<Result<DailyReward | null, Error>> {
    try {
      this._logger.info('[SupabaseDailyRewardRepository] Finding active daily reward via API', { appId });

      const url = `http://localhost:3001/api/daily-rewards/active?appId=${appId}`;
      this._logger.info('[SupabaseDailyRewardRepository] Making request to:', url);

      // Use absolute URL with fetch for development
      const fetchResponse = await fetch(url);
      const responseData = await fetchResponse.json();
      const response = {
        status: fetchResponse.status,
        statusText: fetchResponse.statusText,
        data: responseData
      };

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
      return DailyReward.fromDatabase(
        RewardId.fromString(dto.id),
        RewardType.create(dto.type),
        dto.title,
        dto.description,
        dto.points,
        dto.isActive,
        new Date(dto.createdAt),
        new Date(dto.updatedAt)
      );
    } catch (error) {
      this._logger.error('[SupabaseDailyRewardRepository] Error mapping API DTO to entity', { error, dto });
      throw error;
    }
  }
}
