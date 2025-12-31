import type { PatchNoteId } from '../value-objects/patch-note-id';

export abstract class PatchNoteEvent {
  constructor(
    public readonly patchNoteId: PatchNoteId,
    public readonly occurredAt: Date = new Date()
  ) {}
}

export class PatchNoteCreatedEvent extends PatchNoteEvent {
  constructor(
    patchNoteId: PatchNoteId,
    public readonly version: string,
    public readonly title: string
  ) {
    super(patchNoteId);
  }
}

export class PatchNoteUpdatedEvent extends PatchNoteEvent {
  constructor(
    patchNoteId: PatchNoteId,
    public readonly changes: Record<string, any>
  ) {
    super(patchNoteId);
  }
}

export class PatchNotePublishedEvent extends PatchNoteEvent {
  constructor(
    patchNoteId: PatchNoteId,
    public readonly version: string,
    public readonly publishedAt: Date
  ) {
    super(patchNoteId);
  }
}

export class PatchNoteScheduledEvent extends PatchNoteEvent {
  constructor(
    patchNoteId: PatchNoteId,
    public readonly scheduledFor: Date
  ) {
    super(patchNoteId);
  }
}

export class PatchNoteDeletedEvent extends PatchNoteEvent {
  constructor(
    patchNoteId: PatchNoteId,
    public readonly version: string
  ) {
    super(patchNoteId);
  }
}






