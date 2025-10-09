import { AlertRule } from '../../domain/value-objects/alert-rule.value-object';

export interface AlertRuleRepositoryPort {
  save(rule: AlertRule): Promise<void>;
  findById(id: string): Promise<AlertRule | null>;
  findAll(): Promise<AlertRule[]>;
  delete(id: string): Promise<void>;
  update(rule: AlertRule): Promise<void>;
}

