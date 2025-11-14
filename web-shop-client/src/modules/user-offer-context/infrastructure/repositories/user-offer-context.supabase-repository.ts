import { inject, injectable } from 'inversify';
import type { HttpClient } from '../../../../application/ports/http-client.port';
import { TYPES } from '../../../../infrastructure/bootstrap/types';
import type { UserOfferContextReaderPort } from '../../application/ports/user-offer-context-reader.port';
import type {
  ContextValue,
  UserOfferContextData,
  UserOfferContextSnapshot,
} from '../../application/ports/context.types';
import type { UserOfferContextWriterPort } from '../../application/ports/user-offer-context-writer.port';
import { stringToDeterministicUuid } from '../../../../shared/utils/deterministic-uuid';

interface ApiContextResponse {
  readonly context?: UserOfferContextData;
  readonly updatedAt?: string;
}

interface UpdateContextRequest {
  readonly appId: string;
  readonly userId: string;
  readonly patch?: UserOfferContextData;
  readonly removeKeys?: readonly string[];
}

@injectable()
export class UserOfferContextSupabaseRepository
  implements UserOfferContextReaderPort, UserOfferContextWriterPort
{
  public constructor(@inject(TYPES.HttpClient) private readonly http: HttpClient) {}

  public async load(appId: string, userId: string): Promise<UserOfferContextSnapshot | null> {
    const normalizedUserId = stringToDeterministicUuid(userId);
    const url = `/api/user/offer-context?appId=${encodeURIComponent(appId)}&userId=${encodeURIComponent(
      normalizedUserId
    )}`;
    const response = await this.http.get<ApiContextResponse>(url);

    if (response.status >= 400) {
      return null;
    }

    const context = response.data?.context ?? {};
    const updatedAt =
      response.data?.updatedAt ??
      new Date().toISOString();

    return {
      appId,
      userId: normalizedUserId,
      data: context,
      updatedAt,
    };
  }

  public async upsert(appId: string, userId: string, patch: UserOfferContextData): Promise<void> {
    const normalizedUserId = stringToDeterministicUuid(userId);
    await this.sendPatch({ appId, userId: normalizedUserId, patch });
  }

  public async removeKeys(appId: string, userId: string, keys: readonly string[]): Promise<void> {
    if (!keys.length) return;
    const normalizedUserId = stringToDeterministicUuid(userId);
    await this.sendPatch({ appId, userId: normalizedUserId, removeKeys: keys });
  }

  public async setValue(appId: string, userId: string, key: string, value: ContextValue): Promise<void> {
    await this.upsert(appId, userId, { [key]: value });
  }

  private async sendPatch(body: UpdateContextRequest): Promise<void> {
    const response = await this.http.post('/api/user/offer-context', body);
    if (response.status >= 400) {
      throw new Error(`[UserOfferContextSupabaseRepository] Failed to update context (status ${response.status})`);
    }
  }
}











