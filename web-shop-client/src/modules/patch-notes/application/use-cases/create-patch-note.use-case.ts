import { inject, injectable } from 'inversify';
import { Result } from '../../../../shared/result/result';
import { TYPES } from '../../../../infrastructure/bootstrap/types';
import type { EventBus } from '../../../../application/ports/event-bus.port';
import type { PatchNoteRepositoryPort } from '../ports/patch-note-repository.port';
import type { CreatePatchNoteInput, PatchNoteOutput } from '../types/patch-note.types';
import { PatchNote } from '../../domain/entities/patch-note';
import { PatchNoteId } from '../../domain/value-objects/patch-note-id';
import { Version } from '../../domain/value-objects/version';
import { ChangeItem } from '../../domain/entities/change-item';
import { PatchNoteAlreadyExistsError } from '../../domain/errors/patch-note.error';
import { PatchNoteCreatedEvent } from '../../domain/events/patch-note.events';
import { PATCH_NOTES_TYPES } from '../../infrastructure/bootstrap/types';

@injectable()
export class CreatePatchNoteUseCase {
  constructor(
    @inject(PATCH_NOTES_TYPES.PatchNoteRepository)
    private readonly _patchNoteRepository: PatchNoteRepositoryPort,
    @inject(TYPES.EventBus)
    private readonly _eventBus: EventBus
  ) {}

  async execute(input: CreatePatchNoteInput): Promise<Result<PatchNoteOutput, Error>> {
    try {
            const existingPatchNote = await this._patchNoteRepository.findByVersion(
        Version.create(input.version),
        input.appId
      );

      if (existingPatchNote instanceof Success && existingPatchNote.data) {
        return Result.error(new PatchNoteAlreadyExistsError(input.version));
      }

            const patchNoteId = PatchNoteId.create();
      const version = Version.create(input.version);

      const changes = input.changes.map(change =>
        ChangeItem.create(change.type, change.description)
      );

            const patchNote = PatchNote.create(
        patchNoteId,
        input.appId,
        version,
        input.title,
        input.description,
        changes
      );

            const saveResult = await this._patchNoteRepository.save(patchNote);
      if (!saveResult.isSuccess) {
        return saveResult;
      }

            await this._eventBus.publish(
        new PatchNoteCreatedEvent(patchNoteId, input.version, input.title)
      );

            return Result.ok(this.mapToOutput(saveResult.value!));

    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  private mapToOutput(patchNote: PatchNote): PatchNoteOutput {
    return {
      id: patchNote.id.value,
      version: patchNote.version.value,
      title: patchNote.title,
      description: patchNote.description,
      changes: patchNote.changes.map(change => ({
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
