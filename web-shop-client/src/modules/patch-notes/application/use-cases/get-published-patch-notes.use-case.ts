import { inject, injectable } from 'inversify';
import type { Result } from '../../../../shared/utils/result';
import type { PatchNoteRepositoryPort } from '../ports/patch-note-repository.port';
import type { PatchNoteOutput } from '../types/patch-note.types';
import { PATCH_NOTES_TYPES } from '../../infrastructure/bootstrap/types';

@injectable()
export class GetPublishedPatchNotesUseCase {
  constructor(
    @inject(PATCH_NOTES_TYPES.PatchNoteRepository)
    private readonly _patchNoteRepository: PatchNoteRepositoryPort
  ) {}

  async execute(): Promise<Result<PatchNoteOutput[], Error>> {
    try {
      const result = await this._patchNoteRepository.findPublished();

      if (!result.isSuccess) {
        return Result.fail(result.error);
      }

      // Sort by published date (newest first)
      const sortedNotes = result.data.sort((a, b) => {
        const dateA = a.publishedAt || new Date(0);
        const dateB = b.publishedAt || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });

      const outputs = sortedNotes.map(note => this.mapToOutput(note));

      return Result.success(outputs);

    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unknown error'));
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
