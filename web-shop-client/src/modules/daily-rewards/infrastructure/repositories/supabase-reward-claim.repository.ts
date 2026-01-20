import { inject, injectable } from 'inversify';
import { Result, Success, Failure } from '../../../../shared/result/result';
import { TYPES } from '../../../../infrastructure/bootstrap/types';
import type { HttpClient } from '../../../../application/ports/http-client.port';
import type { Logger } from '../../../../application/ports/logger.port';
import type { RewardClaimRepositoryPort } from '../../application/ports/reward-claim-repository.port';
import { DailyRewardClaim, ClaimId, RewardId } from '../../domain';

interface RewardClaimApiDto {
  id: string;
  userId: string;
  rewardId: string;
  claimedAt: string;
  pointsAwarded: number;
  created_at: string;
  updated_at: string;
}

@injectable()
export class SupabaseRewardClaimRepository implements RewardClaimRepositoryPort {
  constructor(
    @inject(TYPES.HttpClient)
    private readonly _httpClient: HttpClient,
    @inject(TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  async save(claim: DailyRewardClaim): Promise<Result<DailyRewardClaim, Error>> {
    try {
            this._logger.info('[SupabaseRewardClaimRepository] Saving reward claim via API', {
        claimId: claim.id.value,
        userId: claim.userId
      });

      const requestData: RewardClaimApiDto = {
        id: claim.id.value,
        userId: claim.userId,
        rewardId: claim.rewardId.value,
        claimedAt: claim.claimedAt.toISOString(),
        pointsAwarded: claim.pointsAwarded,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      this._logger.info('[SupabaseRewardClaimRepository] Sending request data:', { requestData });
      console.log('REQUEST DATA:', JSON.stringify(requestData, null, 2));

            const isBrowser = typeof window !== 'undefined';
      const url = isBrowser
        ? `${window.location.origin}/api/daily-rewards/claim`
        : '/api/daily-rewards/claim';

            const response = await this._httpClient.post<RewardClaimApiDto>(
        url,
        requestData
      );

      if (response.status >= 400) {
        this._logger.error('[SupabaseRewardClaimRepository] Failed to save reward claim via API', {
          status: response.status,
          claimId: claim.id.value
        });
        const errorData = response.data as any;
        return Failure.fail(new Error(`Failed to save reward claim: ${errorData?.error || response.statusText}`));
      }

      this._logger.info('[SupabaseRewardClaimRepository] Reward claim saved successfully via API', {
        claimId: claim.id.value
      });
      return Success.ok(claim);
    } catch (error) {
      this._logger.error('[SupabaseRewardClaimRepository] Unexpected error saving reward claim', { error, claimId: claim.id.value });
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async findLastClaimByUser(userId: string): Promise<Result<DailyRewardClaim | null, Error>> {
    try {
      this._logger.info('[SupabaseRewardClaimRepository] Finding last claim by user via API', { userId });

            const isBrowser = typeof window !== 'undefined';
      const url = isBrowser
        ? `${window.location.origin}/api/daily-rewards/claims/last?userId=${userId}`
        : `/api/daily-rewards/claims/last?userId=${userId}`;

      const response = await this._httpClient.get<RewardClaimApiDto[]>(
        url
      );

      if (response.status === 404) {
        this._logger.info('[SupabaseRewardClaimRepository] No claims found for user', { userId });
        return Success.ok(null);
      }

      if (response.status >= 400) {
        this._logger.error('[SupabaseRewardClaimRepository] Failed to find last claim via API', {
          status: response.status,
          userId
        });
        return Failure.fail(new Error(`Failed to find last claim: ${response.statusText}`));
      }

      const claims = response.data || [];
      if (claims.length === 0) {
        return Success.ok(null);
      }

            const claim = this.mapApiDtoToEntity(claims[0]);
      this._logger.info('[SupabaseRewardClaimRepository] Found last claim for user', {
        userId,
        claimId: claim.id.value,
        claimedAt: claim.claimedAt
      });

      return Success.ok(claim);
    } catch (error) {
      this._logger.error('[SupabaseRewardClaimRepository] Unexpected error finding last claim', { error, userId });
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  private mapApiDtoToEntity(dto: RewardClaimApiDto): DailyRewardClaim {
    try {
                  const claimedAt = this.parseDate((dto as any).claimed_at || dto.claimedAt, 'claimed_at');

      return DailyRewardClaim.fromDatabase(
        ClaimId.fromString(dto.id),
        (dto as any).user_id || dto.userId,
        RewardId.fromString((dto as any).reward_id || dto.rewardId),
        claimedAt,
        (dto as any).points_awarded || dto.pointsAwarded
      );
    } catch (error) {
      this._logger.error('[SupabaseRewardClaimRepository] Error mapping API DTO to entity', { error, dto });
      throw error;
    }
  }

  private parseDate(dateString: string | null | undefined, fieldName: string): Date {
    if (!dateString) {
      this._logger.warn(`[SupabaseRewardClaimRepository] ${fieldName} is null/undefined, using current date`);
      return new Date();
    }

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid ${fieldName} format: ${dateString}`);
    }

    return date;
  }
}
