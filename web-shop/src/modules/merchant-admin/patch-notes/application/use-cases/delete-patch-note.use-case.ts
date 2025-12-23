import { inject, injectable } from 'inversify';
import { Success, Failure, type Result } from '../../../../../shared/result/result';
import type { Logger } from '../../../../../application/ports/logger.port';
import type { EventBus } from '../../../../../application/ports/event-bus.port';
import { TYPES } from '../../../../../infrastructure/bootstrap/types';
import { MERCHANT_ADMIN_PATCH_NOTES_TYPES } from '../../infrastructure/bootstrap/types';
import type { PatchNoteRepositoryPort } from '../ports/patch-note-repository.port';
import type { DeletePatchNoteInput } from '../types/patch-note.types';
import { PatchNoteId } from '../../domain/value-objects/patch-note-id';
import { PatchNoteNotFoundError } from '../../domain/errors/patch-note.error';
import { PatchNoteDeletedEvent } from '../../domain/events/patch-note.events';

@injectable()
export class DeletePatchNoteUseCase {
  constructor(
    @inject(MERCHANT_ADMIN_PATCH_NOTES_TYPES.PatchNoteRepository)
    private readonly _patchNoteRepository: PatchNoteRepositoryPort,
    @inject(TYPES.EventBus)
    private readonly _eventBus: EventBus,
    @inject(TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  async execute(input: DeletePatchNoteInput): Promise<Result<void, Error>> {
    this._logger.info('[DeletePatchNoteUseCase] Deleting patch note', { input });

    try {
      // Check if patch note exists
      const patchNoteId = PatchNoteId.fromString(input.id);
      const findResult = await this._patchNoteRepository.findById(patchNoteId, input.appId);

      if (!findResult.isSuccess) {
        this._logger.error('[DeletePatchNoteUseCase] Failed to find patch note', findResult.error);
        return Failure.fail(findResult.error);
      }

      if (!findResult.value) {
        return Failure.fail(new PatchNoteNotFoundError(input.id));
      }

      // Delete patch note
      const deleteResult = await this._patchNoteRepository.delete(patchNoteId, input.appId);

      if (!deleteResult.isSuccess) {
        this._logger.error('[DeletePatchNoteUseCase] Failed to delete patch note', deleteResult.error);
        return Failure.fail(deleteResult.error);
      }

      // Publish domain event
      await this._eventBus.publish(
        new PatchNoteDeletedEvent(input.id, findResult.value.version.value, input.appId)
      );

      this._logger.info('[DeletePatchNoteUseCase] Patch note deleted successfully', { patchNoteId: input.id });
      return Success.ok(undefined);

    } catch (error) {
      this._logger.error('[DeletePatchNoteUseCase] Unexpected error deleting patch note', { error });
      return Failure.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }
}
