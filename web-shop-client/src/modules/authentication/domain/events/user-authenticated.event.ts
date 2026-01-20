import { IEvent } from '../../../../application/ports/event-bus.port';

export interface UserAuthenticatedEventMetadata {
  readonly isNewUser?: boolean;
  readonly lastActiveAt?: string; }


export class UserAuthenticatedEvent implements IEvent {
  public readonly type = 'UserAuthenticatedEvent';

  constructor(
    public readonly userId: string,
    public readonly username: string,
    public readonly appId: string,
    public readonly metadata?: UserAuthenticatedEventMetadata
  ) {}
}
