export class TranslationNotFoundError extends Error {
  constructor(key: string, languageCode: string) {
    super(`Translation for key '${key}' in language '${languageCode}' not found`);
    this.name = 'TranslationNotFoundError';
  }
}

export class TranslationValidationError extends Error {
  constructor(key: string, reason: string) {
    super(`Translation validation failed for key '${key}': ${reason}`);
    this.name = 'TranslationValidationError';
  }
}

export class DuplicateTranslationError extends Error {
  constructor(key: string, languageCode: string) {
    super(`Translation for key '${key}' in language '${languageCode}' already exists`);
    this.name = 'DuplicateTranslationError';
  }
}

export class EmptyTranslationError extends Error {
  constructor(key: string, languageCode: string) {
    super(`Translation for key '${key}' in language '${languageCode}' cannot be empty`);
    this.name = 'EmptyTranslationError';
  }
}
