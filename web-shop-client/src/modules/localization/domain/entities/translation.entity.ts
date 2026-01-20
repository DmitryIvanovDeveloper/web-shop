import { TranslationKey } from '../value-objects/translation-key';
import { LanguageCode } from '../value-objects/language-code';
import { EmptyTranslationError } from '../errors/translation.error';


export class Translation {
  public readonly id: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  private constructor(
    id: string,
    public readonly key: TranslationKey,
    public readonly languageCode: LanguageCode,
    public readonly value: string,
    public readonly isTranslated: boolean,
    createdAt: Date,
    updatedAt: Date,
    public readonly context?: string   ) {
    this.id = id;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  public static create(
    id: string,
    key: TranslationKey,
    languageCode: LanguageCode,
    value: string,
    context?: string
  ): Translation {
    const trimmedValue = value.trim();
    const isTranslated = trimmedValue.length > 0;

    if (isTranslated && trimmedValue.length === 0) {
      throw new EmptyTranslationError(key.value, languageCode.value);
    }

    return new Translation(
      id,
      key,
      languageCode,
      trimmedValue,
      isTranslated,
      new Date(),
      new Date(),
      context?.trim()
    );
  }

  public static fromDatabase(
    id: string,
    key: TranslationKey,
    languageCode: LanguageCode,
    value: string,
    isTranslated: boolean,
    context?: string,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ): Translation {
    return new Translation(
      id,
      key,
      languageCode,
      value,
      isTranslated,
      createdAt,
      updatedAt,
      context
    );
  }

  public updateValue(newValue: string): Translation {
    const trimmedValue = newValue.trim();
    const isTranslated = trimmedValue.length > 0;

    if (isTranslated && trimmedValue.length === 0) {
      throw new EmptyTranslationError(this.key.value, this.languageCode.value);
    }

    return new Translation(
      this.id,
      this.key,
      this.languageCode,
      trimmedValue,
      isTranslated,
      this.createdAt,
      new Date(),
      this.context
    );
  }

  public updateContext(newContext: string): Translation {
    return new Translation(
      this.id,
      this.key,
      this.languageCode,
      this.value,
      this.isTranslated,
      this.createdAt,
      new Date(),
      newContext.trim()
    );
  }

  public markAsTranslated(): Translation {
    if (!this.isTranslated && this.value.length === 0) {
      throw new EmptyTranslationError(this.key.value, this.languageCode.value);
    }

    return new Translation(
      this.id,
      this.key,
      this.languageCode,
      this.value,
      true,
      this.createdAt,
      new Date(),
      this.context
    );
  }

  public markAsUntranslated(): Translation {
    return new Translation(
      this.id,
      this.key,
      this.languageCode,
      '',
      false,
      this.createdAt,
      new Date(),
      this.context
    );
  }

  public isEmpty(): boolean {
    return !this.isTranslated || this.value.length === 0;
  }

  public equals(other: Translation): boolean {
    return this.key.equals(other.key) && this.languageCode.equals(other.languageCode);
  }

  public toString(): string {
    return `${this.key.value} (${this.languageCode.value}): "${this.value}"`;
  }
}
