import { injectable, inject } from 'inversify';
import { OFFERS_TYPES } from '../../infrastructure/bootstrap/types';
import type { RulesRepositoryPort } from '../ports/rules-repository.port';
import type { OfferRepositoryPort } from '../ports/offer-repository.port';
import type { ConditionReaderPort } from '../ports/condition-reader.port';
import type { Operation, Condition, ValueDescriptor, ComparableValue, Offer, OfferRuleTreeScenario } from '../../domain/types';
import { InvalidRuleError, EvaluationError } from '../../domain/errors/offers.error';

export interface EvaluateOffersInput {
  readonly appId?: string;
  readonly userId?: string;
  readonly contextCache?: Map<string, ComparableValue>;
  readonly allowedScenarios?: readonly string[];
}

@injectable()
export class EvaluateOffersUseCase {
  constructor(
    @inject(OFFERS_TYPES.RulesRepository)
    private readonly rulesRepository: RulesRepositoryPort,
    @inject(OFFERS_TYPES.OfferRepository)
    private readonly offerRepository: OfferRepositoryPort,
    @inject(OFFERS_TYPES.ConditionReader)
    private readonly reader: ConditionReaderPort
  ) {}

  public async execute(input?: EvaluateOffersInput): Promise<Offer[]> {
    let ruleTree: import('../../domain/types').OfferRuleTree | null = null;
    try {
      ruleTree = (await this.rulesRepository.loadRules(input?.appId)) ?? null;
    } catch (error) {
      throw new EvaluationError(
        `[EvaluateOffersUseCase] Failed to load rules: ${(error as Error)?.message ?? String(error)}`
      );
    }

    if (!ruleTree) {
      return [];
    }

    const offersIds: string[] = [];
    const cache = input?.contextCache ?? new Map<string, ComparableValue>();

    // Sort scenarios by priority (highest first) before evaluation
    // This ensures we evaluate the most important scenarios first and stop at the first match
    const scenarios = (ruleTree.scenarios ?? []).slice().sort((a, b) => b.priority - a.priority);
    const allowedScenarios = input?.allowedScenarios;

    console.log('[EvaluateOffersUseCase] Evaluating scenarios (sorted by priority, highest first):', {
      totalScenarios: scenarios.length,
      scenarioPriorities: scenarios.map(s => ({ slug: s.slug, priority: s.priority })),
      allowedScenarios,
      hasAllowedScenarios: !!allowedScenarios && allowedScenarios.length > 0,
    });

    // Import TRIGGER_CONDITIONS from rule tree builder (we'll need to recreate it here)
    const TRIGGER_CONDITIONS: Record<string, () => Condition> = {
      new_user_welcome: () => ({
        conditionType: 'eq',
        value1: { type: 'property', value: 'user.flags.isNew' },
        value2: { type: 'value', value: true },
      }),
      returning_no_purchase: () => ({
        conditionType: 'and',
        conditions: [
          {
            conditionType: 'eq',
            value1: { type: 'property', value: 'user.flags.isNew' },
            value2: { type: 'value', value: false },
          },
          {
            conditionType: 'eq',
            value1: { type: 'property', value: 'user.purchases.length' },
            value2: { type: 'value', value: 0 },
          },
        ],
      }),
      inactive_30_days: () => ({
        conditionType: 'gte',
        value1: { type: 'property', value: 'user.metrics.daysSinceLastActive' },
        value2: { type: 'value', value: 30 },
      }),
      repeat_purchaser: () => ({
        conditionType: 'gte',
        value1: { type: 'property', value: 'user.purchases.length' },
        value2: { type: 'value', value: 1 },
      }),
      high_spender: () => ({
        conditionType: 'gte',
        value1: { type: 'property', value: 'user.metrics.totalSpend' },
        value2: { type: 'value', value: 2 }, // Temporarily changed from 100 to 2 (> 1 equivalent)
      }),
      // Add other trigger conditions as needed
    };

    // Track the first scenario that passed its condition (for discount application)
    let matchedScenario: OfferRuleTreeScenario | null = null;

    // Evaluate scenarios in priority order, stop at first match
    for (const scenario of scenarios) {
      // Filter by allowedScenarios if provided
      if (allowedScenarios && allowedScenarios.length > 0) {
        // Check if scenario slug matches any allowed scenario
        // For expanded scenarios like "welcome-new-user-returning_no_purchase", 
        // check if it starts with any allowed scenario slug
        const matches = allowedScenarios.some((allowed) => 
          scenario.slug === allowed || scenario.slug.startsWith(`${allowed}-`)
        );
        if (!matches) {
          console.log(`[EvaluateOffersUseCase] Skipping scenario ${scenario.slug} (not in allowedScenarios)`);
          continue;
        }
      }

      // Build condition for this scenario's triggerCode
      const buildCondition = TRIGGER_CONDITIONS[scenario.triggerCode];
      if (!buildCondition) {
        console.warn(`[EvaluateOffersUseCase] Unknown triggerCode: ${scenario.triggerCode}`);
        continue;
      }

      const condition = buildCondition();
      const conditionResult = await this.evaluateCondition(condition, cache, input?.appId, input?.userId);

      console.log(`[EvaluateOffersUseCase] Scenario ${scenario.slug} (${scenario.triggerCode}):`, {
        conditionResult,
        offerIds: scenario.offerIds,
      });

      if (conditionResult) {
        // Condition matched - this is the first (highest priority) scenario that passed
        // Collect offer IDs from scenario.offerIds only
        // Note: items is only used for discount metadata, not for offer IDs
        if (scenario.offerIds && scenario.offerIds.length > 0) {
          offersIds.push(...scenario.offerIds);
        }
        
        // Track this scenario for discount application
        matchedScenario = scenario;
        
        // Stop evaluation after first match (exclusive selection)
        console.log(`[EvaluateOffersUseCase] First matching scenario found: ${scenario.slug} (priority: ${scenario.priority}), stopping evaluation`);
        break;
      }
    }

    // Also evaluate the ruleSet for backward compatibility
    const evaluateOperation = async (operation?: Operation | null): Promise<void> => {
      if (!operation) {
        return;
      }
      if (operation.operationType === 'action') {
        if (operation.action?.actionType === 'showOffer') {
          const allowedScenarios = input?.allowedScenarios;
          const scenario = operation.action.params.scenario;
          if (allowedScenarios && allowedScenarios.length > 0) {
            if (!scenario || !allowedScenarios.includes(scenario)) {
              await evaluateOperation(operation.nextOperation);
              return;
            }
          }

          // Handle both string and array offerId
          const offerId = operation.action.params.offerId;
          if (Array.isArray(offerId)) {
            offersIds.push(...offerId);
          } else if (typeof offerId === 'string') {
            offersIds.push(offerId);
          }
        }
        await evaluateOperation(operation.nextOperation);
        return;
      }

      // condition
      if (!operation.condition) return;
      const result = await this.evaluateCondition(operation.condition, cache, input?.appId, input?.userId);
      if (result) {
        await evaluateOperation(operation.nextOperation);
      } else {
        await evaluateOperation(operation.elseOperation);
      }
    };

    await evaluateOperation(ruleTree.ruleSet);

    // Deduplicate offer IDs
    const uniqueOfferIds = [...new Set(offersIds)];

    console.log('[EvaluateOffersUseCase] Final offer IDs:', uniqueOfferIds);

    // Fetch offer details using batch endpoint (optimization: single request instead of multiple)
    let offers: Offer[] = [];
    if (uniqueOfferIds.length > 0) {
      console.log('[EvaluateOffersUseCase] Loading offers via batch endpoint', {
        offerIdsCount: uniqueOfferIds.length,
        offerIds: uniqueOfferIds,
      });
      try {
        const loadedOffers = await this.offerRepository.getByIds(uniqueOfferIds);
        console.log('[EvaluateOffersUseCase] Batch load successful', {
          loadedCount: loadedOffers.length,
        });
        // Filter out offers without title (to avoid showing empty cards)
        offers = loadedOffers.filter((offer) => {
          if (!offer || !offer.title) {
            console.warn(`[EvaluateOffersUseCase] Offer ${offer?.id} loaded but has no title, skipping`);
            return false;
          }
          return true;
        });
        console.log('[EvaluateOffersUseCase] Offers after filtering', {
          filteredCount: offers.length,
        });
      } catch (error) {
        console.warn('[EvaluateOffersUseCase] Batch load failed, falling back to individual requests', {
          error: error instanceof Error ? error.message : String(error),
          offerIdsCount: uniqueOfferIds.length,
        });
        // Fallback to individual requests if batch fails
        const offerPromises = uniqueOfferIds.map(async (offerId) => {
          try {
            const offer = await this.offerRepository.getById(offerId);
            if (offer && offer.title) {
              return offer;
            }
            return null;
          } catch (err) {
            console.warn(`[EvaluateOffersUseCase] Failed to load offer ${offerId}`, err);
            return null;
          }
        });
        const loadedOffers = await Promise.all(offerPromises);
        offers = loadedOffers.filter((offer): offer is Offer => offer !== null);
        console.log('[EvaluateOffersUseCase] Fallback load completed', {
          loadedCount: offers.length,
        });
      }
    } else {
      console.log('[EvaluateOffersUseCase] No offer IDs to load');
    }

    // Apply discounts from scenario items metadata
    // Only apply discounts from the matched scenario
    if (offers.length > 0 && matchedScenario) {
      // Create a map of offerId -> discount from the matched scenario
      const discountMap = new Map<string, number>();
      
      if (matchedScenario.items && matchedScenario.items.length > 0) {
        for (const item of matchedScenario.items) {
          if (item.metadata?.discount) {
            const discountValue = item.metadata.discount;
            // Parse discount: can be string "10" or number 10
            let discountPercent: number;
            if (typeof discountValue === 'string') {
              const parsed = Number.parseFloat(discountValue.trim());
              if (!Number.isNaN(parsed) && parsed >= 0 && parsed <= 100) {
                discountPercent = parsed;
              } else {
                continue; // Skip invalid discount
              }
            } else if (typeof discountValue === 'number') {
              if (discountValue >= 0 && discountValue <= 100) {
                discountPercent = discountValue;
              } else {
                continue; // Skip invalid discount
              }
            } else {
              continue; // Skip non-string/number discount
            }
            
            // Store discount for this offer ID
            discountMap.set(item.id, discountPercent);
          }
        }
      }
      
      // Apply discounts to offers - create new objects with updated prices
      offers = offers.map((offer) => {
        const discountPercent = discountMap.get(offer.id);
        if (discountPercent !== undefined && discountPercent > 0) {
          // Determine base price: prefer originalPrice, fallback to currentPrice
          const basePriceStr = offer.originalPrice || offer.currentPrice;
          if (basePriceStr) {
            const basePrice = Number.parseFloat(basePriceStr);
            if (!Number.isNaN(basePrice) && basePrice > 0) {
              // Calculate discounted price
              const discountedPrice = basePrice * (1 - discountPercent / 100);
              
              // Create new offer object with updated prices
              const updatedOffer: Offer = {
                ...offer,
                // Keep originalPrice as base price if it exists, otherwise set it
                originalPrice: offer.originalPrice || basePriceStr,
                currentPrice: discountedPrice.toFixed(2),
                // Set discount badge text
                discount: `${Math.round(discountPercent)}%`,
              };
              
              console.log(`[EvaluateOffersUseCase] Applied discount to offer ${offer.id}:`, {
                originalPrice: updatedOffer.originalPrice,
                discountedPrice: updatedOffer.currentPrice,
                discountPercent,
              });
              
              return updatedOffer;
            }
          }
        }
        return offer;
      });
    }

    console.log('[EvaluateOffersUseCase] Final offers count:', offers.length);
    return offers;
  }

  private async evaluateCondition(condition: Condition, cache: Map<string, ComparableValue>, appId?: string, userId?: string): Promise<boolean> {
    if (condition.conditionType === 'and' || condition.conditionType === 'or') {
      if (!condition.conditions) return false;
      const results = await Promise.all(condition.conditions.map(c => this.evaluateCondition(c as any, cache, appId, userId)));
      const result = condition.conditionType === 'and' ? results.every(Boolean) : results.some(Boolean);
      console.log(`[EvaluateOffersUseCase] ${condition.conditionType.toUpperCase()} condition:`, {
        conditions: condition.conditions.map((c: any) => ({
          type: c.conditionType,
          value1: c.value1?.value,
          value2: c.value2?.value,
        })),
        results,
        finalResult: result,
        details: condition.conditions.map((c: any, idx: number) => ({
          index: idx,
          condition: `${c.value1?.value} ${c.conditionType} ${c.value2?.value}`,
          result: results[idx],
        })),
      });
      return result;
    }

    if (!condition.value1 || !condition.value2) return false;
    const left = await this.resolveValue(condition.value1, cache, appId, userId);
    const right = await this.resolveValue(condition.value2, cache, appId, userId);

    let result: boolean;
    switch (condition.conditionType) {
      case 'eq':
        result = left === right;
        break;
      case 'gte':
        result = Number(left) >= Number(right);
        break;
      case 'lte':
        result = Number(left) <= Number(right);
        break;
      default:
        throw new InvalidRuleError(`Unsupported condition type: ${(condition as any).conditionType}`);
    }

    console.log(`[EvaluateOffersUseCase] Condition evaluation:`, {
      conditionType: condition.conditionType,
      left: { type: condition.value1?.type, value: condition.value1?.value, resolved: left },
      right: { type: condition.value2?.type, value: condition.value2?.value, resolved: right },
      result,
      comparison: `${left} ${condition.conditionType} ${right}`,
    });

    return result;
  }

  private async resolveValue(descriptor: ValueDescriptor, cache: Map<string, ComparableValue>, appId?: string, userId?: string): Promise<ComparableValue> {
    if (descriptor.type === 'value') return descriptor.value;
    const key = String(descriptor.value);
    if (cache.has(key)) return cache.get(key)!;
    const value = await this.reader.read(key, appId, userId);
    cache.set(key, value);
    return value;
  }
}
