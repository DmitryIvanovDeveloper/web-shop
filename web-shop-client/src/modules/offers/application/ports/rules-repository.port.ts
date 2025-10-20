import type { RuleSet } from '../../domain/types';

export interface RulesRepositoryPort {
  loadRules(): Promise<RuleSet>;
}
