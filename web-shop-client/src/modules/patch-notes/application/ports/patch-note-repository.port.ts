import type { Result } from '../../../../shared/utils/result';
import type { PatchNoteId } from '../../domain/value-objects/patch-note-id';
import type { Version } from '../../domain/value-objects/version';
import type { PatchNote, PatchNoteStatus } from '../../domain/entities/patch-note';

export interface PatchNoteRepositoryPort {
  save(patchNote: PatchNote): Promise<Result<PatchNote, Error>>;
  findById(id: PatchNoteId): Promise<Result<PatchNote | null, Error>>;
  findByVersion(version: Version): Promise<Result<PatchNote | null, Error>>;
  findAll(status?: PatchNoteStatus): Promise<Result<PatchNote[], Error>>;
  findPublished(): Promise<Result<PatchNote[], Error>>;
  findScheduled(): Promise<Result<PatchNote[], Error>>;
  delete(id: PatchNoteId): Promise<Result<void, Error>>;
}
