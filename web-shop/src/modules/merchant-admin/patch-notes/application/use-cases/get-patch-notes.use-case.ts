import { inject, injectable } from 'inversify';
import { Success, Failure, type Result } from '../../../../../shared/result/result';
import type { PatchNoteRepositoryPort } from '../ports/patch-note-repository.port';
import type { ListPatchNotesInput, PatchNoteOutput } from '../types/patch-note.types';
import { PatchNote } from '../../domain/entities/patch-note';
import { MERCHANT_ADMIN_PATCH_NOTES_TYPES } from '../../infrastructure/bootstrap/types';

@injectable()
export class GetPatchNotesUseCase {
  constructor(
    @inject(MERCHANT_ADMIN_PATCH_NOTES_TYPES.PatchNoteRepository)
    private readonly _patchNoteRepository: PatchNoteRepositoryPort
  ) {}

  async execute(input: ListPatchNotesInput): Promise<Result<PatchNoteOutput[], Error>> {
    try {
      const result = await this._patchNoteRepository.findAll(input.appId, input.status);

      if (!result.isSuccess) {
        return Failure.fail(result.error);
      }

      // Sort by created date (newest first)
      const sortedNotes = result.data.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      const outputs = sortedNotes.map(note => this.mapToOutput(note));

      return Success.ok(outputs);

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
