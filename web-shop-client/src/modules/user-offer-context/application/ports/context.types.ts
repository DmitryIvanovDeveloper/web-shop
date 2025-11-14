export type ContextValue = string | number | boolean | null;

export type UserOfferContextData = Record<string, ContextValue>;

export interface UserOfferContextSnapshot {
  readonly appId: string;
  readonly userId: string;
  readonly data: UserOfferContextData;
  readonly updatedAt: string;
}


