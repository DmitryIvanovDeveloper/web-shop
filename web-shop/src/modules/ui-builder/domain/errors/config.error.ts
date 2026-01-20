export class DraftConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DraftConfigError';
  }
}

export class ConfigValidationError extends Error {
  public readonly details: string[];
  constructor(message: string, details: string[] = []) {
    super(message);
    this.name = 'ConfigValidationError';
    this.details = details;
  }
}

export class ConfigSaveError extends Error {
  public readonly appId: string;
  constructor(appId: string, message: string) {
    super(message);
    this.name = 'ConfigSaveError';
    this.appId = appId;
  }
}

