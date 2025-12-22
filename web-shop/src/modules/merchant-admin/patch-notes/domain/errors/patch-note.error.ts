export abstract class PatchNoteError extends Error {
  abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class PatchNoteNotFoundError extends PatchNoteError {
  readonly code = 'PATCH_NOTE_NOT_FOUND';

  constructor(patchNoteId: string) {
    super(`Patch note with ID ${patchNoteId} not found`);
  }
}

export class PatchNoteAlreadyExistsError extends PatchNoteError {
  readonly code = 'PATCH_NOTE_ALREADY_EXISTS';

  constructor(version: string) {
    super(`Patch note with version ${version} already exists`);
  }
}

export class InvalidPatchNoteStatusError extends PatchNoteError {
  readonly code = 'INVALID_PATCH_NOTE_STATUS';

  constructor(currentStatus: string, attemptedAction: string) {
    super(`Cannot ${attemptedAction} patch note with status ${currentStatus}`);
  }
}

export class InvalidScheduledDateError extends PatchNoteError {
  readonly code = 'INVALID_SCHEDULED_DATE';

  constructor() {
    super('Scheduled date must be in the future');
  }
}

export class PatchNoteValidationError extends PatchNoteError {
  readonly code = 'PATCH_NOTE_VALIDATION_ERROR';

  constructor(field: string, reason: string) {
    super(`Validation failed for ${field}: ${reason}`);
  }
}
