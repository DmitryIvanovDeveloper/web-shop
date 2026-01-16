import { IEvent } from '../../../../../application/ports/event-bus.port';
import { TranslationMap } from './localization-loaded.event';

/**
 * Event: Localization Changed
 * Published by: ChangeLocalizationUseCase
 * Consumed by: Modules that need to react to language changes
 *
 * Triggered when the active language is changed by user interaction
 */
export class LocalizationChangedEvent implements IEvent {
  public readonly type = 'LocalizationChangedEvent';

  constructor(
    public readonly translations: TranslationMap,
    public readonly languageCode: string,
    public readonly direction: 'ltr' | 'rtl'
  ) {}
}

