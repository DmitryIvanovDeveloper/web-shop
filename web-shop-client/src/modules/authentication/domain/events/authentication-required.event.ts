import { IEvent } from '../../../../application/ports/event-bus.port';

/**
 * Event: Authentication Required
 * Published by: Products/Offers modules
 * Consumed by: Authentication module
 *
 * Triggered when unauthenticated user attempts to perform action requiring authentication
 */
export class AuthenticationRequiredEvent implements IEvent {
  public readonly type = 'AuthenticationRequiredEvent';

  constructor(
    public readonly sourceModule: 'products' | 'offers',
    public readonly action: 'purchase' | 'view',
    public readonly resourceId: string
  ) {}
}

