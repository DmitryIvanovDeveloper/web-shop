import 'reflect-metadata';
import { Container } from 'inversify';
import { HttpClient } from '../../application/ports/http-client.port';
import { Logger } from '../../application/ports/logger.port';
import { RealtimeClientPort } from '../../application/ports/realtime-client.port';
import { EventBus as EventBusPort } from '../../application/ports/event-bus.port';
import { DatabaseClientPort } from '../../application/ports/database-client.port';
import { EventBus } from '../events/event-bus';
import { AxiosHttpClient } from '../http/http-client';
import { HttpClientMock } from '../http/http-client.mock';
import { HttpClientMode, resolveHttpClientMode, TYPES } from './types';
import { ConsoleLogger } from '../logging/console-logger';
import { SupabaseClient } from '../database/supabase-client';
import { bindAuthentication } from '../../modules/authentication/infrastructure/bootstrap/bind.authentication';
import { bindUIRenderer } from '../../modules/ui-renderer/infrastructure/bootstrap/bind.ui-renderer';
import { bindOffers } from '../../modules/offers/infrastructure/bootstrap/bind.offers';
import { bindProducts } from '../../modules/products/infrastructure/bootstrap/bind.products';

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

container.bind<EventBusPort>(TYPES.EventBus).to(EventBus).inSingletonScope();

// Register Database Client (Supabase)
container.bind<DatabaseClientPort>(TYPES.DatabaseClient).to(SupabaseClient).inSingletonScope();

// Register Authentication module
bindAuthentication(container);

// Register UI Renderer module
bindUIRenderer(container);

// Register Offers module
bindOffers(container);

// Register Products module
bindProducts(container);


export { container };
