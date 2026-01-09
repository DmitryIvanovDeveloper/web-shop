export abstract class LocalizationError extends Error {
  abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class LanguageNotFoundError extends LocalizationError {
  readonly code = 'LANGUAGE_NOT_FOUND';

  constructor(languageCode: string) {
    super(`Language with code '${languageCode}' not found`);
  }
}

export class LanguageAlreadyExistsError extends LocalizationError {
  readonly code = 'LANGUAGE_ALREADY_EXISTS';

  constructor(languageCode: string) {
    super(`Language with code '${languageCode}' already exists`);
  }
}

export class LanguageValidationError extends LocalizationError {
  readonly code = 'LANGUAGE_VALIDATION_ERROR';

  constructor(field: string, reason: string) {
    super(`Language validation failed for ${field}: ${reason}`);
  }
}

export class TranslationNotFoundError extends LocalizationError {
  readonly code = 'TRANSLATION_NOT_FOUND';

  constructor(key: string, languageCode: string) {
    super(`Translation for key '${key}' in language '${languageCode}' not found`);
  }
}

export class TranslationValidationError extends LocalizationError {
  readonly code = 'TRANSLATION_VALIDATION_ERROR';

  constructor(field: string, reason: string) {
    super(`Translation validation failed for ${field}: ${reason}`);
  }
}

export class TranslationKeyValidationError extends LocalizationError {
  readonly code = 'TRANSLATION_KEY_VALIDATION_ERROR';

  constructor(reason: string) {
    super(`Translation key validation failed: ${reason}`);
  }
}

export class LanguageCodeValidationError extends LocalizationError {
  readonly code = 'LANGUAGE_CODE_VALIDATION_ERROR';

  constructor(reason: string) {
    super(`Language code validation failed: ${reason}`);
  }
}

export class ActiveLanguageRequiredError extends LocalizationError {
  readonly code = 'ACTIVE_LANGUAGE_REQUIRED';

  constructor() {
    super('At least one language must be active');
  }
}

