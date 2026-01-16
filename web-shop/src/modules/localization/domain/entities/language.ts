import type { LanguageCode } from '../value-objects/language-code';
import type { TextDirection } from '../value-objects/text-direction';
import { LanguageValidationError } from '../errors/localization.error';

export class Language {
  private constructor(
    public readonly code: LanguageCode,
    public readonly name: string,
    public readonly nativeName: string,
    public readonly direction: TextDirection,
    public readonly isActive: boolean,
    public readonly fallbackCode?: LanguageCode
  ) {}

  static create(
    code: LanguageCode,
    name: string,
    nativeName: string,
    direction: TextDirection,
    fallbackCode?: LanguageCode
  ): Language {
    if (!name || name.trim().length === 0) {
      throw new LanguageValidationError('name', 'cannot be empty');
    }

    if (!nativeName || nativeName.trim().length === 0) {
      throw new LanguageValidationError('nativeName', 'cannot be empty');
    }

    return new Language(code, name.trim(), nativeName.trim(), direction, false, fallbackCode);
  }

  static fromDatabase(
    code: LanguageCode,
    name: string,
    nativeName: string,
    direction: TextDirection,
    isActive: boolean,
    fallbackCode?: LanguageCode
  ): Language {
    return new Language(code, name, nativeName, direction, isActive, fallbackCode);
  }

  activate(): Language {
    return new Language(this.code, this.name, this.nativeName, this.direction, true, this.fallbackCode);
  }

  deactivate(): Language {
    return new Language(this.code, this.name, this.nativeName, this.direction, false, this.fallbackCode);
  }

  update(details: { name?: string; nativeName?: string; fallbackCode?: LanguageCode }): Language {
    const newName = details.name !== undefined ? details.name : this.name;
    const newNativeName = details.nativeName !== undefined ? details.nativeName : this.nativeName;
    const newFallbackCode = details.fallbackCode !== undefined ? details.fallbackCode : this.fallbackCode;

    if (!newName || newName.trim().length === 0) {
      throw new LanguageValidationError('name', 'cannot be empty');
    }

    if (!newNativeName || newNativeName.trim().length === 0) {
      throw new LanguageValidationError('nativeName', 'cannot be empty');
    }

    return new Language(this.code, newName.trim(), newNativeName.trim(), this.direction, this.isActive, newFallbackCode);
  }

  isRTL(): boolean {
    return this.direction.isRTL();
  }

  hasFallback(): boolean {
    return this.fallbackCode !== undefined;
  }
}


