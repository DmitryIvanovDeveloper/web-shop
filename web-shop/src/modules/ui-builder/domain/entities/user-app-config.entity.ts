export interface UserAppConfig {
  id: string;
  appId: string;
  name?: string;
  config: Record<string, unknown>;
  version: number;
  isActive: boolean;
  isDraft: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserAppConfigSummary {
  id: string;
  appId: string;
  name?: string;
  version: number;
  isActive: boolean;
  isDraft: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserAppConfigInput {
  appId: string;
  name?: string;
  config: Record<string, unknown>;
}

export interface UpdateUserAppConfigInput {
  id: string;
  name?: string;
  config?: Record<string, unknown>;
}









