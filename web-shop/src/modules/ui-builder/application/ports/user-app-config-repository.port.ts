import type { UserAppConfig, UserAppConfigSummary, CreateUserAppConfigInput, UpdateUserAppConfigInput } from '../../domain/entities/user-app-config.entity';

export interface ListUserAppConfigsFilter {
  appId: string;
  includeInactive?: boolean;
}

export interface UserAppConfigRepositoryPort {
  create(input: CreateUserAppConfigInput): Promise<UserAppConfig>;
  update(input: UpdateUserAppConfigInput): Promise<UserAppConfig>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<UserAppConfig | null>;
  list(filter: ListUserAppConfigsFilter): Promise<UserAppConfigSummary[]>;
}


