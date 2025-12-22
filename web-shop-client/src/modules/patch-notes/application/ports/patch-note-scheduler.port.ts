import type { Result } from '../../../../shared/utils/result';
import type { PatchNoteId } from '../../domain/value-objects/patch-note-id';

export interface PatchNoteSchedulerPort {
  schedulePublication(patchNoteId: PatchNoteId, publishDate: Date): Promise<Result<void, Error>>;
  cancelScheduledPublication(patchNoteId: PatchNoteId): Promise<Result<void, Error>>;
}
