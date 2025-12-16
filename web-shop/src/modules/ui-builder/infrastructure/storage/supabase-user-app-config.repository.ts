import { inject, injectable } from 'inversify';
import type { Logger } from '@/application/ports/logger.port';
import type { DatabaseClientPort } from '@/application/ports/database-client.port';
import { TYPES as ROOT_TYPES } from '@/infrastructure/bootstrap/types';
import type { UserAppConfigRepositoryPort, ListUserAppConfigsFilter } from '../../application/ports/user-app-config-repository.port';
import type { UserAppConfig, UserAppConfigSummary, CreateUserAppConfigInput, UpdateUserAppConfigInput } from '../../domain/entities/user-app-config.entity';

interface UserAppConfigRow {
  id: string;
  app_id: string;
  merchant_id: string;
  config: Record<string, unknown>;
  version: number;
  is_active: boolean;
  is_draft: boolean;
  created_at: string;
  updated_at: string;
}

@injectable()
export class SupabaseUserAppConfigRepository implements UserAppConfigRepositoryPort {
  constructor(
    @inject(ROOT_TYPES.Logger)
    private readonly logger: Logger,
    @inject(ROOT_TYPES.DatabaseClient)
    private readonly db: DatabaseClientPort
  ) {}

  async create(input: CreateUserAppConfigInput): Promise<UserAppConfig> {
    this.logger.info('[SupabaseUserAppConfigRepository] Creating user app config', {
      appId: input.appId,
      name: input.name,
    });

    try {
      // Ensure config is serializable
      let serializableConfig: Record<string, unknown>;
      try {
        serializableConfig = JSON.parse(JSON.stringify(input.config));
      } catch (error) {
        this.logger.error('[SupabaseUserAppConfigRepository] Failed to serialize config', { error });
        throw new Error('Config contains non-serializable data');
      }

      const row: Omit<UserAppConfigRow, 'id' | 'created_at' | 'updated_at'> = {
        app_id: input.appId,
        merchant_id: 'user', // For non-admin users
        config: serializableConfig,
        version: 1,
        is_active: false, // User configs are not active by default
        is_draft: true,
      };

      const { data, error } = await this.db
        .from('app_configs')
        .insert(row)
        .select('*')
        .single();

      if (error) {
        this.logger.error('[SupabaseUserAppConfigRepository] Failed to create user app config', { error });
        throw new Error(`Failed to create user app config: ${error.message}`);
      }

      return this.mapRowToEntity(data);
    } catch (error) {
      this.logger.error('[SupabaseUserAppConfigRepository] Unexpected error in create', { error });
      throw error instanceof Error ? error : new Error('Unexpected error while creating user app config');
    }
  }

  async update(input: UpdateUserAppConfigInput): Promise<UserAppConfig> {
    this.logger.info('[SupabaseUserAppConfigRepository] Updating user app config', {
      id: input.id,
    });

    try {
      const updateData: Partial<UserAppConfigRow> = {
        updated_at: new Date().toISOString(),
      };

      if (input.name !== undefined) {
        // Note: app_configs table doesn't have name field, so we might need to extend it
        // For now, we'll skip name updates or store in metadata if available
        this.logger.warn('[SupabaseUserAppConfigRepository] Name updates not supported in current schema');
      }

      if (input.config !== undefined) {
        // Ensure config is serializable
        try {
          updateData.config = JSON.parse(JSON.stringify(input.config));
        } catch (error) {
          this.logger.error('[SupabaseUserAppConfigRepository] Failed to serialize config', { error });
          throw new Error('Config contains non-serializable data');
        }
      }

      const { data, error } = await this.db
        .from('app_configs')
        .update(updateData)
        .eq('id', input.id)
        .select('*')
        .single();

      if (error) {
        this.logger.error('[SupabaseUserAppConfigRepository] Failed to update user app config', { error, id: input.id });
        throw new Error(`Failed to update user app config: ${error.message}`);
      }

      return this.mapRowToEntity(data);
    } catch (error) {
      this.logger.error('[SupabaseUserAppConfigRepository] Unexpected error in update', { error });
      throw error instanceof Error ? error : new Error('Unexpected error while updating user app config');
    }
  }

  async delete(id: string): Promise<void> {
    this.logger.info('[SupabaseUserAppConfigRepository] Deleting user app config', { id });

    try {
      const { error } = await this.db
        .from('app_configs')
        .delete()
        .eq('id', id);

      if (error) {
        this.logger.error('[SupabaseUserAppConfigRepository] Failed to delete user app config', { error, id });
        throw new Error(`Failed to delete user app config: ${error.message}`);
      }
    } catch (error) {
      this.logger.error('[SupabaseUserAppConfigRepository] Unexpected error in delete', { error });
      throw error instanceof Error ? error : new Error('Unexpected error while deleting user app config');
    }
  }

  async findById(id: string): Promise<UserAppConfig | null> {
    this.logger.info('[SupabaseUserAppConfigRepository] Finding user app config by id', { id });

    try {
      const { data, error } = await this.db
        .from('app_configs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        this.logger.error('[SupabaseUserAppConfigRepository] Failed to find user app config', { error, id });
        throw new Error(`Failed to find user app config: ${error.message}`);
      }

      return this.mapRowToEntity(data);
    } catch (error) {
      this.logger.error('[SupabaseUserAppConfigRepository] Unexpected error in findById', { error });
      throw error instanceof Error ? error : new Error('Unexpected error while finding user app config');
    }
  }

  async list(filter: ListUserAppConfigsFilter): Promise<UserAppConfigSummary[]> {
    this.logger.info('[SupabaseUserAppConfigRepository] Listing user app configs', {
      appId: filter.appId,
      includeInactive: filter.includeInactive,
    });

    try {
      let query = this.db
        .from('app_configs')
        .select('id, app_id, version, is_active, is_draft, created_at, updated_at')
        .eq('app_id', filter.appId)
        .order('updated_at', { ascending: false });

      if (!filter.includeInactive) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query;

      if (error) {
        this.logger.error('[SupabaseUserAppConfigRepository] Failed to list user app configs', { error, filter });
        throw new Error(`Failed to list user app configs: ${error.message}`);
      }

      return (data || []).map(row => this.mapRowToSummary(row));
    } catch (error) {
      this.logger.error('[SupabaseUserAppConfigRepository] Unexpected error in list', { error });
      throw error instanceof Error ? error : new Error('Unexpected error while listing user app configs');
    }
  }

  private mapRowToEntity(row: UserAppConfigRow): UserAppConfig {
    return {
      id: row.id,
      appId: row.app_id,
      config: row.config,
      version: row.version,
      isActive: row.is_active,
      isDraft: row.is_draft,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private mapRowToSummary(row: UserAppConfigRow): UserAppConfigSummary {
    return {
      id: row.id,
      appId: row.app_id,
      version: row.version,
      isActive: row.is_active,
      isDraft: row.is_draft,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
