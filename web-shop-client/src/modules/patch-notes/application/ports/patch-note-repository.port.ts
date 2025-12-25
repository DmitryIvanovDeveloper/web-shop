import type { Result } from '../../../../shared/result/result';
import type { PatchNote } from '../../domain/entities/patch-note';

export interface PatchNoteRepositoryPort {
  findPublished(appId: string): Promise<Result<PatchNote[], Error>>;
}
