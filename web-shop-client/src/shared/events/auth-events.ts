import { IEvent } from '../../infrastructure/events/event';

export class UserAuthenticatedEvent implements IEvent {
  public readonly type = 'UserAuthenticatedEvent';
  
  constructor(
    public readonly userId: string,
    public readonly username: string,
    public readonly appId: string
  ) {}
}
