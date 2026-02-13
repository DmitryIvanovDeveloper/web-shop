import type { IEvent } from '@application/ports/event-bus.port';
import { TranslationMap } from './localization-loaded.event';


export class LocalizationChangedEvent implements IEvent {
  public readonly type = 'LocalizationChangedEvent';

  constructor(
    public readonly translations: TranslationMap,
    public readonly languageCode: string,
    public readonly direction: 'ltr' | 'rtl'
  ) {}
}

