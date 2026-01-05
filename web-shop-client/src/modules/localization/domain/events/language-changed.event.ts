import { BaseEvent } from '../../../../shared/events/example-events';
import { LanguageCode } from '../value-objects/language-code';
import { TextDirection } from '../value-objects/text-direction';

/**
 * LanguageChangedEvent
 * Published when the active language is changed
 */
export class LanguageChangedEvent extends BaseEvent {
  constructor(
    public readonly languageCode: LanguageCode,
    public readonly direction: TextDirection,
    public readonly previousLanguageCode?: LanguageCode
  ) {
    super('localization.language.changed', {
      languageCode: languageCode.value,
      direction: direction.value,
      previousLanguageCode: previousLanguageCode?.value
    }, 'localization');
  }
}
