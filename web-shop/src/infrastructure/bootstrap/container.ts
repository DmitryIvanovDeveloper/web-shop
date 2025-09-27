import { EventBus } from '../../application/ports/event-bus.port';
import { HttpClient } from '../../application/ports/http-client.port';
import { Logger } from '../../application/ports/logger.port';
import { InMemoryEventBus } from '../event-bus/event-bus';
import { AxiosHttpClient } from '../http/http-client';
import { ConsoleLogger } from '../logging/console-logger';

export class Container {
  private static instance: Container;
  private services: Map<string, any> = new Map();

  private constructor() {
    this.initializeServices();
  }

  public static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  private initializeServices(): void {
    // Register core services
    this.services.set('logger', new ConsoleLogger());
    this.services.set('httpClient', new AxiosHttpClient());
    this.services.set('eventBus', new InMemoryEventBus());
  }

  public get<T>(serviceName: string): T {
    const service = this.services.get(serviceName);
    if (!service) {
      throw new Error(`Service ${serviceName} not found`);
    }
    return service as T;
  }

  public register<T>(serviceName: string, service: T): void {
    this.services.set(serviceName, service);
  }

  public getLogger(): Logger {
    return this.get<Logger>('logger');
  }

  public getHttpClient(): HttpClient {
    return this.get<HttpClient>('httpClient');
  }

  public getEventBus(): EventBus {
    return this.get<EventBus>('eventBus');
  }
}
