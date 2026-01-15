import { IEvent } from '../../../../application/ports/event-bus.port';

export interface UserAuthenticatedEventMetadata {
  readonly isNewUser?: boolean;
  readonly lastActiveAt?: string; // Old last_active_at value (before update) for calculating daysSinceLastActive
}

/**
 * Event: User Authenticated
 * Published by: Authentication module
 * Consumed by: Multiple modules (products, offers, etc.)
 *
 * Triggered when user successfully authenticates
 */
export class UserAuthenticatedEvent implements IEvent {
  public readonly type = 'UserAuthenticatedEvent';

  constructor(
    public readonly userId: string,
    public readonly username: string,
    public readonly appId: string,
    public readonly metadata?: UserAuthenticatedEventMetadata
  ) {}
}
