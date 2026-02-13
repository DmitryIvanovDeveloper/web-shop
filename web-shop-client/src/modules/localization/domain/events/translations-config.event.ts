import type { IEvent } from '@application/ports/event-bus.port';
import { TranslationMap } from './localization-loaded.event';


export class TranslationsConfigEvent implements IEvent {
  public readonly type = 'TranslationsConfigEvent';

  constructor(
    public readonly translations: TranslationMap,
    public readonly languageCode: { value: string },
    public readonly direction: { value: 'ltr' | 'rtl' }
  ) {}
}