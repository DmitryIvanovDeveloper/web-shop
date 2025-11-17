import type { OfferRuleTree } from '../../domain/types';

export interface RulesRepositoryPort {
  loadRules(appId?: string): Promise<OfferRuleTree>;
}
