import { inject, injectable } from 'inversify';
import { Result, Success, Failure } from '../../../../shared/result/result';
import { TYPES } from '../../../../infrastructure/bootstrap/types';
import type { DatabaseClientPort } from '../../../../application/ports/database-client.port';
import type { Logger } from '../../../../application/ports/logger.port';
import type { DailyRewardRepositoryPort } from '../../application/ports/daily-reward-repository.port';
import type { GetDailyRewardsInput } from '../../application/types/daily-reward.types';
import { DailyReward, RewardId, RewardType } from '../../domain';

@injectable()
export class SupabaseDailyRewardRepository implements DailyRewardRepositoryPort {
  constructor(
    @inject(TYPES.DatabaseClient)
    private readonly _databaseClient: DatabaseClientPort,
    @inject(TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  async save(dailyReward: DailyReward): Promise<Result<DailyReward, Error>> {
    try {
      this._logger.info('[SupabaseDailyRewardRepository] Saving daily reward', {
        id: dailyReward.id.value,
        appId: dailyReward.appId
      });

      const rewardData = {
        id: dailyReward.id.value,
        app_id: dailyReward.appId,
        type: dailyReward.type.value,
        title: dailyReward.title,
        description: dailyReward.description,
        points: dailyReward.points,
        is_active: dailyReward.isActive,
        created_at: dailyReward.createdAt.toISOString(),
        updated_at: dailyReward.updatedAt.toISOString()
      };

      const { data, error } = await this._databaseClient
        .from('daily_rewards')
        .insert(rewardData)
        .select()
        .single();

      if (error) {
        this._logger.error('[SupabaseDailyRewardRepository] Failed to save daily reward', { error });
        return Failure.fail(new Error(`Failed to save daily reward: ${error.message}`));
      }

      this._logger.info('[SupabaseDailyRewardRepository] Daily reward saved successfully', {
        id: dailyReward.id.value
      });
      return Success.ok(dailyReward);
    } catch (error) {
      this._logger.error('[SupabaseDailyRewardRepository] Unexpected error saving daily reward', { error });
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async findById(id: string): Promise<Result<DailyReward, Error>> {
    try {
      this._logger.info('[SupabaseDailyRewardRepository] Finding daily reward by ID', { id });

      const { data, error } = await this._databaseClient
        .from('daily_rewards')
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') {
        this._logger.error('[SupabaseDailyRewardRepository] Failed to find daily reward', { error, id });
        return Failure.fail(new Error(`Failed to find daily reward: ${error.message}`));
      }

      if (!data) {
        this._logger.info('[SupabaseDailyRewardRepository] Daily reward not found', { id });
        return Failure.fail(new Error(`Daily reward with ID '${id}' not found`));
      }

      const reward = this.mapRowToEntity(data);
      this._logger.info('[SupabaseDailyRewardRepository] Daily reward found', { id });
      return Success.ok(reward);
    } catch (error) {
      this._logger.error('[SupabaseDailyRewardRepository] Unexpected error finding daily reward', { error, id });
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async findAll(input: GetDailyRewardsInput): Promise<Result<DailyReward[], Error>> {
    try {
      this._logger.info('[SupabaseDailyRewardRepository] Finding all daily rewards', input);

      let query = this._databaseClient
        .from('daily_rewards')
        .select('*')
        .eq('app_id', input.appId)
        .order('created_at', { ascending: false });

      // Apply status filter
      if (input.status === 'active') {
        query = query.eq('is_active', true);
      } else if (input.status === 'inactive') {
        query = query.eq('is_active', false);
      }
      // 'all' means no status filter

      // Apply pagination
      if (input.limit) {
        query = query.limit(input.limit);
      }

      if (input.offset) {
        query = query.range(input.offset, input.offset + (input.limit || 100) - 1);
      }

      const { data, error } = await query;

      if (error) {
        this._logger.error('[SupabaseDailyRewardRepository] Failed to find daily rewards', { error, input });
        return Failure.fail(new Error(`Failed to find daily rewards: ${error.message}`));
      }

      const rewards = (data || []).map((row) => this.mapRowToEntity(row));
      this._logger.info('[SupabaseDailyRewardRepository] Found daily rewards', {
        count: rewards.length,
        appId: input.appId
      });

      return Success.ok(rewards);
    } catch (error) {
      this._logger.error('[SupabaseDailyRewardRepository] Unexpected error finding daily rewards', { error, input });
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async update(dailyReward: DailyReward): Promise<Result<DailyReward, Error>> {
    try {
      this._logger.info('[SupabaseDailyRewardRepository] Updating daily reward', {
        id: dailyReward.id.value
      });

      const updateData = {
        title: dailyReward.title,
        description: dailyReward.description,
        points: dailyReward.points,
        is_active: dailyReward.isActive,
        updated_at: dailyReward.updatedAt.toISOString()
      };

      const { data, error } = await this._databaseClient
        .from('daily_rewards')
        .update(updateData)
        .eq('id', dailyReward.id.value)
        .select()
        .single();

      if (error) {
        this._logger.error('[SupabaseDailyRewardRepository] Failed to update daily reward', { error, id: dailyReward.id.value });
        return Failure.fail(new Error(`Failed to update daily reward: ${error.message}`));
      }

      this._logger.info('[SupabaseDailyRewardRepository] Daily reward updated successfully', {
        id: dailyReward.id.value
      });
      return Success.ok(dailyReward);
    } catch (error) {
      this._logger.error('[SupabaseDailyRewardRepository] Unexpected error updating daily reward', { error, id: dailyReward.id.value });
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async delete(id: string): Promise<Result<void, Error>> {
    try {
      this._logger.info('[SupabaseDailyRewardRepository] Deleting daily reward', { id });

      const { error } = await this._databaseClient
        .from('daily_rewards')
        .delete()
        .eq('id', id);

      if (error) {
        this._logger.error('[SupabaseDailyRewardRepository] Failed to delete daily reward', { error, id });
        return Failure.fail(new Error(`Failed to delete daily reward: ${error.message}`));
      }

      this._logger.info('[SupabaseDailyRewardRepository] Daily reward deleted successfully', { id });
      return Success.ok(void 0);
    } catch (error) {
      this._logger.error('[SupabaseDailyRewardRepository] Unexpected error deleting daily reward', { error, id });
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async findActiveReward(appId: string): Promise<Result<DailyReward | null, Error>> {
    try {
      this._logger.info('[SupabaseDailyRewardRepository] Finding active daily reward', { appId });

      const { data, error } = await this._databaseClient
        .from('daily_rewards')
        .select('*')
        .eq('app_id', appId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        this._logger.error('[SupabaseDailyRewardRepository] Failed to find active daily reward', { error, appId });
        return Failure.fail(new Error(`Failed to find active daily reward: ${error.message}`));
      }

      const rewards = data || [];
      const activeReward = rewards.length > 0 ? this.mapRowToEntity(rewards[0]) : null;

      this._logger.info('[SupabaseDailyRewardRepository] Active daily reward lookup result', {
        appId,
        found: activeReward !== null,
        rewardId: activeReward?.id.value
      });

      return Success.ok(activeReward);
    } catch (error) {
      this._logger.error('[SupabaseDailyRewardRepository] Unexpected error finding active daily reward', { error, appId });
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  private mapRowToEntity(row: {
    id: string;
    app_id: string;
    type: string;
    title: string;
    description: string;
    points: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  }): DailyReward {
    try {
      return DailyReward.fromDatabase(
        RewardId.fromString(row.id),
        row.app_id,
        RewardType.fromString(row.type),
        row.title,
        row.description,
        row.points,
        row.is_active,
        new Date(row.created_at),
        new Date(row.updated_at)
      );
    } catch (error) {
      this._logger.error('[SupabaseDailyRewardRepository] Error mapping row to entity', { error, row });
      throw error;
    }
  }
}