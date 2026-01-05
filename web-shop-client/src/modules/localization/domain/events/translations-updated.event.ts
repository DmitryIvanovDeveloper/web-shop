import { BaseEvent } from '../../../../shared/events/example-events';
import { LanguageCode } from '../value-objects/language-code';

/**
 * TranslationsUpdatedEvent
 * Published when translations are updated for a language
 */
export class TranslationsUpdatedEvent extends BaseEvent {
  constructor(
    public readonly languageCode: LanguageCode,
    public readonly updatedKeys: string[],
    public readonly totalTranslations: number
  ) {
    super('localization.translations.updated', {
      languageCode: languageCode.value,
      updatedKeys,
      totalTranslations
    }, 'localization');
  }
}
