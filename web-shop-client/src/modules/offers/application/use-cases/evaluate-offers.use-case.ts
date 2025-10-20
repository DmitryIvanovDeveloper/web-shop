import { injectable, inject } from 'inversify';
import { OFFERS_TYPES } from '../../infrastructure/bootstrap/types';
import type { RulesRepositoryPort } from '../ports/rules-repository.port';
import type { OfferRepositoryPort } from '../ports/offer-repository.port';
import type { ConditionReaderPort } from '../ports/condition-reader.port';
import type { Operation, Condition, ValueDescriptor, ComparableValue, Offer } from '../../domain/types';
import { InvalidRuleError, EvaluationError } from '../../domain/errors/offers.error';

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

  public async execute(_input?: { contextCache?: Map<string, ComparableValue> }): Promise<Offer[]> {
    console.log('[EvaluateOffersUseCase] Starting evaluation...');
    const rules = await this.rulesRepository.loadRules();
    console.log('[EvaluateOffersUseCase] Rules loaded:', rules);
    const offersIds: string[] = [];
    const cache = _input?.contextCache ?? new Map<string, ComparableValue>();

    const evaluateOperation = async (operation?: Operation): Promise<void> => {
      if (!operation) return;
      if (operation.operationType === 'action') {
        if (operation.action?.actionType === 'showOffer') {
          offersIds.push(operation.action.params.offerId);
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

    await evaluateOperation(rules);

    // Deduplicate offer IDs
    const uniqueOfferIds = [...new Set(offersIds)];
    console.log('[EvaluateOffersUseCase] Unique offer IDs:', uniqueOfferIds);

    // Fetch offer details
    const offers: Offer[] = [];
    for (const offerId of uniqueOfferIds) {
      try {
        console.log(`[EvaluateOffersUseCase] Loading offer: ${offerId}`);
        const offer = await this.offerRepository.getById(offerId);
        console.log(`[EvaluateOffersUseCase] Offer loaded:`, offer);
        offers.push(offer);
      } catch (error) {
        console.warn(`Failed to load offer ${offerId}:`, error);
      }
    }
    console.log('[EvaluateOffersUseCase] Final offers:', offers);
    return offers;
  }

  private async evaluateCondition(condition: Condition, cache: Map<string, ComparableValue>): Promise<boolean> {
    if (condition.conditionType === 'and' || condition.conditionType === 'or') {
      if (!condition.conditions) return false;
      const results = await Promise.all(condition.conditions.map(c => this.evaluateCondition(c as any, cache)));
      return condition.conditionType === 'and' ? results.every(Boolean) : results.some(Boolean);
    }

    if (!condition.value1 || !condition.value2) return false;
    const left = await this.resolveValue(condition.value1, cache);
    const right = await this.resolveValue(condition.value2, cache);

    switch (condition.conditionType) {
      case 'eq':
        return left === right;
      case 'gte':
        return Number(left) >= Number(right);
      case 'lte':
        return Number(left) <= Number(right);
      default:
        throw new InvalidRuleError(`Unsupported condition type: ${(condition as any).conditionType}`);
    }
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
