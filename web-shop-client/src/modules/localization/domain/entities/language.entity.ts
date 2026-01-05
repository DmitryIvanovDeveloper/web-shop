import { LanguageCode } from '../value-objects/language-code';
import { TextDirection } from '../value-objects/text-direction';
import { InvalidLanguageDirectionError } from '../errors/language.error';

/**
 * Language Entity
 * Represents a language configuration in the system
 */
export class Language {
  public readonly id: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  private constructor(
    id: string,
    public readonly code: LanguageCode,
    public readonly name: string,
    public readonly nativeName: string,
    public readonly direction: TextDirection,
    public readonly isActive: boolean,
    createdAt: Date,
    updatedAt: Date,
    public readonly fallbackCode?: LanguageCode,
    public readonly flag?: string // emoji flag
  ) {
    this.id = id;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  public static create(
    id: string,
    code: LanguageCode,
    name: string,
    nativeName: string,
    direction: TextDirection,
    fallbackCode?: LanguageCode,
    flag?: string
  ): Language {
    this.validate(name, nativeName);

    return new Language(
      id,
      code,
      name.trim(),
      nativeName.trim(),
      direction,
      false, // new languages start as inactive
      new Date(),
      new Date(),
      fallbackCode,
      flag
    );
  }

  public static fromDatabase(
    id: string,
    code: LanguageCode,
    name: string,
    nativeName: string,
    direction: TextDirection,
    isActive: boolean,
    createdAt: Date,
    updatedAt: Date,
    fallbackCode?: LanguageCode,
    flag?: string
  ): Language {
    this.validate(name, nativeName);

    return new Language(
      id,
      code,
      name,
      nativeName,
      direction,
      isActive,
      createdAt,
      updatedAt,
      fallbackCode,
      flag
    );
  }

  private static validate(name: string, nativeName: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Language name cannot be empty');
    }
    if (!nativeName || nativeName.trim().length === 0) {
      throw new Error('Language native name cannot be empty');
    }
    if (name.length > 100 || nativeName.length > 100) {
      throw new Error('Language names cannot exceed 100 characters');
    }
  }

  public activate(): Language {
    return new Language(
      this.id,
      this.code,
      this.name,
      this.nativeName,
      this.direction,
      true,
      this.createdAt,
      new Date(),
      this.fallbackCode,
      this.flag
    );
  }

  public deactivate(): Language {
    return new Language(
      this.id,
      this.code,
      this.name,
      this.nativeName,
      this.direction,
      false,
      this.createdAt,
      new Date(),
      this.fallbackCode,
      this.flag
    );
  }

  public update(
    name?: string,
    nativeName?: string,
    fallbackCode?: LanguageCode,
    flag?: string
  ): Language {
    const newName = name !== undefined ? name : this.name;
    const newNativeName = nativeName !== undefined ? nativeName : this.nativeName;

    Language.validate(newName, newNativeName);

    return new Language(
      this.id,
      this.code,
      newName.trim(),
      newNativeName.trim(),
      this.direction,
      this.isActive,
      this.createdAt,
      new Date(),
      fallbackCode !== undefined ? fallbackCode : this.fallbackCode,
      flag !== undefined ? flag : this.flag
    );
  }

  public isRTL(): boolean {
    return this.direction.isRTL();
  }

  public isLTR(): boolean {
    return this.direction.isLTR();
  }

  public equals(other: Language): boolean {
    return this.code.equals(other.code);
  }
}
