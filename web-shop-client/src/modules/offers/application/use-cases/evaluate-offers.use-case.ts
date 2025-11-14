import { injectable, inject } from 'inversify';
import { OFFERS_TYPES } from '../../infrastructure/bootstrap/types';
import type { RulesRepositoryPort } from '../ports/rules-repository.port';
import type { OfferRepositoryPort } from '../ports/offer-repository.port';
import type { ConditionReaderPort } from '../ports/condition-reader.port';
import type { Operation, Condition, ValueDescriptor, ComparableValue, Offer } from '../../domain/types';
import { InvalidRuleError, EvaluationError } from '../../domain/errors/offers.error';

export interface EvaluateOffersInput {
  readonly appId?: string;
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

    // Import OfferRuleTreeScenario type
    type OfferRuleTreeScenario = {
      readonly slug: string;
      readonly triggerCode: string;
      readonly offerIds: readonly string[];
    };

    // Evaluate all scenarios from the scenarios array
    // This allows evaluating multiple conditions, not just the first one in ruleSet
    const scenarios = ruleTree.scenarios ?? [];
    const allowedScenarios = input?.allowedScenarios;

    console.log('[EvaluateOffersUseCase] Evaluating scenarios:', {
      totalScenarios: scenarios.length,
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
      // Add other trigger conditions as needed
    };

    // Evaluate each scenario
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
      const conditionResult = await this.evaluateCondition(condition, cache);

      console.log(`[EvaluateOffersUseCase] Scenario ${scenario.slug} (${scenario.triggerCode}):`, {
        conditionResult,
        offerIds: scenario.offerIds,
      });

      if (conditionResult) {
        // Condition matched, add offer IDs
        offersIds.push(...scenario.offerIds);
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
      const result = await this.evaluateCondition(operation.condition, cache);
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

    // Fetch offer details from offer IDs
    const offers: Offer[] = [];
    for (const offerId of uniqueOfferIds) {
      try {
        const offer = await this.offerRepository.getById(offerId);
        // Only add offer if it has a title (to avoid showing empty cards)
        if (offer && offer.title) {
          offers.push(offer);
        } else {
          console.warn(`[EvaluateOffersUseCase] Offer ${offerId} loaded but has no title, skipping`);
        }
      } catch (error) {
        // Offer not found or failed to load - continue with other offers
        console.warn(`[EvaluateOffersUseCase] Offer ${offerId} not found or failed to load`);
      }
    }

    console.log('[EvaluateOffersUseCase] Final offers count:', offers.length);
    return offers;
  }

  private async evaluateCondition(condition: Condition, cache: Map<string, ComparableValue>): Promise<boolean> {
    if (condition.conditionType === 'and' || condition.conditionType === 'or') {
      if (!condition.conditions) return false;
      const results = await Promise.all(condition.conditions.map(c => this.evaluateCondition(c as any, cache)));
      const result = condition.conditionType === 'and' ? results.every(Boolean) : results.some(Boolean);
      console.log(`[EvaluateOffersUseCase] ${condition.conditionType.toUpperCase()} condition:`, {
        conditions: condition.conditions.map((c: any) => ({
          type: c.conditionType,
          value1: c.value1?.value,
          value2: c.value2?.value,
        })),
        results,
        finalResult: result,
      });
      return result;
    }

    if (!condition.value1 || !condition.value2) return false;
    const left = await this.resolveValue(condition.value1, cache);
    const right = await this.resolveValue(condition.value2, cache);

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
    });

    return result;
  }

  private async resolveValue(descriptor: ValueDescriptor, cache: Map<string, ComparableValue>): Promise<ComparableValue> {
    if (descriptor.type === 'value') return descriptor.value;
    const key = String(descriptor.value);
    if (cache.has(key)) return cache.get(key)!;
    const value = await this.reader.read(key);
    cache.set(key, value);
    return value;
  }
}
