import 'reflect-metadata';
import { Container } from 'inversify';
import { EventBus } from '../../application/ports/event-bus.port';
import { HttpClient } from '../../application/ports/http-client.port';
import { Logger } from '../../application/ports/logger.port';
import { RealtimeClientPort } from '../../application/ports/realtime-client.port';
import { DatabaseClientPort } from '../../application/ports/database-client.port';
import { InMemoryEventBus } from '../event-bus/event-bus';
import { AxiosHttpClient } from '../http/http-client';
import { HttpClientMock } from '../http/http-client.mock';
import { HttpClientMode, resolveHttpClientMode, TYPES } from './types';
import { ConsoleLogger } from '../logging/console-logger';
import { MockRealtimeClient } from '../realtime/mock-realtime-client';
import { SupabaseClient } from '../database/supabase-client';
import { bindUIBuilder } from '@/modules/ui-builder/infrastructure/bootstrap/bind.ui-builder';
import { bindAppBuilder } from '@/modules/app-builder/infrastructure/bootstrap/bind.app-builder';
import { bindMerchantAdminOffers } from '@/modules/merchant-admin/offers/infrastructure/bootstrap/offers.container';
import { bindMerchantAdminProducts } from '@/modules/merchant-admin/products/infrastructure/bootstrap/products.container';
import { bindMerchantAdminPromoCodes } from '@/modules/merchant-admin/promo-codes/infrastructure/bootstrap/promo-codes.container';
import { bindMerchantAdminPatchNotes } from '@/modules/merchant-admin/patch-notes/infrastructure/bootstrap/patch-notes.container';
import { bindMerchantAdminProjects } from '@/modules/merchant-admin/projects/infrastructure/bootstrap/bind.projects';
import { bindDailyRewards } from '@/modules/merchant-admin/daily-rewards/infrastructure/bootstrap/bind.daily-rewards';
import { bindLocalization } from '../../modules/localization/infrastructure/bootstrap/bind.localization';
import { bindRealtimeDashboard } from '../../modules/merchant-admin/analytics/realtime-dashboard/infrastructure/bootstrap/realtime-dashboard.container';

const container = new Container();

container.bind<Logger>(TYPES.Logger).to(ConsoleLogger);

const mode = resolveHttpClientMode();
if (mode === HttpClientMode.Mock) {
  container.bind<HttpClient>(TYPES.HttpClient).to(HttpClientMock).inSingletonScope();
} else {
  container.bind<HttpClient>(TYPES.HttpClient).to(AxiosHttpClient).inSingletonScope();
}

container.bind<EventBus>(TYPES.EventBus).to(InMemoryEventBus).inSingletonScope();
container.bind<RealtimeClientPort>(TYPES.RealtimeClient).to(MockRealtimeClient).inSingletonScope();
container.bind<DatabaseClientPort>(TYPES.DatabaseClient).to(SupabaseClient).inSingletonScope();

bindUIBuilder(container);
bindAppBuilder(container);
bindMerchantAdminOffers(container);
bindMerchantAdminProducts(container);
bindMerchantAdminPatchNotes(container);
bindMerchantAdminProjects(container);
bindDailyRewards(container);
bindLocalization(container);
bindRealtimeDashboard(container);
bindMerchantAdminPromoCodes(container);

import { ProjectSelectedHandler } from '../handlers/project-selected.handler';
import { IAsyncEventHandler } from '../events/events-handler.plugin';
import { ProjectSelectedEvent } from '../../modules/merchant-admin/projects/domain';

container
  .bind<IAsyncEventHandler<ProjectSelectedEvent>>(
    Symbol.for('IAsyncEventHandler<ProjectSelectedEvent>')
  )
  .to(ProjectSelectedHandler)
  .inTransientScope();

export { container };
