import { inject, injectable } from 'inversify';
import { Success, Failure, type Result } from '../../../../shared/result/result';
import { TYPES } from '../../../../infrastructure/bootstrap/types';
import type { HttpClient } from '../../../../application/ports/http-client.port';
import type { Logger } from '../../../../application/ports/logger.port';
import type { PatchNoteRepositoryPort } from '../../application/ports/patch-note-repository.port';
import { PatchNote, type PatchNoteStatus } from '../../domain/entities/patch-note';
import { ChangeItem, type ChangeType } from '../../domain/entities/change-item';
import { PatchNoteId } from '../../domain/value-objects/patch-note-id';
import { Version } from '../../domain/value-objects/version';

// DTO for API response
interface PatchNoteApiDto {
  id: string;
  app_id: string;
  version: string;
  title: string;
  description: string | null;
  changes: Array<{
    type: string;
    description: string;
  }>;
  status: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
  scheduled_for?: string;
}

@injectable()
export class SupabasePatchNoteRepository implements PatchNoteRepositoryPort {
  constructor(
    @inject(TYPES.HttpClient)
    private readonly _httpClient: HttpClient,
    @inject(TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  async findPublished(appId: string): Promise<Result<PatchNote[], Error>> {
    try {
      this._logger.info('[SupabasePatchNoteRepository] Finding published patch notes via HttpClient', { appId });

      const timestamp = Date.now();
      const response = await this._httpClient.get<PatchNoteApiDto[]>(`/api/patch-notes/published?appId=${appId}&t=${timestamp}`);

      if (response.status !== 200) {
        this._logger.error('[SupabasePatchNoteRepository] Failed to fetch published patch notes', {
          status: response.status,
          statusText: response.statusText
        });
        return Failure.fail(new Error(`Failed to fetch published patch notes: ${response.status} ${response.statusText}`));
      }

      const patchNotes = (response.data || []).map((dto: PatchNoteApiDto) => this.mapApiDtoToEntity(dto));


      this._logger.info('[SupabasePatchNoteRepository] Successfully fetched published patch notes', {
        count: patchNotes.length
      });

      return Success.ok(patchNotes);
    } catch (error) {
      this._logger.error('[SupabasePatchNoteRepository] Unexpected error fetching published patch notes', { error });
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  private mapApiDtoToEntity(dto: PatchNoteApiDto): PatchNote {
    try {
      this._logger.info('[SupabasePatchNoteRepository] Mapping API DTO to entity', {
        id: dto.id,
        version: dto.version,
        title: dto.title,
        changesCount: dto.changes?.length || 0
      });

      if (!dto.changes || !Array.isArray(dto.changes)) {
        throw new Error(`Invalid changes data for patch note ${dto.id}: ${JSON.stringify(dto.changes)}`);
      }

      const changes = dto.changes.map((change, index) => {
        if (!change || typeof change !== 'object') {
          throw new Error(`Invalid change at index ${index} for patch note ${dto.id}: ${JSON.stringify(change)}`);
        }
        if (!change.type || !change.description) {
          throw new Error(`Missing type or description in change at index ${index} for patch note ${dto.id}: ${JSON.stringify(change)}`);
        }
        return ChangeItem.create(change.type as ChangeType, change.description);
      });

      return PatchNote.fromDatabase(
        PatchNoteId.fromString(dto.id),
        dto.app_id,
        Version.create(dto.version),
        dto.title,
        dto.description || '',
        changes,
        dto.status as PatchNoteStatus,
        new Date(dto.created_at),
        new Date(dto.updated_at),
        dto.published_at ? new Date(dto.published_at) : undefined,
        dto.scheduled_for ? new Date(dto.scheduled_for) : undefined
      );
    } catch (error) {
      this._logger.error('[SupabasePatchNoteRepository] Error in mapApiDtoToEntity', { error, dto });
      throw error;
    }
  }
}