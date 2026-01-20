import { inject, injectable } from 'inversify';
import { Success, Failure, type Result } from '../../../../../shared/result/result';
import type { Logger } from '../../../../../application/ports/logger.port';
import type { EventBus } from '../../../../../application/ports/event-bus.port';
import { TYPES } from '../../../../../infrastructure/bootstrap/types';
import { MERCHANT_ADMIN_PATCH_NOTES_TYPES } from '../../infrastructure/bootstrap/types';
import type { PatchNoteRepositoryPort } from '../ports/patch-note-repository.port';
import type { UpdatePatchNoteInput, PatchNoteOutput } from '../types/patch-note.types';
import { PatchNote } from '../../domain/entities/patch-note';
import { PatchNoteId } from '../../domain/value-objects/patch-note-id';
import { ChangeItem } from '../../domain/entities/change-item';
import { PatchNoteNotFoundError } from '../../domain/errors/patch-note.error';
import { PatchNoteUpdatedEvent } from '../../domain/events/patch-note.events';

@injectable()
export class UpdatePatchNoteUseCase {
  constructor(
    @inject(MERCHANT_ADMIN_PATCH_NOTES_TYPES.PatchNoteRepository)
    private readonly _patchNoteRepository: PatchNoteRepositoryPort,
    @inject(TYPES.EventBus)
    private readonly _eventBus: EventBus,
    @inject(TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  async execute(input: UpdatePatchNoteInput): Promise<Result<PatchNoteOutput, Error>> {
        try {
      
      const patchNoteId = PatchNoteId.fromString(input.id);
      const findResult = await this._patchNoteRepository.findById(patchNoteId, input.appId);

      if (!findResult.isSuccess) {
                return Failure.fail(findResult.error);
      }

      if (!findResult.value) {
        return Failure.fail(new PatchNoteNotFoundError(input.id));
      }

      const existingPatchNote = findResult.value;

      const updateData: Partial<{ title: string; description: string; changes: ChangeItem[] }> = {};

      if (input.title !== undefined) {
        updateData.title = input.title;
      }

      if (input.description !== undefined) {
        updateData.description = input.description;
      }

      if (input.changes !== undefined) {
        updateData.changes = input.changes.map(change =>
          ChangeItem.create(change.type, change.description)
        );
      }

      const updatedPatchNote = existingPatchNote.update(updateData);

      const saveResult = await this._patchNoteRepository.update(updatedPatchNote);

      if (!saveResult.isSuccess) {
                return Failure.fail(saveResult.error);
      }

      await this._eventBus.publish(
        new PatchNoteUpdatedEvent(updatedPatchNote.id.value, [], input.appId)
      );

            return Success.ok(this.mapToOutput(updatedPatchNote));

    } catch (error) {
            return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  private mapToOutput(patchNote: PatchNote): PatchNoteOutput {
    return {
      id: patchNote.id.value,
      appId: patchNote.appId,
      version: patchNote.version.value,
      title: patchNote.title,
      description: patchNote.description || '',
      changes: patchNote.changes.map(change => ({
        type: change.type,
        description: change.description
      })),
      status: patchNote.status,
      createdAt: patchNote.createdAt.toISOString(),
      updatedAt: patchNote.updatedAt.toISOString(),
      publishedAt: patchNote.publishedAt?.toISOString(),
      scheduledFor: patchNote.scheduledFor?.toISOString(),
    };
  }
}
