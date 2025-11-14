import type { ContextValue, UserOfferContextData } from './context.types';

export interface UserOfferContextWriterPort {
  upsert(appId: string, userId: string, patch: UserOfferContextData): Promise<void>;
  removeKeys(appId: string, userId: string, keys: readonly string[]): Promise<void>;
  setValue(appId: string, userId: string, key: string, value: ContextValue): Promise<void>;
}


