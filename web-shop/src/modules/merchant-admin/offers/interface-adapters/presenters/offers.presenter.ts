import { inject, injectable } from 'inversify';
import { Result } from '../../../../../shared/domain/result/result';
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

  private appId: string | null = null;
  private scenarios: OfferScenario[] = [];
  private ruleTree: OfferRuleTree | null = null;
  private viewModel: OffersPageViewModel = initialOffersPageViewModel;
  private readonly listeners = new Set<() => void>();
  private isPublishing = false;

  public constructor(
    @inject(OFFER_TYPES.LoadOfferScenariosUseCase)
    private readonly loadOfferScenariosUseCase: LoadOfferScenariosUseCase,
    @inject(OFFER_TYPES.UpdateScenarioConfigUseCase)
    private readonly updateScenarioConfigUseCase: UpdateScenarioConfigUseCase,
    @inject(OFFER_TYPES.SyncOfferRuleTreeUseCase)
    private readonly syncOfferRuleTreeUseCase: SyncOfferRuleTreeUseCase,
    @inject(OFFER_TYPES.LoadProductsUseCase)
    private readonly loadProductsUseCase: LoadProductsUseCase,
    @inject(ROOT_TYPES.Logger)
    private readonly logger: Logger
  ) {}

  public getViewModel(): OffersPageViewModel {
    return this.viewModel;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public async init(appId: string): Promise<void> {
    this.appId = appId;
    this.setViewModel({
      ...this.viewModel,
      isLoading: true,
      errorMessage: null,
    });

    this.logger.info('[OffersPresenter] Initializing with appId:', appId);
    const result = await this.safeLoadScenarios(appId, true);
    if (result.isFailure()) {
      this.logger.error('[OffersPresenter] Failed to load scenarios', { error: result.error });
      this.setViewModel({
        ...initialOffersPageViewModel,
        errorMessage: this.labels.errorState,
      });
      return;
    }

    this.logger.info('[OffersPresenter] Loaded scenarios and rule tree:', {
      scenariosCount: result.data!.scenarios.length,
      hasRuleTree: !!result.data!.ruleTree,
      ruleTreeVersion: result.data!.ruleTree?.version,
    });

    this.applyLoadResult(result.data!);
  }

  public selectScenario(slug: string): void {
    const scenario = this.scenarios.find((item) => item.slug === slug);
    if (!scenario) {
      return;
    }
    this.setViewModel({
      ...this.viewModel,
      selectedScenario: this.toDetailViewModel(scenario),
    });
  }

  public async refresh(): Promise<void> {
    if (!this.appId) {
      return;
    }

    this.setViewModel({ ...this.viewModel, isLoading: true, errorMessage: null });

    const result = await this.safeLoadScenarios(this.appId, true);
    if (result.isFailure()) {
      this.logger.error('[OffersPresenter] Refresh failed', { error: result.error });
      this.setViewModel({
        ...this.viewModel,
        isLoading: false,
        errorMessage: this.labels.errorState,
      });
      return;
    }

    this.applyLoadResult(result.data!);
  }

  public async updateScenarioConfiguration(
    slug: string,
    configuration: OfferScenarioConfigurationProps
  ): Promise<void> {
    if (!this.appId) {
      return;
    }

    // Find current scenario in memory to preserve any in-memory updates
    const currentScenario = this.scenarios.find((s) => s.slug === slug);
    
    const result = await this.updateScenarioConfigUseCase.execute({
      appId: this.appId,
      slug,
      configuration,
    });

    if (result.isFailure()) {
      this.logger.error('[OffersPresenter] Scenario update failed', { error: result.error });
      this.setViewModel({
        ...this.viewModel,
        errorMessage: result.error?.message ?? 'Update failed',
      });
      return;
    }

    const updatedScenario = result.data!.scenario;
    
    // Use the updated scenario from the use case, which already has the new configuration applied
    // The use case applies the configuration via withConfiguration, so it should be up-to-date
    this.scenarios = this.scenarios.map((scenario) =>
      scenario.slug === updatedScenario.slug ? updatedScenario : scenario
    );

    // Only update viewModel if the selected scenario is the one we just updated
    // This prevents flickering when updating a different scenario
    const shouldUpdateViewModel = this.viewModel.selectedScenario?.slug === slug;
    
    if (shouldUpdateViewModel) {
      this.setViewModel({
        ...this.viewModel,
        categories: this.buildCategoryGroups(),
        selectedScenario: this.toDetailViewModel(updatedScenario),
        errorMessage: null,
      });
    }
  }

  public async loadProducts(): Promise<Product[]> {
    this.setViewModel({
      ...this.viewModel,
      isLoadingProducts: true,
    });

    const result = await this.loadProductsUseCase.execute({
      appId: 'APP123',
    });

    if (result.isFailure()) {
      this.logger.error('[OffersPresenter] Failed to load products', { error: result.error });
      this.setViewModel({
        ...this.viewModel,
        isLoadingProducts: false,
        products: [],
      });
      return [];
    }

    const products = [...(result.data!.products ?? [])];
    this.setViewModel({
      ...this.viewModel,
      isLoadingProducts: false,
      products,
    });

    return products;
  }

  public getAvailableConditions(triggerCode?: string): Array<{ triggerCode: string; label: string; description: string }> {
    // If triggerCode is provided, return only that condition
    // Otherwise return all conditions (for backward compatibility)
    if (triggerCode) {
      const condition = {
        triggerCode,
        label: CONDITION_USER_LABELS[triggerCode] ?? triggerCode,
        description: TRIGGER_CONDITION_DESCRIPTIONS[triggerCode] ?? '',
      };
      return [condition];
    }

    // Return all trigger codes from catalog with user-friendly labels
    return Object.keys(CONDITION_USER_LABELS).map((code) => ({
      triggerCode: code,
      label: CONDITION_USER_LABELS[code] ?? code,
      description: TRIGGER_CONDITION_DESCRIPTIONS[code] ?? '',
    }));
  }

  public async updateScenarioProducts(slug: string, triggerCode: string, productIds: string[]): Promise<void> {
    if (!this.appId) {
      return;
    }

    // Load current scenario
    const scenario = this.scenarios.find((s) => s.slug === slug);
    if (!scenario) {
      this.logger.error('[OffersPresenter] Scenario not found', { slug });
      return;
    }

    // Only allow updating condition that matches scenario's triggerCode
    if (triggerCode !== scenario.trigger.code) {
      this.logger.warn('[OffersPresenter] Cannot update condition that does not match scenario triggerCode', {
        slug,
        scenarioTriggerCode: scenario.trigger.code,
        requestedTriggerCode: triggerCode,
      });
      return;
    }

    // Get current products from viewModel
    const allProducts = this.viewModel.products;

    // Convert productIds to OfferItem[]
    const items = productIds
      .map((productId) => {
        const product = allProducts.find((p) => p.id === productId);
        if (!product) {
          return null;
        }
        return {
          id: product.id,
          title: product.title,
          type: 'product' as const,
          metadata: { appid: product.appid },
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    // Get current configuration
    const currentConfig = scenario.configuration.toProps();

    // Update or create conditions array
    // Filter out conditions that don't match scenario's triggerCode (cleanup old data)
    let conditions = currentConfig.conditions
      ? currentConfig.conditions.filter((c) => c.triggerCode === scenario.trigger.code)
      : [];
    
    // Find existing condition or create new one
    const existingConditionIndex = conditions.findIndex((c) => c.triggerCode === triggerCode);
    
    if (existingConditionIndex >= 0) {
      // Update existing condition
      // Allow empty arrays - user should be able to uncheck all products
      conditions[existingConditionIndex] = {
        triggerCode: triggerCode as any,
        offerIds: productIds, // Always use the provided productIds, even if empty
        items: items, // Always use the provided items, even if empty
      };
    } else {
      // Add new condition (should only happen if triggerCode matches scenario.trigger.code)
      // Allow empty arrays - user should be able to create a condition with no products
      conditions.push({
        triggerCode: triggerCode as any,
        offerIds: productIds,
        items,
      });
    }

    // Update configuration with conditions array
    // Ensure we always have either conditions or offerIds to pass validation
    const updatedConfiguration: OfferScenarioConfigurationProps = {
      ...currentConfig,
      conditions,
      // Keep backward compatibility: if no conditions, use single offerIds
      // If both are empty, keep at least empty arrays to pass validation
      offerIds: conditions.length === 0 && productIds.length > 0 
        ? productIds 
        : conditions.length > 0 
        ? [] // If we have conditions, offerIds can be empty
        : currentConfig.offerIds.length > 0 
        ? currentConfig.offerIds 
        : [], // Fallback to empty array
    };

    const interimScenarioResult = scenario.withConfiguration(updatedConfiguration);
    if (interimScenarioResult.isFailure()) {
      const errorMessage = interimScenarioResult.error?.message ?? 'Unknown error';
      this.logger.error('[OffersPresenter] Interim scenario update failed', {
        error: errorMessage,
        errorType: interimScenarioResult.error?.constructor?.name,
        slug,
        configuration: {
          hasConditions: (updatedConfiguration.conditions?.length ?? 0) > 0,
          conditionsCount: updatedConfiguration.conditions?.length ?? 0,
          hasOfferIds: (updatedConfiguration.offerIds?.length ?? 0) > 0,
          offerIdsCount: updatedConfiguration.offerIds?.length ?? 0,
        },
      });
      return;
    }

    const interimScenario = interimScenarioResult.data!;
    this.scenarios = this.scenarios.map((s) => (s.slug === slug ? interimScenario : s));
    
    // Optimistic update: immediately update viewModel only if this is the selected scenario
    // This ensures UI responds instantly to user interaction without causing flickering
    if (this.viewModel.selectedScenario?.slug === slug) {
      this.setViewModel({
        ...this.viewModel,
        categories: this.buildCategoryGroups(),
        selectedScenario: this.toDetailViewModel(interimScenario),
        errorMessage: null,
      });
    }
    
    // Save via API - this will update viewModel again with saved data
    // But since we already updated optimistically for the selected scenario, the UI won't flicker
    await this.updateScenarioConfiguration(slug, updatedConfiguration);
  }

  public async publishRuleTree(): Promise<void> {
    if (!this.appId) {
      return;
    }

    // Prevent concurrent publish operations
    if (this.isPublishing) {
      this.logger.warn('[OffersPresenter] Publish already in progress, skipping duplicate request');
      return;
    }

    this.isPublishing = true;
    try {
      const result = await this.syncOfferRuleTreeUseCase.execute({
        appId: this.appId,
      });

      if (result.isFailure()) {
        this.logger.error('[OffersPresenter] Rule tree publish failed', { error: result.error });
        this.setViewModel({
          ...this.viewModel,
          errorMessage: result.error?.message ?? 'Publish failed',
        });
        return;
      }

      this.ruleTree = result.data!.ruleTree;
      
      // Try to stringify, but handle case when rule tree is too large
      let ruleTreeJson: string;
      try {
        ruleTreeJson = JSON.stringify(this.ruleTree, null, 2);
      } catch (error) {
        // If stringify fails, estimate size using a safer method
        let sizeEstimate = 0;
        try {
          // Try compact JSON for size estimation
          const compact = JSON.stringify(this.ruleTree);
          sizeEstimate = compact.length;
        } catch {
          // If even compact fails, use a rough estimate based on structure
          sizeEstimate = this.ruleTree.scenarios.length * 1000; // Rough estimate per scenario
        }
        
        this.logger.warn('[OffersPresenter] Rule tree too large to stringify', {
          error: error instanceof Error ? error.message : String(error),
          estimatedSize: `${(sizeEstimate / 1024 / 1024).toFixed(2)} MB`,
          scenariosCount: this.ruleTree.scenarios.length,
        });
        ruleTreeJson = `// Rule tree is too large to display (estimated ${(sizeEstimate / 1024 / 1024).toFixed(2)} MB, ${this.ruleTree.scenarios.length} scenarios). Check server logs for details.`;
      }
      
      this.setViewModel({
        ...this.viewModel,
        errorMessage: null,
        lastUpdatedAt: this.ruleTree.generatedAt,
        ruleTreeJson,
      });
    } finally {
      this.isPublishing = false;
    }
  }

  private async safeLoadScenarios(appId: string, includeRuleTree: boolean): Promise<Result<LoadResult, Error>> {
    const loadResult = await this.loadOfferScenariosUseCase.execute({
      appId,
      includeRuleTree,
    });
    if (loadResult.isFailure()) {
      return Result.error(loadResult.error!);
    }

    return Result.ok({
      scenarios: loadResult.data?.scenarios ?? [],
      ruleTree: loadResult.data?.ruleTree ?? null,
    });
  }

  private applyLoadResult(result: LoadResult): void {
    this.scenarios = [...result.scenarios];
    this.ruleTree = result.ruleTree;

    this.logger.info('[OffersPresenter] Applying load result:', {
      scenariosCount: this.scenarios.length,
      hasRuleTree: !!this.ruleTree,
      ruleTreeScenariosCount: this.ruleTree?.scenarios.length ?? 0,
    });

    const categories = this.buildCategoryGroups();
    const selectedScenario =
      this.viewModel.selectedScenario &&
      this.scenarios.some((scenario) => scenario.slug === this.viewModel.selectedScenario?.slug)
        ? this.toDetailViewModel(
            this.scenarios.find((scenario) => scenario.slug === this.viewModel.selectedScenario?.slug)!
          )
        : this.scenarios.length > 0
          ? this.toDetailViewModel(this.scenarios[0])
          : null;

    // Format rule tree JSON for display
    let ruleTreeJson: string | null = null;
    if (this.ruleTree) {
      try {
        ruleTreeJson = JSON.stringify(this.ruleTree, null, 2);
        this.logger.info('[OffersPresenter] Rule tree JSON formatted successfully:', {
          jsonLength: ruleTreeJson.length,
          scenariosCount: this.ruleTree.scenarios.length,
        });
      } catch (error) {
        // If stringify fails, estimate size using a safer method
        let sizeEstimate = 0;
        try {
          const compact = JSON.stringify(this.ruleTree);
          sizeEstimate = compact.length;
        } catch {
          sizeEstimate = this.ruleTree.scenarios.length * 1000; // Rough estimate
        }
        this.logger.warn('[OffersPresenter] Rule tree too large to stringify', {
          estimatedSize: `${(sizeEstimate / 1024 / 1024).toFixed(2)} MB`,
          scenariosCount: this.ruleTree.scenarios.length,
        });
        ruleTreeJson = `// Rule tree is too large to display (estimated ${(sizeEstimate / 1024 / 1024).toFixed(2)} MB, ${this.ruleTree.scenarios.length} scenarios). Check server logs for details.`;
      }
    } else {
      this.logger.info('[OffersPresenter] No rule tree found, showing placeholder');
      ruleTreeJson = '// Rule tree not yet published';
    }

    this.setViewModel({
      ...this.viewModel,
      isLoading: false,
      errorMessage: null,
      totalScenarios: this.scenarios.length,
      categories,
      selectedScenario,
      lastUpdatedAt: this.ruleTree?.generatedAt ?? null,
      ruleTreeJson,
    });
  }

  private buildCategoryGroups(): OfferCategoryGroupViewModel[] {
    const grouped = new Map<string, OfferCategoryGroupViewModel>();

    for (const scenario of this.scenarios) {
      const existing = grouped.get(scenario.category.code);
      const listItem = this.toListItemViewModel(scenario);

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

  private toListItemViewModel(scenario: OfferScenario): OfferScenarioListItemViewModel {
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

  private toDetailViewModel(scenario: OfferScenario): OfferScenarioDetailViewModel {
    const listItem = this.toListItemViewModel(scenario);
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
              // Filter: only show conditions that match the scenario's triggerCode
              .filter((condition) => condition.triggerCode === scenario.trigger.code)
              .map((condition) => ({
                triggerCode: condition.triggerCode,
                label: CONDITION_USER_LABELS[condition.triggerCode] ?? condition.triggerCode,
                description: TRIGGER_CONDITION_DESCRIPTIONS[condition.triggerCode] ?? '',
                offerIds: condition.offerIds,
                productIds: (condition.items ?? [])
                  .filter((item) => item.type === 'product')
                  .map((item) => item.id),
              }))
          : undefined,
      },
    };
  }

  private setViewModel(viewModel: OffersPageViewModel): void {
    this.viewModel = viewModel;
    this.notifyListeners();
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (error) {
        this.logger.error('[OffersPresenter] Listener execution failed', { error });
      }
    });
  }
}
