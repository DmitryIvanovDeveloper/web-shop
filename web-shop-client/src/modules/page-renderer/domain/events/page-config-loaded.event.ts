import type { IEvent } from '../../../../infrastructure/events/event';
import type { Event } from '../../../../application/ports/event-bus.port';
import type { PageConfig } from '../entities/page-config.entity';

/**
 * Event published when page configuration is loaded
 */
export class PageConfigLoadedEvent implements IEvent, Event {
  public readonly eventName = 'PageConfigLoadedEvent';
  public readonly type = 'PageConfigLoadedEvent';
  public readonly id: string;
  public readonly timestamp: Date;
  public readonly source = 'PageRenderer';
  public readonly payload: {
    pageConfig: PageConfig | null;
    appId: string;
    pageSlug: string;
  };
  
  constructor(
    public readonly pageConfig: PageConfig | null,
    public readonly appId: string,
    public readonly pageSlug: string
  ) {
    this.id = `${this.type}-${Date.now()}-${Math.random()}`;
    this.timestamp = new Date();
    this.payload = { pageConfig, appId, pageSlug };
  }
}

