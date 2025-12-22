import type { PatchNoteId } from '../value-objects/patch-note-id';
import type { Version } from '../value-objects/version';
import type { ChangeItem } from './change-item';

export type PatchNoteStatus = 'draft' | 'published' | 'scheduled';

export class PatchNote {
  constructor(
    public readonly id: PatchNoteId,
    public readonly appId: string,
    public readonly version: Version,
    public readonly title: string,
    public readonly description: string,
    public readonly changes: readonly ChangeItem[],
    public readonly status: PatchNoteStatus,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly publishedAt?: Date,
    public readonly scheduledFor?: Date
  ) {}

  static create(
    id: PatchNoteId,
    appId: string,
    version: Version,
    title: string,
    description: string,
    changes: ChangeItem[]
  ): PatchNote {
    if (!title || title.trim().length === 0) {
      throw new Error('Title cannot be empty');
    }

    if (!description || description.trim().length === 0) {
      throw new Error('Description cannot be empty');
    }

    if (!changes || changes.length === 0) {
      throw new Error('Changes must contain at least one item');
    }

    const now = new Date();
    return new PatchNote(
      id,
      appId,
      version,
      title.trim(),
      description.trim(),
      [...changes],
      'draft',
      now,
      now
    );
  }

  isPublished(): boolean {
    return this.status === 'published';
  }

  isScheduled(): boolean {
    return this.status === 'scheduled';
  }

  isDraft(): boolean {
    return this.status === 'draft';
  }

  canBePublished(): boolean {
    return this.status === 'draft';
  }

  canBeScheduled(): boolean {
    return this.status === 'draft';
  }

  canBeEdited(): boolean {
    return this.status !== 'published';
  }
}
