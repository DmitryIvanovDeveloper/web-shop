import { inject, injectable } from 'inversify';
import type { Result } from '../../../../../shared/result/result';
import type { PatchNoteRepositoryPort } from '../ports/patch-note-repository.port';
import type { PatchNoteOutput } from '../types/patch-note.types';
import { MERCHANT_ADMIN_PATCH_NOTES_TYPES } from '../../infrastructure/bootstrap/types';

export interface PublishPatchNoteInput {
  id: string;
  appId: string;
}

@injectable()
export class PublishPatchNoteUseCase {
  constructor(
    @inject(MERCHANT_ADMIN_PATCH_NOTES_TYPES.PatchNoteRepository)
    private readonly _patchNoteRepository: PatchNoteRepositoryPort
  ) {}

  async execute(input: PublishPatchNoteInput): Promise<Result<PatchNoteOutput, Error>> {
    try {
      // Find the patch note first
      const findResult = await this._patchNoteRepository.findById(input.id, input.appId);
      if (!findResult.isSuccess) {
        return findResult;
      }

      if (!findResult.data) {
        return { isSuccess: false, error: new Error('Patch note not found') };
      }

      const patchNote = findResult.data;

      // Check if it's already published
      if (patchNote.status === 'published') {
        return { isSuccess: false, error: new Error('Patch note is already published') };
      }

      // Update the patch note to published status
      patchNote.status = 'published';
      patchNote.publishedAt = new Date();

      const updateResult = await this._patchNoteRepository.update(patchNote);
      if (!updateResult.isSuccess) {
        return updateResult;
      }

      const updatedNote = updateResult.data;

      const output: PatchNoteOutput = {
        id: updatedNote.id.value,
        version: updatedNote.version.value,
        title: updatedNote.title,
        description: updatedNote.description,
        changes: updatedNote.changes.map(change => ({
          type: change.type,
          description: change.description
        })),
        status: updatedNote.status,
        createdAt: updatedNote.createdAt.toISOString(),
        updatedAt: updatedNote.updatedAt.toISOString(),
        publishedAt: updatedNote.publishedAt?.toISOString(),
        scheduledFor: updatedNote.scheduledFor?.toISOString()
      };

      return { isSuccess: true, data: output };

    } catch (error) {
      return { isSuccess: false, error: error instanceof Error ? error : new Error('Unknown error') };
    }
  }
}







