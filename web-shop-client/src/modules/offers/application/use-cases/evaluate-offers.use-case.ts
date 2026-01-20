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

            const scenarios = (ruleTree.scenarios ?? []).slice().sort((a, b) => b.priority - a.priority);
    const allowedScenarios = input?.allowedScenarios;

    console.log('[EvaluateOffersUseCase] Evaluating scenarios (sorted by priority, highest first):', {
      totalScenarios: scenarios.length,
      scenarioPriorities: scenarios.map(s => ({ slug: s.slug, priority: s.priority })),
      allowedScenarios,
      hasAllowedScenarios: !!allowedScenarios && allowedScenarios.length > 0,
    });

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
        value2: { type: 'value', value: 2 },       }),
          };

        let matchedScenario: OfferRuleTreeScenario | null = null;

        for (const scenario of scenarios) {
            if (allowedScenarios && allowedScenarios.length > 0) {
                                const matches = allowedScenarios.some((allowed) => 
          scenario.slug === allowed || scenario.slug.startsWith(`${allowed}-`)
        );
        if (!matches) {
          console.log(`[EvaluateOffersUseCase] Skipping scenario ${scenario.slug} (not in allowedScenarios)`);
          continue;
        }
      }

            const buildCondition = TRIGGER_CONDITIONS[scenario.triggerCode];
      if (!buildCondition) {
                continue;
      }

      const condition = buildCondition();
      const conditionResult = await this.evaluateCondition(condition, cache, input?.appId, input?.userId);

      console.log(`[EvaluateOffersUseCase] Scenario ${scenario.slug} (${scenario.triggerCode}):`, {
        conditionResult,
        offerIds: scenario.offerIds,
      });

      if (conditionResult) {
                                if (scenario.offerIds && scenario.offerIds.length > 0) {
          offersIds.push(...scenario.offerIds);
        }
        
                matchedScenario = scenario;
        
                console.log(`[EvaluateOffersUseCase] First matching scenario found: ${scenario.slug} (priority: ${scenario.priority}), stopping evaluation`);
        break;
      }
    }

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

            if (!operation.condition) return;
      const result = await this.evaluateCondition(operation.condition, cache, input?.appId, input?.userId);
      if (result) {
        await evaluateOperation(operation.nextOperation);
      } else {
        await evaluateOperation(operation.elseOperation);
      }
    };

    await evaluateOperation(ruleTree.ruleSet);

        const uniqueOfferIds = [...new Set(offersIds)];

            let offers: Offer[] = [];
    if (uniqueOfferIds.length > 0) {
            try {
        const loadedOffers = await this.offerRepository.getByIds(uniqueOfferIds);
                        offers = loadedOffers.filter((offer) => {
          if (!offer || !offer.title) {
                        return false;
          }
          return true;
        });
              } catch (error) {
        console.warn('[EvaluateOffersUseCase] Batch load failed, falling back to individual requests', {
          error: error instanceof Error ? error.message : String(error),
          offerIdsCount: uniqueOfferIds.length,
        });
                const offerPromises = uniqueOfferIds.map(async (offerId) => {
          try {
            const offer = await this.offerRepository.getById(offerId);
            if (offer && offer.title) {
              return offer;
            }
            return null;
          } catch (err) {
                        return null;
          }
        });
        const loadedOffers = await Promise.all(offerPromises);
        offers = loadedOffers.filter((offer): offer is Offer => offer !== null);
              }
    } else {
          }

            if (offers.length > 0 && matchedScenario) {
            const discountMap = new Map<string, number>();
      
      if (matchedScenario.items && matchedScenario.items.length > 0) {
        for (const item of matchedScenario.items) {
          if (item.metadata?.discount) {
            const discountValue = item.metadata.discount;
                        let discountPercent: number;
            if (typeof discountValue === 'string') {
              const parsed = Number.parseFloat(discountValue.trim());
              if (!Number.isNaN(parsed) && parsed >= 0 && parsed <= 100) {
                discountPercent = parsed;
              } else {
                continue;               }
            } else if (typeof discountValue === 'number') {
              if (discountValue >= 0 && discountValue <= 100) {
                discountPercent = discountValue;
              } else {
                continue;               }
            } else {
              continue;             }
            
                        discountMap.set(item.id, discountPercent);
          }
        }
      }
      
            offers = offers.map((offer) => {
        const discountPercent = discountMap.get(offer.id);
        if (discountPercent !== undefined && discountPercent > 0) {
                    const basePriceStr = offer.originalPrice || offer.currentPrice;
          if (basePriceStr) {
            const basePrice = Number.parseFloat(basePriceStr);
            if (!Number.isNaN(basePrice) && basePrice > 0) {
                            const discountedPrice = basePrice * (1 - discountPercent / 100);
              
                            const updatedOffer: Offer = {
                ...offer,
                                originalPrice: offer.originalPrice || basePriceStr,
                currentPrice: discountedPrice.toFixed(2),
                                discount: `${Math.round(discountPercent)}%`,
              };
              
                            return updatedOffer;
            }
          }
        }
        return offer;
      });
    }

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
