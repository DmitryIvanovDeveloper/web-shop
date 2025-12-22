import { DomainEvent } from '../../../../../shared/domain/domain-event';

export class PatchNoteCreatedEvent extends DomainEvent {
  constructor(
    public readonly patchNoteId: string,
    public readonly version: string,
    public readonly title: string
  ) {
    super('PatchNoteCreatedEvent');
  }
}

export class PatchNoteUpdatedEvent extends DomainEvent {
  constructor(
    public readonly patchNoteId: string,
    public readonly changes: string[]
  ) {
    super('PatchNoteUpdatedEvent');
  }
}

export class PatchNoteDeletedEvent extends DomainEvent {
  constructor(
    public readonly patchNoteId: string,
    public readonly version: string
  ) {
    super('PatchNoteDeletedEvent');
  }
}
