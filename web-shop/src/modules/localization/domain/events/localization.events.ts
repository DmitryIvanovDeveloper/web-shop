import type { Language } from '../entities/language';
import type { Translation } from '../entities/translation';

export abstract class LocalizationEvent {
  constructor(
    public readonly occurredAt: Date = new Date()
  ) {}
}

export class LanguageActivatedEvent extends LocalizationEvent {
  constructor(
    public readonly languageCode: string,
    public readonly languageName: string
  ) {
    super();
  }
}

export class LanguageDeactivatedEvent extends LocalizationEvent {
  constructor(
    public readonly languageCode: string,
    public readonly languageName: string
  ) {
    super();
  }
}

export class TranslationUpdatedEvent extends LocalizationEvent {
  constructor(
    public readonly key: string,
    public readonly languageCode: string,
    public readonly newValue: string
  ) {
    super();
  }
}

export class TranslationCreatedEvent extends LocalizationEvent {
  constructor(
    public readonly key: string,
    public readonly languageCode: string,
    public readonly value: string
  ) {
    super();
  }
}

