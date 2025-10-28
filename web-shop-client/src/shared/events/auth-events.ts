import { IEvent } from '../../infrastructure/events/event';

export class UserAuthenticatedEvent implements IEvent {
  public readonly id: string;
  public readonly type = 'UserAuthenticatedEvent';
  public readonly timestamp: Date;
  public readonly source: string;
  public readonly payload: {
    userId: string;
    username: string;
    appId: string;
  };
  
  constructor(
    public readonly userId: string,
    public readonly username: string,
    public readonly appId: string
  ) {
    this.id = crypto.randomUUID();
    this.timestamp = new Date();
    this.source = 'authentication';
    this.payload = { userId, username, appId };
  }
}

/**
 * Event: Authentication Required
 * Published by: Products/Offers modules
 * Consumed by: Authentication module
 * 
 * Triggered when unauthenticated user attempts to perform action requiring authentication
 */
export class AuthenticationRequiredEvent implements IEvent {
  public readonly id: string;
  public readonly type = 'AuthenticationRequiredEvent';
  public readonly timestamp: Date;
  public readonly source: string;
  public readonly payload: {
    sourceModule: 'products' | 'offers';
    action: 'purchase' | 'view';
    resourceId: string;
  };
  
  constructor(
    sourceModule: 'products' | 'offers',
    action: 'purchase' | 'view',
    resourceId: string
  ) {
    this.id = crypto.randomUUID();
    this.timestamp = new Date();
    this.source = sourceModule;
    this.payload = {
      sourceModule,
      action,
      resourceId
    };
  }
}
