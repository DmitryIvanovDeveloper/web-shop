import { BaseEvent } from '../../../../shared/events/example-events';
import { LanguageCode } from '../value-objects/language-code';
import { TextDirection } from '../value-objects/text-direction';

/**
 * TranslationsConfigEvent
 * Published when translations config is ready for modules to consume
 * Contains all translations, language code, and text direction for the active language
 */
export class TranslationsConfigEvent extends BaseEvent {
  constructor(
    public readonly translations: Record<string, string>,
    public readonly languageCode: LanguageCode,
    public readonly direction: TextDirection
  ) {
    super('localization.translations.config', {
      translations,
      languageCode: languageCode.value,
      direction: direction.value
    }, 'localization');
  }
}
