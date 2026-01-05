import { BaseEvent } from '../../../../shared/events/example-events';
import { LanguageCode } from '../value-objects/language-code';
import { TextDirection } from '../value-objects/text-direction';

/**
 * UserLanguageDetectedEvent
 * Published when user's preferred language is detected
 */
export class UserLanguageDetectedEvent extends BaseEvent {
  constructor(
    public readonly languageCode: LanguageCode,
    public readonly direction: TextDirection,
    public readonly source: 'browser' | 'url' | 'stored' | 'fallback'
  ) {
    super('localization.user.language.detected', {
      languageCode: languageCode.value,
      direction: direction.value,
      source
    }, 'localization');
  }
}
