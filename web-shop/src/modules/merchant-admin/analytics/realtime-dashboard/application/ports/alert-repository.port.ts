import { Alert } from '../../domain/entities/alert.entity';

export interface AlertRepositoryPort {
  save(alert: Alert): Promise<void>;
  findById(id: string): Promise<Alert | null>;
  findActiveAlerts(): Promise<Alert[]>;
  findByRuleId(ruleId: string): Promise<Alert[]>;
  update(alert: Alert): Promise<void>;
}

