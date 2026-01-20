import { inject, injectable } from 'inversify';
import { Success, Failure, type Result } from '../../../../../shared/result/result';
import { TYPES } from '../../../../../infrastructure/bootstrap/types';
import type { HttpClient, HttpResponse } from '../../../../../application/ports/http-client.port';
import type { Logger } from '../../../../../application/ports/logger.port';
import type { PatchNoteRepositoryPort } from '../../application/ports/patch-note-repository.port';
import { PatchNote, type PatchNoteStatus } from '../../domain/entities/patch-note';
import { ChangeItem } from '../../domain/entities/change-item';
import { PatchNoteId } from '../../domain/value-objects/patch-note-id';
import { Version } from '../../domain/value-objects/version';

interface PatchNoteRow {
  id: string;
  app_id: string;
  version: string;
  title: string;
  description: string | null;
  changes: Array<{
    type: string;
    description: string;
  }>;
  status: PatchNoteStatus;
  created_at: string;
  updated_at: string;
  published_at?: string | null;
  scheduled_for?: string | null;
}

const mapRowToPatchNote = (row: any): Result<PatchNote, Error> => {
  try {
    
    const title = (row.title !== null && row.title !== undefined) ? String(row.title) : 'Untitled';
    const description = (row.description !== null && row.description !== undefined) ? String(row.description) : '';

    const changes = (row.changes || []).map((change: any) => {
      try {
        return ChangeItem.create(change.type, change.description || 'No description');
      } catch (error) {
                return ChangeItem.create('feature', 'Invalid change data');
      }
    });

    const patchNote = PatchNote.create(
      PatchNoteId.fromString(row.id),
      row.app_id,
      Version.create(row.version),
      title,
      description,
      changes
    );

    return Success.ok(patchNote);
  } catch (error) {
        const errorObj = error instanceof Error ? error : new Error('Unknown error mapping row to PatchNote');
    return Failure.fail(errorObj);
  }
};

interface PatchNoteRow {
  id: string;
  app_id: string;
  version: string;
  title: string;
  description: string | null;
  changes: Array<{
    type: string;
    description: string;
  }>;
  status: PatchNoteStatus;
  created_at: string;
  updated_at: string;
  published_at?: string | null;
  scheduled_for?: string | null;
}

@injectable()
export class SupabasePatchNoteRepository implements PatchNoteRepositoryPort {
  constructor(
    @inject(TYPES.HttpClient)
    private readonly _httpClient: HttpClient,
    @inject(TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  async save(patchNote: PatchNote): Promise<Result<PatchNote, Error>> {
    try {
            const requestData = {
        appId: patchNote.appId,
        version: patchNote.version.value,
        title: patchNote.title,
        description: patchNote.description,
        changes: patchNote.changes.map(change => ({
          type: change.type,
          description: change.description
        }))
      };

      const response = await this._httpClient.post(
        `/api/merchant-admin/patch-notes`,
        requestData
      );

      if (response.status >= 400) {
                const errorData = response.data as any;
        return Failure.fail(new Error(`Failed to save patch note: ${errorData?.error || response.statusText}`));
      }

            return Success.ok(patchNote);

    } catch (error) {
            return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async update(patchNote: PatchNote): Promise<Result<PatchNote, Error>> {
    try {
            const requestData = {
        title: patchNote.title,
        description: patchNote.description,
        changes: patchNote.changes.map(change => ({
          type: change.type,
          description: change.description
        }))
      };

      const response = await this._httpClient.put(
        `/api/merchant-admin/patch-notes?id=${patchNote.id.value}&appId=${patchNote.appId}`,
        requestData
      );

      if (response.status >= 400) {
                const errorData = response.data as any;
        return Failure.fail(new Error(`Failed to update patch note: ${errorData?.error || response.statusText}`));
      }

            return Success.ok(patchNote);

    } catch (error) {
            return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async findById(id: PatchNoteId, appId: string): Promise<Result<PatchNote | null, Error>> {
    try {
            const response = await this._httpClient.get(
        `/api/merchant-admin/patch-notes?id=${id.value}&appId=${appId}`
      );

      if (response.status >= 400) {
                const errorData = response.data as any;
        return Failure.fail(new Error(`Failed to find patch note: ${errorData?.error || response.statusText}`));
      }

      const data = response.data as any[];
      if (!data || data.length === 0) {
        return Success.ok(null);
      }

      const patchNoteResult = mapRowToPatchNote(data[0]);
      if (!patchNoteResult.isSuccess) {
                return Failure.fail(patchNoteResult.error as Error);
      }

      return Success.ok(patchNoteResult.value || null);

    } catch (error) {
            return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async findByVersion(version: Version, appId: string): Promise<Result<PatchNote | null, Error>> {
    try {
            const response = await this._httpClient.get(
        `/api/merchant-admin/patch-notes?version=${version.value}&appId=${appId}`
      );

      if (response.status >= 400) {
                const errorData = response.data as any;
        return Failure.fail(new Error(`Failed to find patch note: ${errorData?.error || response.statusText}`));
      }

      const data = response.data as any[];
      if (!data || data.length === 0) {
        return Success.ok(null);
      }

      const patchNoteResult = mapRowToPatchNote(data[0]);
      if (!patchNoteResult.isSuccess) {
                return Failure.fail(patchNoteResult.error as Error);
      }

      return Success.ok(patchNoteResult.value || null);

    } catch (error) {
            return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async findAll(appId: string, status?: PatchNoteStatus): Promise<Result<PatchNote[], Error>> {
    try {
            let url = `/api/merchant-admin/patch-notes?appId=${appId}`;
      if (status) {
        url += `&status=${status}`;
      }

      const response = await this._httpClient.get(url);

      if (response.status >= 400) {
                const errorData = response.data as any;
        return Failure.fail(new Error(`Failed to find patch notes: ${errorData?.error || response.statusText}`));
      }

      const patchNotes: PatchNote[] = [];
      const data = response.data as any[];
      if (data) {
        for (const row of data) {
          const patchNoteResult = mapRowToPatchNote(row);
          if (!patchNoteResult.isSuccess) {
                        return Failure.fail(patchNoteResult.error as Error);
          }
          patchNotes.push(patchNoteResult.value!);
        }
      }
      return Success.ok(patchNotes);

    } catch (error) {
            return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async findPublished(appId: string): Promise<Result<PatchNote[], Error>> {
    return this.findAll(appId, 'published');
  }

  async findScheduled(appId: string): Promise<Result<PatchNote[], Error>> {
    return this.findAll(appId, 'scheduled');
  }

  async delete(id: PatchNoteId, appId: string): Promise<Result<void, Error>> {
    try {
            const response = await this._httpClient.delete(
        `/api/merchant-admin/patch-notes?id=${id.value}&appId=${appId}`
      );

      if (response.status >= 400) {
                const errorData = response.data as any;
        return Failure.fail(new Error(`Failed to delete patch note: ${errorData?.error || response.statusText}`));
      }

            return Success.ok(undefined);

    } catch (error) {
            return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }
}
