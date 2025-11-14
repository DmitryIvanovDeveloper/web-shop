import type { Result } from '../../../../../shared/domain/result/result';
import type { OfferRuleTree } from '../../domain/types/offer-rule-tree.type';

export interface OfferRuleEngineRepositoryPort {
  loadRuleTree(appId: string): Promise<Result<OfferRuleTree | null, Error>>;
  saveRuleTree(tree: OfferRuleTree): Promise<Result<void, Error>>;
}


