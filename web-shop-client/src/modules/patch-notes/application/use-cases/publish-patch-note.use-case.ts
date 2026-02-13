import { inject, injectable } from 'inversify';
import { Result } from '../../../../shared/result/result';
import { TYPES } from '../../../../infrastructure/bootstrap/types';
import type { EventBus } from '../../../../application/ports/event-bus.port';
import type { PatchNoteRepositoryPort } from '../ports/patch-note-repository.port';
import type { PublishPatchNoteInput, PatchNoteOutput } from '../types/patch-note.types';
import { PatchNoteId } from '../../domain/value-objects/patch-note-id';
import { PatchNoteNotFoundError, InvalidPatchNoteStatusError } from '../../domain/errors/patch-note.error';
import { PatchNotePublishedEvent } from '../../domain/events/patch-note.events';
import { PATCH_NOTES_TYPES } from '../../infrastructure/bootstrap/types';

@injectable()
export class PublishPatchNoteUseCase {
  constructor(
    @inject(PATCH_NOTES_TYPES.PatchNoteRepository)
    private readonly _patchNoteRepository: PatchNoteRepositoryPort,
    @inject(TYPES.EventBus)
    private readonly _eventBus: EventBus
  ) {}

  async execute(input: PublishPatchNoteInput): Promise<Result<PatchNoteOutput, Error>> {
    try {
            const patchNoteId = PatchNoteId.fromString(input.id);
      const findResult = await this._patchNoteRepository.findById(patchNoteId);

      if (!findResult.isSuccess) {
        return findResult;
      }

      if (!findResult.value) {
        return Result.error(new PatchNoteNotFoundError(input.id));
      }

      const patchNote = findResult.value!;

            let publishedPatchNote;
      try {
        publishedPatchNote = patchNote.publish();
      } catch (error) {
        if (error instanceof InvalidPatchNoteStatusError) {
          return Result.error(error);
        }
        throw error;
      }

            const saveResult = await this._patchNoteRepository.save(publishedPatchNote);
      if (!saveResult.isSuccess) {
        return saveResult;
      }

            await this._eventBus.publish(
        new PatchNotePublishedEvent(
          patchNoteId,
          patchNote.version.value,
          publishedPatchNote.publishedAt!
        )
      );

            return Result.ok(this.mapToOutput(saveResult.value!));

    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  private mapToOutput(patchNote: any): PatchNoteOutput {
    return {
      id: patchNote.id.value,
      version: patchNote.version.value,
      title: patchNote.title,
      description: patchNote.description,
      changes: patchNote.changes.map((change: any) => ({
        type: change.type,
        description: change.description
      })),
      status: patchNote.status,
      createdAt: patchNote.createdAt.toISOString(),
      updatedAt: patchNote.updatedAt.toISOString(),
      publishedAt: patchNote.publishedAt?.toISOString(),
      scheduledFor: patchNote.scheduledFor?.toISOString()
    };
  }
}
