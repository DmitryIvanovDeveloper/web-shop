import { IEvent } from '../../../../../application/ports/event-bus.port';

export interface TranslationMap {
  [key: string]: string;
}

/**
 * Event: Localization Loaded
 * Published by: LoadLocalizationUseCase
 * Consumed by: Modules that need localization data
 *
 * Triggered when localization data (translations, language, direction) is loaded at app startup
 */
export class LocalizationLoadedEvent implements IEvent {
  public readonly type = 'LocalizationLoadedEvent';

  constructor(
    public readonly translations: TranslationMap,
    public readonly languageCode: string,
    public readonly direction: 'ltr' | 'rtl'
  ) {}
}
