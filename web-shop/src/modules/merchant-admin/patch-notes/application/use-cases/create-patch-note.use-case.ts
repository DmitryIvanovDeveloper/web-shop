import { inject, injectable } from 'inversify';
import { Success, Failure, type Result } from '../../../../../shared/result/result';
import { TYPES } from '../../../../../infrastructure/bootstrap/types';
import type { EventBus } from '../../../../../application/ports/event-bus.port';
import type { PatchNoteRepositoryPort } from '../ports/patch-note-repository.port';
import type { CreatePatchNoteInput, PatchNoteOutput } from '../types/patch-note.types';
import { PatchNote } from '../../domain/entities/patch-note';
import { PatchNoteId } from '../../domain/value-objects/patch-note-id';
import { Version } from '../../domain/value-objects/version';
import { ChangeItem } from '../../domain/entities/change-item';
import { PatchNoteAlreadyExistsError } from '../../domain/errors/patch-note.error';
import { PatchNoteCreatedEvent } from '../../domain/events/patch-note.events';
import { MERCHANT_ADMIN_PATCH_NOTES_TYPES } from '../../infrastructure/bootstrap/types';

@injectable()
export class CreatePatchNoteUseCase {
  constructor(
    @inject(MERCHANT_ADMIN_PATCH_NOTES_TYPES.PatchNoteRepository)
    private readonly _patchNoteRepository: PatchNoteRepositoryPort,
    @inject(TYPES.EventBus)
    private readonly _eventBus: EventBus
  ) {}

  async execute(input: CreatePatchNoteInput): Promise<Result<PatchNoteOutput, Error>> {
    try {
      // Check if version already exists for this app
      const existingPatchNote = await this._patchNoteRepository.findByVersion(
        Version.create(input.version),
        input.appId
      );

      if (existingPatchNote.isSuccess && existingPatchNote.data) {
        return Failure.fail(new PatchNoteAlreadyExistsError(input.version));
      }

      // Create domain objects
      const patchNoteId = PatchNoteId.create();
      const version = Version.create(input.version);

      const changes = input.changes.map(change =>
        ChangeItem.create(change.type, change.description)
      );

      // Create patch note entity
      const patchNote = PatchNote.create(
        patchNoteId,
        input.appId,
        version,
        input.title,
        input.description,
        changes
      );

      // Save to repository
      const saveResult = await this._patchNoteRepository.save(patchNote);
      if (!saveResult.isSuccess) {
        return Failure.fail(saveResult.error);
      }

      // Publish domain event
      await this._eventBus.publish(
        new PatchNoteCreatedEvent(patchNoteId, input.version, input.title)
      );

      // Return output
      return Success.ok(this.mapToOutput(saveResult.data));

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
