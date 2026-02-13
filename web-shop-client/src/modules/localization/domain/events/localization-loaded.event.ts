import type { IEvent } from '@application/ports/event-bus.port';

export interface TranslationMap {
  [key: string]: string;
}


export class LocalizationLoadedEvent implements IEvent {
  public readonly type = 'LocalizationLoadedEvent';

  constructor(
    public readonly translations: TranslationMap,
    public readonly languageCode: string,
    public readonly direction: 'ltr' | 'rtl'
  ) {}
}
