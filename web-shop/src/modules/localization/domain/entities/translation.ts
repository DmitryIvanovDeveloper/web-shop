import type { TranslationKey } from '../value-objects/translation-key';
import type { LanguageCode } from '../value-objects/language-code';
import { TranslationValidationError } from '../errors/localization.error';

export class Translation {
  private constructor(
    public readonly key: TranslationKey,
    public readonly languageCode: LanguageCode,
    public readonly value: string,
    public readonly isTranslated: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static create(
    key: TranslationKey,
    languageCode: LanguageCode,
    value: string
  ): Translation {
    if (!value || value.trim().length === 0) {
      throw new TranslationValidationError('value', 'cannot be empty');
    }

    const now = new Date();
    return new Translation(key, languageCode, value.trim(), true, now, now);
  }

  static fromDatabase(
    key: TranslationKey,
    languageCode: LanguageCode,
    value: string,
    isTranslated: boolean,
    createdAt: Date,
    updatedAt: Date
  ): Translation {
    return new Translation(key, languageCode, value, isTranslated, createdAt, updatedAt);
  }

  updateValue(newValue: string): Translation {
    if (!newValue || newValue.trim().length === 0) {
      throw new TranslationValidationError('value', 'cannot be empty');
    }

    return new Translation(
      this.key,
      this.languageCode,
      newValue.trim(),
      true,
      this.createdAt,
      new Date()
    );
  }

  markAsUntranslated(): Translation {
    return new Translation(
      this.key,
      this.languageCode,
      this.value,
      false,
      this.createdAt,
      new Date()
    );
  }

  markAsTranslated(): Translation {
    return new Translation(
      this.key,
      this.languageCode,
      this.value,
      true,
      this.createdAt,
      new Date()
    );
  }

  getModule(): string {
    return this.key.getModule();
  }

  getField(): string {
    return this.key.getField();
  }

  isOutdated(): boolean {
    // Consider translation outdated if not updated in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return this.updatedAt < thirtyDaysAgo;
  }
}

