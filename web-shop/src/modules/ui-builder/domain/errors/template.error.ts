export class TemplateNotFoundError extends Error {
  constructor(templateId: string) {
    super(`Template not found: ${templateId}`);
    this.name = 'TemplateNotFoundError';
  }
}

export class TemplateNameAlreadyExistsError extends Error {
  constructor(name: string) {
    super(`Template with name "${name}" already exists`);
    this.name = 'TemplateNameAlreadyExistsError';
  }
}

export class TemplateValidationError extends Error {
  public readonly details: string[];

  constructor(message: string, details: string[] = []) {
    super(message);
    this.name = 'TemplateValidationError';
    this.details = details;
  }
}






