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
    
    const finalTitle = title || 'Untitled';
    const finalDescription = description || '';

    const finalChanges = changes || [];

    const now = new Date();
    return new PatchNote(
      id,
      appId,
      version,
      finalTitle.trim(),
      finalDescription.trim(),
      [...finalChanges],
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

  update(updates: Partial<{ title: string; description: string; changes: ChangeItem[] }>): PatchNote {
    if (!this.canBeEdited()) {
      throw new Error('Cannot edit published patch note');
    }

    return new PatchNote(
      this.id,
      this.appId,
      this.version,
      updates.title ?? this.title,
      updates.description ?? this.description,
      updates.changes ?? this.changes,
      this.status,
      this.createdAt,
      new Date(), 
      this.publishedAt,
      this.scheduledFor
    );
  }
}
