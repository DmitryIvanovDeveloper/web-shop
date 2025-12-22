import type { PatchNoteId } from '../../domain/value-objects/patch-note-id';
import type { Version } from '../../domain/value-objects/version';
import type { ChangeItem } from '../../domain/entities/change-item';

export interface CreatePatchNoteInput {
  version: string;
  title: string;
  description: string;
  changes: Array<{
    type: ChangeItem['type'];
    description: string;
  }>;
}

export interface UpdatePatchNoteInput {
  id: string;
  title?: string;
  description?: string;
  changes?: Array<{
    type: ChangeItem['type'];
    description: string;
  }>;
}

export interface PublishPatchNoteInput {
  id: string;
}

export interface SchedulePatchNoteInput {
  id: string;
  scheduledFor: Date;
}

export interface DeletePatchNoteInput {
  id: string;
}

export interface GetPatchNoteInput {
  id: string;
}

export interface ListPatchNotesInput {
  status?: 'draft' | 'published' | 'scheduled';
  limit?: number;
  offset?: number;
}

export interface PatchNoteOutput {
  id: string;
  version: string;
  title: string;
  description: string;
  changes: Array<{
    type: string;
    description: string;
  }>;
  status: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  scheduledFor?: string;
}
