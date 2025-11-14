import type { UserOfferContextSnapshot } from './context.types';

export interface UserOfferContextReaderPort {
  load(appId: string, userId: string): Promise<UserOfferContextSnapshot | null>;
}


