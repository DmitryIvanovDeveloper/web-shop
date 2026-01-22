import type { GrapeJsProjectData } from './template.entity';

export interface AppConfig {
  readonly id: string;
  readonly appId: string;
  readonly merchantId: string;
  readonly config: GrapeJsProjectData;
  readonly draftConfig: GrapeJsProjectData;
  readonly version: number;
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export const createAppConfig = (params: {
  id: string;
  appId: string;
  merchantId: string;
  config: GrapeJsProjectData;
  draftConfig: GrapeJsProjectData;
  version: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}): AppConfig => {
  return {
    id: params.id,
    appId: params.appId,
    merchantId: params.merchantId,
    config: params.config,
    draftConfig: params.draftConfig,
    version: params.version,
    isActive: params.isActive,
    createdAt: params.createdAt,
    updatedAt: params.updatedAt,
  };
};
