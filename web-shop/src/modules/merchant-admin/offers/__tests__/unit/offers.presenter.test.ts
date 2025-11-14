import { describe, it, expect, vi } from 'vitest';
import { Result } from '../../../../shared/domain/result/result';
import type { OfferScenario } from '../../domain/entities/offer-scenario.entity';
import { OffersPresenter } from '../../interface-adapters/presenters/offers.presenter';
import type {
  LoadOfferScenariosUseCase,
  LoadOfferScenariosOutput,
} from '../../application/use-cases/load-offer-scenarios.use-case';
import type { UpdateScenarioConfigUseCase } from '../../application/use-cases/update-scenario-config.use-case';
import type { SyncOfferRuleTreeUseCase } from '../../application/use-cases/sync-offer-rule-tree.use-case';
import { OfferScenario as OfferScenarioEntity } from '../../domain/entities/offer-scenario.entity';

const createScenario = (slug: string, priority = 100): OfferScenario => {
  const result = OfferScenarioEntity.create({
    id: slug,
    slug,
    title: 'Scenario ' + slug,
    description: 'Scenario description',
    categoryCode: 'welcome_retention',
    triggerCode: 'new_user_welcome',
    priority,
    ruleSet: {
      operationType: 'action',
      action: { actionType: 'showOffer', params: { offerId: [slug] } },
    },
    defaultActions: ['discount'],
    configuration: {
      offerIds: [slug + '-offer'],
    },
  });

  if (result.isFailure()) {
    throw result.error;
  }
  return result.data!;
};

const loggerStub = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
} as any;

describe('OffersPresenter', () => {
  it('builds categories on init', async () => {
    const loadUseCaseStub = {
      execute: vi.fn(async () =>
        Result.ok<LoadOfferScenariosOutput, Error>({
          scenarios: [createScenario('welcome-new-user')],
          ruleTree: null,
        })
      ),
    } as unknown as LoadOfferScenariosUseCase;

    const updateUseCaseStub = {
      execute: vi.fn(),
    } as unknown as UpdateScenarioConfigUseCase;

    const syncUseCaseStub = {
      execute: vi.fn(async () => Result.ok({ ruleTree: null })),
    } as unknown as SyncOfferRuleTreeUseCase;

    const presenter = new OffersPresenter(
      loadUseCaseStub,
      updateUseCaseStub,
      syncUseCaseStub,
      loggerStub
    );

    await presenter.init('app-1');

    const viewModel = presenter.getViewModel();
    expect(viewModel.categories.length).toBeGreaterThan(0);
    expect(viewModel.categories[0].scenarios[0].slug).toBe('welcome-new-user');
  });
});











