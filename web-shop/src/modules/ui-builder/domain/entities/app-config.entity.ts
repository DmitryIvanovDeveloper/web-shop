export interface AppConfig {
  id?: string;
  appId: string;
  version: import('../value-objects/config-version.vo').ConfigVersion;
  isDraft?: boolean;
  isActive?: boolean;
  config: unknown;
  createdAt?: Date;
  updatedAt?: Date;
}

export class AppConfigFactory {
  public static create(input: {
    appId: string;
    merchantId?: string;
    config: unknown;
    version: import('../value-objects/config-version.vo').ConfigVersion;
    isActive: boolean;
    isDraft: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): AppConfig {
    return {
      appId: input.appId,
      config: input.config,
      version: input.version,
      isActive: input.isActive,
      isDraft: input.isDraft,
      createdAt: input.createdAt,
      updatedAt: input.updatedAt,
    };
  }
}






