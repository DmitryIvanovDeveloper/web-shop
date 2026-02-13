import { inject, injectable } from 'inversify';
import { Result } from '../../../../shared/result/result';
import type { PatchNoteRepositoryPort } from '../ports/patch-note-repository.port';
import type { PatchNoteOutput } from '../types/patch-note.types';
import { PATCH_NOTES_TYPES } from '../../infrastructure/bootstrap/types';
import { PatchNote } from '../../domain/entities/patch-note';

@injectable()
export class GetPublishedPatchNotesUseCase {
  constructor(
    @inject(PATCH_NOTES_TYPES.PatchNoteRepository)
    private readonly _patchNoteRepository: PatchNoteRepositoryPort
  ) {}

  async execute(appId: string): Promise<Result<PatchNoteOutput[], Error>> {
    try {
      const result = await this._patchNoteRepository.findPublished(appId);

      if (result instanceof Failure) {
        return result;
      }

            const patchNotes: PatchNote[] = (result as Success<PatchNote[]>).data || [];
      const sortedNotes = patchNotes.sort((a: PatchNote, b: PatchNote) => {
        const dateA = a.publishedAt || new Date(0);
        const dateB = b.publishedAt || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });

      const outputs = sortedNotes.map((note: PatchNote) => this.mapToOutput(note));

      return Result.ok(outputs);

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
