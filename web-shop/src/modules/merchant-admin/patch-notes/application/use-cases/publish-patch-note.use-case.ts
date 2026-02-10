import { inject, injectable } from 'inversify';
import type { Result } from '../../../../shared/result/result';
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
      
      const findResult = await this._patchNoteRepository.findById(input.id, input.appId);
      if (!findResult.isSuccess) {
        return Result.fail(findResult.error);
      }

      if (!findResult.value) {
        return Result.fail(new Error('Patch note not found'));
      }

      const patchNote = findResult.value;

      if (patchNote.status === 'published') {
        return { isSuccess: false, error: new Error('Patch note is already published') };
      }

      patchNote.status = 'published';
      patchNote.publishedAt = new Date();

      const updateResult = await this._patchNoteRepository.update(patchNote);
      if (!updateResult.isSuccess) {
        return Result.fail(updateResult.error);
      }

      const updatedNote = updateResult.value;

      const output: PatchNoteOutput = {
        id: updatedNote.id.value,
        version: updatedNote.version.value,
        title: updatedNote.title,
        description: updatedNote.description,
        changes: updatedNote.changes.map((change: any) => ({
          type: change.type,
          description: change.description
        })),
        status: updatedNote.status,
        createdAt: updatedNote.createdAt.toISOString(),
        updatedAt: updatedNote.updatedAt.toISOString(),
        publishedAt: updatedNote.publishedAt?.toISOString(),
        scheduledFor: updatedNote.scheduledFor?.toISOString()
      };

      return Result.ok(output);

    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unknown error'));
    }
  }
}

