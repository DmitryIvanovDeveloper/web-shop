import { inject, injectable } from 'inversify';
import { Result } from '@/shared/result/result';
import type { PatchNoteRepositoryPort } from '../ports/patch-note-repository.port';
import type { PatchNoteOutput } from '../types/patch-note.types';
import { MERCHANT_ADMIN_PATCH_NOTES_TYPES } from '../../infrastructure/bootstrap/types';
import { PatchNoteId } from '../../domain/value-objects/patch-note-id';
import { PatchNote } from '../../domain/entities/patch-note';

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
      
      const findResult = await this._patchNoteRepository.findById(PatchNoteId.fromString(input.id), input.appId);
      if (!findResult.isSuccess) {
        return Result.error(findResult.error!);
      }

      if (!findResult.value) {
        return Result.error(new Error('Patch note not found'));
      }

      const patchNote = findResult.value;

      if (patchNote.status === 'published') {
        return Result.error(new Error('Patch note is already published'));
      }

      const publishedPatchNote = new PatchNote(
        patchNote.id,
        patchNote.appId,
        patchNote.version,
        patchNote.title,
        patchNote.description,
        patchNote.changes,
        'published',
        patchNote.createdAt,
        new Date(),
        new Date(),
        patchNote.scheduledFor
      );

      const updateResult = await this._patchNoteRepository.update(publishedPatchNote);
      if (!updateResult.isSuccess) {
        return Result.error(updateResult.error!);
      }

      const updatedNote = updateResult.value!;

      const output: PatchNoteOutput = {
        id: updatedNote.id.value,
        appId: updatedNote.appId,
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

