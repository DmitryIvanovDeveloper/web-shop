import { EventBus } from '../../application/ports/event-bus.port';
import { HttpClient } from '../../application/ports/http-client.port';
import { Logger } from '../../application/ports/logger.port';
import { RealtimeClientPort } from '../../application/ports/realtime-client.port';
import { InMemoryEventBus } from '../event-bus/event-bus';
import { AxiosHttpClient } from '../http/http-client';
import { HttpClientMock } from '../http/http-client.mock';
import { HttpClientMode, resolveHttpClientMode } from './types';
import { ConsoleLogger } from '../logging/console-logger';
import { MockRealtimeClient } from '../realtime/mock-realtime-client';

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
    const logger = new ConsoleLogger();
    this.services.set('logger', logger);
    
    // Переключение клиента по enum/ENV
    const mode = resolveHttpClientMode();
    this.services.set('httpClient',
      mode === HttpClientMode.Mock
        ? new HttpClientMock('/mocks')
        : new AxiosHttpClient()
    );
    
    this.services.set('eventBus', new InMemoryEventBus());
    
    // Register realtime client (mock for now)
    this.services.set('realtimeClient', new MockRealtimeClient(logger));
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

  public getRealtimeClient(): RealtimeClientPort {
    return this.get<RealtimeClientPort>('realtimeClient');
  }
}
