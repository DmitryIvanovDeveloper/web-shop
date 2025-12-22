import { inject, injectable } from 'inversify';
import { Success, Failure } from '../../../../shared/result/result';
import { TYPES } from '../../../../infrastructure/bootstrap/types';
import type { DatabaseClient } from '../../../../infrastructure/ports/database-client.port';
import type { Logger } from '../../../../application/ports/logger.port';
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
  description: string;
  changes: Array<{
    type: string;
    description: string;
  }>;
  status: PatchNoteStatus;
  created_at: string;
  updated_at: string;
  published_at?: string;
  scheduled_for?: string;
}

@injectable()
export class SupabasePatchNoteRepository implements PatchNoteRepositoryPort {
  constructor(
    @inject(TYPES.DatabaseClient)
    private readonly _databaseClient: DatabaseClient,
    @inject(TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  async save(patchNote: PatchNote): Promise<Result<PatchNote, Error>> {
    try {
      this._logger.info('[SupabasePatchNoteRepository] Saving patch note', {
        id: patchNote.id.value,
        version: patchNote.version.value
      });

      const row: PatchNoteRow = {
        id: patchNote.id.value,
        app_id: patchNote.appId,
        version: patchNote.version.value,
        title: patchNote.title,
        description: patchNote.description,
        changes: patchNote.changes.map(change => ({
          type: change.type,
          description: change.description
        })),
        status: patchNote.status,
        created_at: patchNote.createdAt.toISOString(),
        updated_at: patchNote.updatedAt.toISOString(),
        published_at: patchNote.publishedAt?.toISOString(),
        scheduled_for: patchNote.scheduledFor?.toISOString()
      };

      const { error } = await this._databaseClient
        .from('patch_notes')
        .upsert(row, { onConflict: 'id' });

      if (error) {
        this._logger.error('[SupabasePatchNoteRepository] Failed to save patch note', { error });
        return Failure.fail(new Error(`Failed to save patch note: ${error.message}`));
      }

      this._logger.info('[SupabasePatchNoteRepository] Patch note saved successfully');
      return Success.ok(patchNote);

    } catch (error) {
      this._logger.error('[SupabasePatchNoteRepository] Unexpected error saving patch note', { error });
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async findById(id: PatchNoteId): Promise<Result<PatchNote | null, Error>> {
    try {
      const { data, error } = await this._databaseClient
        .from('patch_notes')
        .select('*')
        .eq('id', id.value)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        this._logger.error('[SupabasePatchNoteRepository] Failed to find patch note by ID', { error, id: id.value });
        return Failure.fail(new Error(`Failed to find patch note: ${error.message}`));
      }

      if (!data) {
        return Success.ok(null);
      }

      const patchNote = this.mapRowToEntity(data);
      return Success.ok(patchNote);

    } catch (error) {
      this._logger.error('[SupabasePatchNoteRepository] Unexpected error finding patch note by ID', { error });
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async findByVersion(version: Version, appId: string): Promise<Result<PatchNote | null, Error>> {
    try {
      const { data, error } = await this._databaseClient
        .from('patch_notes')
        .select('*')
        .eq('version', version.value)
        .eq('app_id', appId)
        .single();

      if (error && error.code !== 'PGRST116') {
        this._logger.error('[SupabasePatchNoteRepository] Failed to find patch note by version', { error, version: version.value });
        return Failure.fail(new Error(`Failed to find patch note: ${error.message}`));
      }

      if (!data) {
        return Success.ok(null);
      }

      const patchNote = this.mapRowToEntity(data);
      return Success.ok(patchNote);

    } catch (error) {
      this._logger.error('[SupabasePatchNoteRepository] Unexpected error finding patch note by version', { error });
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async findAll(appId: string, status?: PatchNoteStatus): Promise<Result<PatchNote[], Error>> {
    try {
      let query = this._databaseClient
        .from('patch_notes')
        .select('*')
        .eq('app_id', appId);

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        this._logger.error('[SupabasePatchNoteRepository] Failed to find all patch notes', { error });
        return Failure.fail(new Error(`Failed to find patch notes: ${error.message}`));
      }

      const patchNotes = data?.map(row => this.mapRowToEntity(row)) || [];
      return Success.ok(patchNotes);

    } catch (error) {
      this._logger.error('[SupabasePatchNoteRepository] Unexpected error finding all patch notes', { error });
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  async findPublished(appId: string): Promise<Result<PatchNote[], Error>> {
    return this.findAll(appId, 'published');
  }

  async findScheduled(appId: string): Promise<Result<PatchNote[], Error>> {
    return this.findAll(appId, 'scheduled');
  }

  async delete(id: PatchNoteId): Promise<Result<void, Error>> {
    try {
      const { error } = await this._databaseClient
        .from('patch_notes')
        .delete()
        .eq('id', id.value);

      if (error) {
        this._logger.error('[SupabasePatchNoteRepository] Failed to delete patch note', { error, id: id.value });
        return Failure.fail(new Error(`Failed to delete patch note: ${error.message}`));
      }

      this._logger.info('[SupabasePatchNoteRepository] Patch note deleted successfully', { id: id.value });
      return Success.ok(undefined);

    } catch (error) {
      this._logger.error('[SupabasePatchNoteRepository] Unexpected error deleting patch note', { error });
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  private mapRowToEntity(row: PatchNoteRow): PatchNote {
    const changes = row.changes.map(change =>
      new ChangeItem(change.type as any, change.description)
    );

    return new PatchNote(
      PatchNoteId.fromString(row.id),
      row.app_id,
      Version.create(row.version),
      row.title,
      row.description,
      changes,
      row.status,
      new Date(row.created_at),
      new Date(row.updated_at),
      row.published_at ? new Date(row.published_at) : undefined,
      row.scheduled_for ? new Date(row.scheduled_for) : undefined
    );
  }
}
