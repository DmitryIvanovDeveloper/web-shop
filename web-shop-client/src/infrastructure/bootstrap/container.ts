import 'reflect-metadata';
import { Container } from 'inversify';
import { HttpClient } from '../../application/ports/http-client.port';
import { Logger } from '../../application/ports/logger.port';
import { RealtimeClientPort } from '../../application/ports/realtime-client.port';
import { EventBus as EventBusPort } from '../../application/ports/event-bus.port';
import type { DatabaseClientPort } from '../../application/ports/database-client.port';
import { EventBus } from '../events/event-bus';
import { AxiosHttpClient } from '../http/http-client';
import { HttpClientMock } from '../http/http-client.mock';
import { HttpClientMode, resolveHttpClientMode, TYPES } from './types';
import { ConsoleLogger } from '../logging/console-logger';
import { SupabaseClient } from '../database/supabase-client';
import { bindAuthentication } from '../../modules/authentication/infrastructure/bootstrap/bind.authentication';
import { bindAppLayout } from '../../modules/app-layout/infrastructure/bootstrap/bind.ui-renderer';
import { bindOffers } from '../../modules/offers/infrastructure/bootstrap/bind.offers';
import { bindPersonalOffers } from '../../modules/personal-offers/infrastructure/bootstrap/bind.personal-offers';
import { bindProducts } from '../../modules/products/infrastructure/bootstrap/bind.products';
import { bindPageRenderer } from '../../modules/page-renderer/infrastructure/bootstrap/bind.page-renderer';
import { bindUserOfferContext } from '../../modules/user-offer-context/infrastructure/bootstrap/bind.user-offer-context';
import { UIRendererService } from '../services/ui-renderer/ui-renderer.service';
import { UIComponentRegistry } from '../services/ui-renderer/component-registry.service';
import { UIStyleBuilder } from '../services/ui-renderer/style-builder.service';
import { UIActionHandler } from '../services/ui-renderer/action-handler.service';
import type { UIRendererPort } from '../../application/ports/ui-renderer.port';
import { LoadAppConfigUseCase } from '../../application/use-cases/load-app-config.use-case';
import { LoadAppConfigFromMessageUseCase } from '../../application/use-cases/load-app-config-from-message.use-case';
import { SupabaseConfigLoader } from '../config/supabase-config-loader';
import { ConfigSubscriptionPort } from '../../application/ports/config-subscription.port';
import { SupabaseConfigSubscriptionAdapter } from '../config/supabase-config-subscription.adapter';
import { SubscribeToConfigUpdatesUseCase } from '../../application/use-cases/subscribe-to-config-updates.use-case';
import { UIConfigLoadedHandler } from '../handlers/ui-config-loaded.handler';
import { ApplyBackgroundOnConfigHandler } from '../handlers/apply-background-on-config.handler';
import { IAsyncEventHandler } from '../events/events-handler.plugin';
import { AppConfigLoadedEvent } from '../../shared/events/app-config-events';

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

// Register App Layout module
bindAppLayout(container);

// Register User Offer Context module
bindUserOfferContext(container);

// Register Offers module
bindOffers(container);

// Register Personal Offers module
bindPersonalOffers(container);

// Register Products module
bindProducts(container);

// Register Page Renderer module
bindPageRenderer(container);

// Register UI Renderer Service (universal infrastructure service)
container.bind(TYPES.UIComponentRegistry).to(UIComponentRegistry).inSingletonScope();
container.bind(TYPES.UIStyleBuilder).to(UIStyleBuilder).inSingletonScope();
container.bind(TYPES.UIActionHandler).to(UIActionHandler).inSingletonScope();
container.bind<UIRendererPort>(TYPES.UIRenderer).to(UIRendererService).inSingletonScope();

// App Config
container.bind(TYPES.SupabaseConfigLoader).to(SupabaseConfigLoader).inSingletonScope();
container.bind(TYPES.LoadAppConfig).to(LoadAppConfigUseCase).inSingletonScope();
container.bind(TYPES.LoadAppConfigFromMessage).to(LoadAppConfigFromMessageUseCase).inSingletonScope();

// Config Subscription for real-time updates
container.bind<ConfigSubscriptionPort>(TYPES.ConfigSubscriptionPort).to(SupabaseConfigSubscriptionAdapter).inSingletonScope();
container.bind(TYPES.SubscribeToConfigUpdates).to(SubscribeToConfigUpdatesUseCase).inSingletonScope();

// UI Handler for AppConfigLoadedEvent (dispatches window event for UI components)
container
  .bind<IAsyncEventHandler<AppConfigLoadedEvent>>(
    Symbol.for('IAsyncEventHandler<AppConfigLoadedEvent>')
  )
  .to(UIConfigLoadedHandler)
  .inTransientScope();

container
  .bind<IAsyncEventHandler<AppConfigLoadedEvent>>(
    Symbol.for('IAsyncEventHandler<AppConfigLoadedEvent>')
  )
  .to(ApplyBackgroundOnConfigHandler)
  .inTransientScope();

export { container };
