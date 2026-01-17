import { inject, injectable } from 'inversify';
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
    @inject(ROOT_TYPES.DatabaseClient)
    private readonly db: DatabaseClientPort
  ) {}

  async create(input: CreateUserAppConfigInput): Promise<UserAppConfig> {
    try {
      let serializableConfig: Record<string, unknown>;
      try {
        serializableConfig = JSON.parse(JSON.stringify(input.config));
      } catch (error) {
        throw new Error('Config contains non-serializable data');
      }

      const row: Omit<UserAppConfigRow, 'id' | 'created_at' | 'updated_at'> = {
        app_id: input.appId,
        merchant_id: 'user',
        config: serializableConfig,
        version: 1,
        is_active: false,
        is_draft: true,
      };

      const { data, error } = await this.db
        .from('app_configs')
        .insert(row)
        .select('*')
        .single();

      if (error) {
        throw new Error(`Failed to create user app config: ${error.message}`);
      }

      return this.mapRowToEntity(data);
    } catch (error) {
      throw error instanceof Error ? error : new Error('Unexpected error while creating user app config');
    }
  }

  async update(input: UpdateUserAppConfigInput): Promise<UserAppConfig> {
    try {
      const updateData: Partial<UserAppConfigRow> = {
        updated_at: new Date().toISOString(),
      };

      if (input.config !== undefined) {
        try {
          updateData.config = JSON.parse(JSON.stringify(input.config));
        } catch (error) {
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
        throw new Error(`Failed to update user app config: ${error.message}`);
      }

      return this.mapRowToEntity(data);
    } catch (error) {
      throw error instanceof Error ? error : new Error('Unexpected error while updating user app config');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const { error } = await this.db
        .from('app_configs')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to delete user app config: ${error.message}`);
      }
    } catch (error) {
      throw error instanceof Error ? error : new Error('Unexpected error while deleting user app config');
    }
  }

  async findById(id: string): Promise<UserAppConfig | null> {
    try {
      const { data, error } = await this.db
        .from('app_configs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw new Error(`Failed to find user app config: ${error.message}`);
      }

      return this.mapRowToEntity(data);
    } catch (error) {
      throw error instanceof Error ? error : new Error('Unexpected error while finding user app config');
    }
  }

  async list(filter: ListUserAppConfigsFilter): Promise<UserAppConfigSummary[]> {
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
        throw new Error(`Failed to list user app configs: ${error.message}`);
      }

      return (data || []).map(row => this.mapRowToSummary(row));
    } catch (error) {
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
