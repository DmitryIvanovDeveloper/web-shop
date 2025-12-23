import type { ChangeItem } from '../../domain/entities/change-item';

export interface CreatePatchNoteInput {
  appId: string;
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
  appId: string;
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
  appId: string;
}

export interface GetPatchNoteInput {
  id: string;
}

export interface ListPatchNotesInput {
  appId: string;
  status?: 'draft' | 'published' | 'scheduled';
  limit?: number;
  offset?: number;
}

export interface PatchNoteOutput {
  id: string;
  appId: string;
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
