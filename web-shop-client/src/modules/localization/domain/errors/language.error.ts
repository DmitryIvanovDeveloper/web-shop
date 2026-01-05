export class LanguageNotFoundError extends Error {
  constructor(languageCode: string) {
    super(`Language with code '${languageCode}' not found`);
    this.name = 'LanguageNotFoundError';
  }
}

export class LanguageAlreadyExistsError extends Error {
  constructor(languageCode: string) {
    super(`Language with code '${languageCode}' already exists`);
    this.name = 'LanguageAlreadyExistsError';
  }
}

export class UnsupportedLanguageError extends Error {
  constructor(languageCode: string) {
    super(`Language '${languageCode}' is not supported`);
    this.name = 'UnsupportedLanguageError';
  }
}

export class InvalidLanguageDirectionError extends Error {
  constructor(direction: string) {
    super(`Invalid language direction: ${direction}. Must be 'ltr' or 'rtl'`);
    this.name = 'InvalidLanguageDirectionError';
  }
}
