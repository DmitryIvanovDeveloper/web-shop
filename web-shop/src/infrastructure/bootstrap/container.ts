import 'reflect-metadata';
import { Container } from 'inversify';
import { EventBus } from '../../application/ports/event-bus.port';
import { HttpClient } from '../../application/ports/http-client.port';
import { Logger } from '../../application/ports/logger.port';
import { RealtimeClientPort } from '../../application/ports/realtime-client.port';
import { InMemoryEventBus } from '../event-bus/event-bus';
import { AxiosHttpClient } from '../http/http-client';
import { HttpClientMock } from '../http/http-client.mock';
import { HttpClientMode, resolveHttpClientMode, TYPES } from './types';
import { ConsoleLogger } from '../logging/console-logger';
import { MockRealtimeClient } from '../realtime/mock-realtime-client';
import { bindUIBuilder } from '@/modules/ui-builder/infrastructure/bootstrap/bind.ui-builder';

// Create Inversify container
const container = new Container();

// Register core services
container.bind<Logger>(TYPES.Logger).to(ConsoleLogger);

// Register HTTP client based on mode
const mode = resolveHttpClientMode();
if (mode === HttpClientMode.Mock) {
  container.bind<HttpClient>(TYPES.HttpClient).to(HttpClientMock).inSingletonScope();
} else {
  container.bind<HttpClient>(TYPES.HttpClient).to(AxiosHttpClient).inSingletonScope();
}

container.bind<EventBus>(TYPES.EventBus).to(InMemoryEventBus).inSingletonScope();
container.bind<RealtimeClientPort>(TYPES.RealtimeClient).to(MockRealtimeClient).inSingletonScope();

// Register UI Builder module
bindUIBuilder(container);

export { container };
