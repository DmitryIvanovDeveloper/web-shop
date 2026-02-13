import { inject, injectable } from 'inversify';
import { Result } from '@/shared/result/result';
import { OFFER_TYPES } from '../../infrastructure/bootstrap/offers.types';
import type {
  OfferCategoryGroupViewModel,
  OfferScenarioDetailViewModel,
  OfferScenarioListItemViewModel,
  OffersPageViewModel,
} from '../view-models/offers.view-model';
import { initialOffersPageViewModel } from '../view-models/offers.view-model';
import type { Logger } from '../../../../../application/ports/logger.port';
import { ROOT_TYPES } from '../../../../../infrastructure/bootstrap/types';
import type { LoadOfferScenariosUseCase } from '../../application/use-cases/load-offer-scenarios.use-case';
import type { UpdateScenarioConfigUseCase } from '../../application/use-cases/update-scenario-config.use-case';
import type { SyncOfferRuleTreeUseCase } from '../../application/use-cases/sync-offer-rule-tree.use-case';
import type { LoadProductsUseCase } from '../../application/use-cases/load-products.use-case';
import type { OfferScenario } from '../../domain/entities/offer-scenario.entity';
import type { OfferScenarioConfigurationProps } from '../../domain/entities/offer-scenario-configuration.entity';
import type { OfferRuleTree } from '../../domain/types/offer-rule-tree.type';
import type { Product } from '../../application/ports/product-query-service.port';
import type { OfferItemProps } from '../../domain/value-objects/offer-item.value-object';

interface LoadResult {
  readonly scenarios: readonly OfferScenario[];
  readonly ruleTree: OfferRuleTree | null;
}

const TRIGGER_LABELS: Record<string, string> = {
  new_user_welcome: 'New user welcome',
  returning_no_purchase: 'Returning without purchases',
  inactive_30_days: 'Inactive 30+ days',
  low_activity: 'Low weekly activity',
  cancelled_subscription: 'Cancelled subscription',
  repeat_purchaser: 'At least 1 purchase',
  high_spender: 'High spender threshold',
  first_payment: 'First payment completed',
  lifetime_spend_milestone: 'Lifetime spend milestone',
  frequent_weekly_purchases: 'Weekly purchase streak',
  repeat_product_view: 'Repeated product view',
  abandoned_cart: 'Abandoned cart',
  category_view_intent: 'Category intent detected',
  high_income_region: 'High income region',
  price_sensitive_region: 'Price sensitive region',
  mbc_app_user: 'MBC application user',
  monthly_to_yearly_upsell: 'Monthly to yearly upsell',
  influencer_promo_purchase: 'Influencer promo purchase',
  weekend_purchase: 'Weekend purchase window',
  high_activity_reward: 'High activity reward',
};

const TRIGGER_CONDITION_DESCRIPTIONS: Record<string, string> = {
  new_user_welcome: 'user.flags.isNew === true',
  returning_no_purchase: 'user.flags.isNew === false AND user.purchases.length === 0',
  inactive_30_days: 'user.metrics.daysSinceLastActive >= 30',
  low_activity: 'user.metrics.weeklySessions <= 2',
  cancelled_subscription: 'user.subscription.status === "cancelled"',
  repeat_purchaser: 'user.purchases.length >= 1',
  high_spender: 'user.metrics.totalSpend >= 100',
  first_payment: 'user.flags.isFirstPayment === true',
  lifetime_spend_milestone: 'user.metrics.milestoneSpendReached >= 1',
  frequent_weekly_purchases: 'user.metrics.weeklyPurchaseCount >= 3',
  repeat_product_view: 'behavior.recentProductViews >= 2',
  abandoned_cart: 'behavior.cart.status === "abandoned"',
  category_view_intent: 'behavior.categoryIntent === true',
  high_income_region: 'geo.segment === "high_income"',
  price_sensitive_region: 'geo.segment === "price_sensitive"',
  mbc_app_user: 'user.flags.isMbcAppUser === true',
  monthly_to_yearly_upsell: 'Monthly to yearly upsell condition',
  influencer_promo_purchase: 'Influencer promo purchase condition',
  weekend_purchase: 'Weekend purchase condition',
  high_activity_reward: 'High activity reward condition',
};

const CONDITION_USER_LABELS: Record<string, string> = {
  new_user_welcome: 'New User',
  returning_no_purchase: 'Returning User',
  inactive_30_days: 'Inactive 30+ Days',
  low_activity: 'Low Activity',
  cancelled_subscription: 'Cancelled Subscription',
  repeat_purchaser: 'Repeat Purchaser',
  high_spender: 'High Spender',
  first_payment: 'First Payment',
  lifetime_spend_milestone: 'Lifetime Spend Milestone',
  frequent_weekly_purchases: 'Frequent Weekly Purchases',
  repeat_product_view: 'Repeat Product View',
  abandoned_cart: 'Abandoned Cart',
  category_view_intent: 'Category View Intent',
  high_income_region: 'High Income Region',
  price_sensitive_region: 'Price Sensitive Region',
  mbc_app_user: 'MBC App User',
  monthly_to_yearly_upsell: 'Monthly to Yearly Upsell',
  influencer_promo_purchase: 'Influencer Promo Purchase',
  weekend_purchase: 'Weekend Purchase',
  high_activity_reward: 'High Activity Reward',
};

@injectable()
export class OffersPresenter {
  public readonly labels = {
    pageTitle: 'Offer Engine Scenarios',
    searchPlaceholder: 'Filter scenarios...',
    refresh: 'Refresh',
    publish: 'Publish rule tree',
    configuration: 'Configuration',
    actions: 'Actions',
    offers: 'Offer IDs',
    tags: 'Tags',
    priority: 'Priority',
    emptyState: 'No scenarios available',
    errorState: 'Unable to load scenarios',
    lastUpdated: 'Last synced',
    ruleTreeTitle: 'Rule Tree preview',
  };

  private _appId: string | null = null;
  private _scenarios: OfferScenario[] = [];
  private _ruleTree: OfferRuleTree | null = null;
  private _viewModel: OffersPageViewModel = initialOffersPageViewModel;
  private readonly _listeners = new Set<() => void>();
  private _isPublishing = false;

  public constructor(
    @inject(OFFER_TYPES.LoadOfferScenariosUseCase)
    private readonly _loadOfferScenariosUseCase: LoadOfferScenariosUseCase,
    @inject(OFFER_TYPES.UpdateScenarioConfigUseCase)
    private readonly _updateScenarioConfigUseCase: UpdateScenarioConfigUseCase,
    @inject(OFFER_TYPES.SyncOfferRuleTreeUseCase)
    private readonly _syncOfferRuleTreeUseCase: SyncOfferRuleTreeUseCase,
    @inject(OFFER_TYPES.LoadProductsUseCase)
    private readonly _loadProductsUseCase: LoadProductsUseCase,
    @inject(ROOT_TYPES.Logger)
    private readonly _logger: Logger
  ) {}

  public getViewModel(): OffersPageViewModel {
    return this._viewModel;
  }

  public subscribe(listener: () => void): () => void {
    this._listeners.add(listener);
    return () => {
      this._listeners.delete(listener);
    };
  }

  public async init(appId: string): Promise<void> {
    this._appId = appId;
    this._setViewModel({
      ...this._viewModel,
      isLoading: true,
      errorMessage: null,
    });

    const result = await this._safeLoadScenarios(appId, true);
    if (result.isFailure) {
      this._setViewModel({
        ...initialOffersPageViewModel,
        errorMessage: this.labels.errorState,
      });
      return;
    }

    this._applyLoadResult(result.value!);
  }

  public selectScenario(slug: string): void {
    const scenario = this._scenarios.find((item) => item.slug === slug);
    if (!scenario) {
      return;
    }
    this._setViewModel({
      ...this._viewModel,
      selectedScenario: this._toDetailViewModel(scenario),
    });
  }

  public async refresh(): Promise<void> {
    if (!this._appId) {
      return;
    }

    this._setViewModel({ ...this._viewModel, isLoading: true, errorMessage: null });

    const result = await this._safeLoadScenarios(this._appId, true);
    if (result.isFailure) {
      this._setViewModel({
        ...this._viewModel,
        isLoading: false,
        errorMessage: this.labels.errorState,
      });
      return;
    }

    this._applyLoadResult(result.value!);
  }

  public async updateScenarioConfiguration(
    slug: string,
    configuration: OfferScenarioConfigurationProps
  ): Promise<void> {
    if (!this._appId) {
      return;
    }

    const currentScenario = this._scenarios.find((s) => s.slug === slug);
    
    const result = await this._updateScenarioConfigUseCase.execute({
      appId: this._appId,
      slug,
      configuration,
    });

    if (result.isFailure) {
      this._setViewModel({
        ...this._viewModel,
        errorMessage: result.error?.message ?? 'Update failed',
      });
      return;
    }

    const updatedScenario = result.value!.scenario;

    this._scenarios = this._scenarios.map((scenario) =>
      scenario.slug === updatedScenario.slug ? updatedScenario : scenario
    );

    const shouldUpdateViewModel = this._viewModel.selectedScenario?.slug === slug;
    
    if (shouldUpdateViewModel) {
      this._setViewModel({
        ...this._viewModel,
        categories: this._buildCategoryGroups(),
        selectedScenario: this._toDetailViewModel(updatedScenario),
        errorMessage: null,
      });
    }
  }

  public async loadProducts(): Promise<Product[]> {
    this._setViewModel({
      ...this._viewModel,
      isLoadingProducts: true,
    });

    const result = await this._loadProductsUseCase.execute({
      appId: 'APP123',
    });

    if (result.isFailure) {
      this._setViewModel({
        ...this._viewModel,
        isLoadingProducts: false,
        products: [],
      });
      return [];
    }

    const products = [...(result.value!.products ?? [])];
    this._setViewModel({
      ...this._viewModel,
      isLoadingProducts: false,
      products,
    });

    return products;
  }

  public getAvailableConditions(triggerCode?: string): Array<{ triggerCode: string; label: string; description: string }> {

    if (triggerCode) {
      const condition = {
        triggerCode,
        label: CONDITION_USER_LABELS[triggerCode] ?? triggerCode,
        description: TRIGGER_CONDITION_DESCRIPTIONS[triggerCode] ?? '',
      };
      return [condition];
    }

    return Object.keys(CONDITION_USER_LABELS).map((code) => ({
      triggerCode: code,
      label: CONDITION_USER_LABELS[code] ?? code,
      description: TRIGGER_CONDITION_DESCRIPTIONS[code] ?? '',
    }));
  }

  public async updateScenarioProducts(slug: string, triggerCode: string, productIds: string[]): Promise<void> {
    if (!this._appId) {
      return;
    }

    const scenario = this._scenarios.find((s) => s.slug === slug);
    if (!scenario) {
            return;
    }

    if (triggerCode !== scenario.trigger.code) {
            return;
    }

    const allProducts = this._viewModel.products;

    const currentConfig = scenario.configuration.toProps();

    const existingCondition = currentConfig.conditions?.find((c) => c.triggerCode === triggerCode);
    const existingDiscounts: Record<string, string> = {};
    if (existingCondition?.items) {
      existingCondition.items
        .filter((item) => item.type === 'product')
        .forEach((item) => {
          const discount = item.metadata?.discount;
          if (discount && typeof discount === 'string') {
            existingDiscounts[item.id] = discount;
          }
        });
    }

    const items = productIds
      .map((productId) => {
        const product = allProducts.find((p) => p.id === productId);
        if (!product) {
          return null;
        }
        const metadata: Record<string, string | number | boolean> = { appid: product.appid };
        
        if (existingDiscounts[productId]) {
          metadata.discount = existingDiscounts[productId];
        }
        return {
          id: product.id,
          title: product.title,
          type: 'product' as const,
          metadata,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    let conditions = currentConfig.conditions
      ? currentConfig.conditions.filter((c) => c.triggerCode === scenario.trigger.code)
      : [];

    const existingConditionIndex = conditions.findIndex((c) => c.triggerCode === triggerCode);
    
    if (existingConditionIndex >= 0) {

      conditions[existingConditionIndex] = {
        triggerCode,
        offerIds: productIds, 
        items: items, 
      };
    } else {

      conditions.push({
        triggerCode,
        offerIds: productIds,
        items,
      });
    }

    const updatedConfiguration: OfferScenarioConfigurationProps = {
      ...currentConfig,
      conditions,

      offerIds: conditions.length === 0 && productIds.length > 0 
        ? productIds 
        : conditions.length > 0 
        ? [] 
        : currentConfig.offerIds.length > 0 
        ? currentConfig.offerIds 
        : [], 
    };

    const interimScenarioResult = scenario.withConfiguration(updatedConfiguration);
    if (interimScenarioResult.isFailure) {
      const errorMessage = interimScenarioResult.error?.message ?? 'Unknown error';
      this._setViewModel({
        ...this._viewModel,
        errorMessage,
      });
      return;
    }

    const interimScenario = interimScenarioResult.value!;
    this._scenarios = this._scenarios.map((scenario: OfferScenario) =>
      scenario.slug === slug ? interimScenario : scenario
    );

    if (this._viewModel.selectedScenario?.slug === slug) {
      this._setViewModel({
        ...this._viewModel,
        categories: this._buildCategoryGroups(),
        selectedScenario: this._toDetailViewModel(interimScenario),
        errorMessage: null,
      });
    }

    await this.updateScenarioConfiguration(slug, updatedConfiguration);
  }

  public async updateProductDiscount(slug: string, triggerCode: string, productId: string, discount: string): Promise<void> {
    if (!this._appId) {
      return;
    }

    const scenario = this._scenarios.find((s) => s.slug === slug);
    if (!scenario) {
            return;
    }

    if (triggerCode !== scenario.trigger.code) {
            return;
    }

    const currentConfig = scenario.configuration.toProps();

    let conditions = currentConfig.conditions
      ? currentConfig.conditions.filter((c) => c.triggerCode === scenario.trigger.code)
      : [];
    
    const existingConditionIndex = conditions.findIndex((c) => c.triggerCode === triggerCode);
    const allProducts = this._viewModel.products;
    const product = allProducts.find((p) => p.id === productId);
    
    if (!product) {
            return;
    }

    let conditionItems: OfferItemProps[] = [];

    if (existingConditionIndex >= 0) {
      
      const existingCondition = conditions[existingConditionIndex];
      conditionItems = (existingCondition.items ?? []).map((item) => {
        if (item.id === productId && item.type === 'product') {
          
          return {
            id: item.id,
            title: item.title,
            type: item.type,
            metadata: {
              ...item.metadata,
              discount: discount.trim(), 
            },
          };
        }
        return {
          id: item.id,
          title: item.title,
          type: item.type as 'product' | 'bundle' | 'currency' | 'cosmetic' | 'service',
          metadata: item.metadata ?? {},
        };
      });

      if (!conditionItems.some((item) => item.id === productId)) {
        conditionItems.push({
          id: product.id,
          title: product.title,
          type: 'product',
          metadata: {
            appid: product.appid,
            discount: discount.trim(),
          },
        });
      }

      conditions[existingConditionIndex] = {
        triggerCode,
        offerIds: existingCondition.offerIds,
        items: conditionItems,
      };
    } else {
      
      conditionItems = [
        {
          id: product.id,
          title: product.title,
          type: 'product',
          metadata: {
            appid: product.appid,
            discount: discount.trim(),
          },
        },
      ];
      conditions.push({
        triggerCode,
        offerIds: [productId],
        items: conditionItems,
      });
    }

    const updatedConfiguration: OfferScenarioConfigurationProps = {
      ...currentConfig,
      conditions,
      offerIds: conditions.length > 0 ? [] : currentConfig.offerIds,
    };

    const interimScenarioResult = scenario.withConfiguration(updatedConfiguration);
    if (interimScenarioResult.isFailure) {
      const errorMessage = interimScenarioResult.error?.message ?? 'Unknown error';
      this._setViewModel({
        ...this._viewModel,
        errorMessage,
      });
      return;
    }

    const interimScenario = interimScenarioResult.value!;
    this._scenarios = this._scenarios.map((scenario: OfferScenario) =>
      scenario.slug === slug ? interimScenario : scenario
    );

    await this.updateScenarioConfiguration(slug, updatedConfiguration);
  }

  public async publishRuleTree(): Promise<void> {
    if (!this._appId) {
      return;
    }

    if (this._isPublishing) {
      return;
    }

    this._isPublishing = true;
    try {
      const result = await this._syncOfferRuleTreeUseCase.execute({ appId: this._appId });

      if (result.isFailure) {
        this._setViewModel({
          ...this._viewModel,
          errorMessage: result.error?.message ?? 'Publish failed',
        });
        return;
      }

      this._ruleTree = result.value!.ruleTree;

      let ruleTreeJson: string;
      try {
        ruleTreeJson = JSON.stringify(this._ruleTree, null, 2);
      } catch (error) {
        
        let sizeEstimate = 0;
        try {
          
          const compact = JSON.stringify(this._ruleTree);
          sizeEstimate = compact.length;
        } catch {
          sizeEstimate = this._ruleTree.scenarios.length * 1000; 
        }
        
        this._setViewModel({
          ...this._viewModel,
          errorMessage: `Failed to serialize rule tree. Estimated size: ${(sizeEstimate / 1024 / 1024).toFixed(2)} MB, scenarios: ${this._ruleTree.scenarios.length}`,
        });
        ruleTreeJson = '{}';
      }
      
      this._setViewModel({
        ...this._viewModel,
        errorMessage: null,
        lastUpdatedAt: this._ruleTree.generatedAt,
        ruleTreeJson,
      });
    } finally {
      this._isPublishing = false;
    }
  }

  private async _safeLoadScenarios(appId: string, includeRuleTree: boolean): Promise<Result<LoadResult, Error>> {
    const loadResult = await this._loadOfferScenariosUseCase.execute({
      appId,
      includeRuleTree,
    });
    if (loadResult.isFailure) {
      return Result.error(loadResult.error!);
    }

    return Result.ok({
      scenarios: loadResult.value?.scenarios ?? [],
      ruleTree: loadResult.value?.ruleTree ?? null,
    });
  }

  private _applyLoadResult(result: LoadResult): void {
    this._scenarios = [...result.scenarios];
    this._ruleTree = result.ruleTree;

        const categories = this._buildCategoryGroups();
    const selectedScenario =
      this._viewModel.selectedScenario &&
      this._scenarios.some((scenario) => scenario.slug === this._viewModel.selectedScenario?.slug)
        ? this._toDetailViewModel(
            this._scenarios.find((scenario) => scenario.slug === this._viewModel.selectedScenario?.slug)!
          )
        : this._scenarios.length > 0
          ? this._toDetailViewModel(this._scenarios[0])
          : null;

    let ruleTreeJson: string | null = null;
    if (this._ruleTree) {
      try {
        ruleTreeJson = JSON.stringify(this._ruleTree, null, 2);
              } catch (error) {
        
        let sizeEstimate = 0;
        try {
          const compact = JSON.stringify(this._ruleTree);
          sizeEstimate = compact.length;
        } catch {
          sizeEstimate = this._ruleTree.scenarios.length * 1000; 
        }
        this._setViewModel({
          ...this._viewModel,
          errorMessage: `Failed to serialize rule tree. Estimated size: ${(sizeEstimate / 1024 / 1024).toFixed(2)} MB, scenarios: ${this._ruleTree.scenarios.length}`,
        });
        ruleTreeJson = '{}';
      }
    } else {
      ruleTreeJson = '{}';
    }

    this._setViewModel({
      ...this._viewModel,
      isLoading: false,
      errorMessage: null,
      totalScenarios: this._scenarios.length,
      categories,
      selectedScenario,
      lastUpdatedAt: this._ruleTree?.generatedAt ?? null,
      ruleTreeJson,
    });
  }

  private _buildCategoryGroups(): OfferCategoryGroupViewModel[] {
    const grouped = new Map<string, OfferCategoryGroupViewModel>();

    for (const scenario of this._scenarios) {
      const existing = grouped.get(scenario.category.code);
      const listItem = this._toListItemViewModel(scenario);

      if (existing) {
        grouped.set(scenario.category.code, {
          ...existing,
          scenarios: [...existing.scenarios, listItem],
        });
      } else {
        grouped.set(scenario.category.code, {
          code: scenario.category.code,
          title: scenario.category.title,
          description: scenario.category.description,
          scenarios: [listItem],
        });
      }
    }

    return Array.from(grouped.values()).map((group) => ({
      ...group,
      scenarios: [...group.scenarios].sort((a, b) => b.priority - a.priority),
    }));
  }

  private _toListItemViewModel(scenario: OfferScenario): OfferScenarioListItemViewModel {
    return {
      slug: scenario.slug,
      title: scenario.title,
      description: scenario.description,
      categoryTitle: scenario.category.title,
      categoryCode: scenario.category.code,
      triggerCode: scenario.trigger.code,
      triggerLabel: TRIGGER_LABELS[scenario.trigger.code] ?? scenario.trigger.code,
      conditionDescription: TRIGGER_CONDITION_DESCRIPTIONS[scenario.trigger.code],
      priority: scenario.priority,
      tags: scenario.tags,
      offerIds: [...scenario.configuration.offerIds],
    };
  }

  private _toDetailViewModel(scenario: OfferScenario): OfferScenarioDetailViewModel {
    const listItem = this._toListItemViewModel(scenario);
    const configurationProps = scenario.configuration.toProps();

    return {
      ...listItem,
      rulePreview: JSON.stringify(
        {
          slug: scenario.slug,
          trigger: scenario.trigger.code,
          offerIds: configurationProps.offerIds,
        },
        null,
        2
      ),
      config: {
        offerIds: configurationProps.offerIds,
        discount: configurationProps.discount
          ? {
              type: configurationProps.discount.type,
              value: configurationProps.discount.value,
              currency: configurationProps.discount.currency,
              minSpend: configurationProps.discount.minSpend,
            }
          : undefined,
        bonus: configurationProps.bonus
          ? {
              type: configurationProps.bonus.type,
              amount: configurationProps.bonus.amount,
              unit: configurationProps.bonus.unit,
              description: configurationProps.bonus.description,
            }
          : undefined,
        items: (configurationProps.items ?? []).map((item) => ({
          id: item.id,
          title: item.title,
          type: item.type,
          metadata: item.metadata ?? {},
        })),
        metadata: configurationProps.metadata ?? {},
        conditions: configurationProps.conditions
          ? configurationProps.conditions
              
              .filter((condition) => condition.triggerCode === scenario.trigger.code)
              .map((condition) => {
                const productItems = (condition.items ?? []).filter((item) => item.type === 'product');
                const productDiscounts: Record<string, string> = {};

                productItems.forEach((item) => {
                  const discount = item.metadata?.discount;
                  if (discount && typeof discount === 'string') {
                    productDiscounts[item.id] = discount;
                  }
                });

                return {
                  triggerCode: condition.triggerCode,
                  label: CONDITION_USER_LABELS[condition.triggerCode] ?? condition.triggerCode,
                  description: TRIGGER_CONDITION_DESCRIPTIONS[condition.triggerCode] ?? '',
                  offerIds: condition.offerIds,
                  productIds: productItems.map((item) => item.id),
                  productDiscounts,
                };
              })
          : undefined,
      },
    };
  }

  private _setViewModel(viewModel: OffersPageViewModel): void {
    this._viewModel = viewModel;
    this._notifyListeners();
  }

  private _notifyListeners(): void {
    this._listeners.forEach((listener) => {
      try {
        listener();
      } catch (error) {
      }
    });
  }
}





