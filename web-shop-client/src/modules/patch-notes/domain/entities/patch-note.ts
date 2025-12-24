import type { PatchNoteId } from '../value-objects/patch-note-id';
import type { Version } from '../value-objects/version';
import type { ChangeItem } from './change-item';
import {
  InvalidPatchNoteStatusError,
  InvalidScheduledDateError,
  PatchNoteValidationError
} from '../errors/patch-note.error';

export type PatchNoteStatus = 'draft' | 'published' | 'scheduled';

export class PatchNote {
  private constructor(
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
      throw new PatchNoteValidationError('title', 'cannot be empty');
    }

    if (!description || description.trim().length === 0) {
      throw new PatchNoteValidationError('description', 'cannot be empty');
    }

    if (!changes || changes.length === 0) {
      throw new PatchNoteValidationError('changes', 'must contain at least one change');
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

  static fromDatabase(
    id: PatchNoteId,
    appId: string,
    version: Version,
    title: string,
    description: string,
    changes: ChangeItem[],
    status: PatchNoteStatus,
    createdAt: Date,
    updatedAt: Date,
    publishedAt?: Date,
    scheduledFor?: Date
  ): PatchNote {
    return new PatchNote(
      id,
      appId,
      version,
      title,
      description,
      changes,
      status,
      createdAt,
      updatedAt,
      publishedAt,
      scheduledFor
    );
  }

  publish(): PatchNote {
    if (this.status !== 'draft') {
      throw new InvalidPatchNoteStatusError(this.status, 'publish');
    }

    const now = new Date();
    return new PatchNote(
      this.id,
      this.appId,
      this.version,
      this.title,
      this.description,
      this.changes,
      'published',
      this.createdAt,
      now,
      now
    );
  }

  schedule(publishDate: Date): PatchNote {
    if (this.status !== 'draft') {
      throw new InvalidPatchNoteStatusError(this.status, 'schedule');
    }

    if (publishDate <= new Date()) {
      throw new InvalidScheduledDateError();
    }

    const now = new Date();
    return new PatchNote(
      this.id,
      this.appId,
      this.version,
      this.title,
      this.description,
      this.changes,
      'scheduled',
      this.createdAt,
      now,
      undefined,
      publishDate
    );
  }

  update(updates: Partial<{
    title: string;
    description: string;
    changes: ChangeItem[];
  }>): PatchNote {
    if (this.status === 'published') {
      throw new InvalidPatchNoteStatusError(this.status, 'update');
    }

    const newTitle = updates.title !== undefined ? updates.title : this.title;
    const newDescription = updates.description !== undefined ? updates.description : this.description;
    const newChanges = updates.changes !== undefined ? updates.changes : this.changes;

    if (!newTitle || newTitle.trim().length === 0) {
      throw new PatchNoteValidationError('title', 'cannot be empty');
    }

    if (!newDescription || newDescription.trim().length === 0) {
      throw new PatchNoteValidationError('description', 'cannot be empty');
    }

    if (!newChanges || newChanges.length === 0) {
      throw new PatchNoteValidationError('changes', 'must contain at least one change');
    }

    return new PatchNote(
      this.id,
      this.appId,
      this.version,
      newTitle.trim(),
      newDescription.trim(),
      [...newChanges],
      this.status,
      this.createdAt,
      new Date(),
      this.publishedAt,
      this.scheduledFor
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
