import { IEvent } from '../../../../application/ports/event-bus.port';


export class AuthenticationRequiredEvent implements IEvent {
  public readonly type = 'AuthenticationRequiredEvent';

  constructor(
    public readonly sourceModule: 'products' | 'offers',
    public readonly action: 'purchase' | 'view',
    public readonly resourceId: string
  ) {}
}

