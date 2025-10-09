import { Alert } from '../../domain/entities/alert.entity';
import { AlertRepositoryPort } from '../../application/ports/alert-repository.port';

export class AlertRepositoryMock implements AlertRepositoryPort {
  private alerts: Map<string, Alert> = new Map();

  async save(alert: Alert): Promise<void> {
    this.alerts.set(alert.id, alert);
  }

  async findById(id: string): Promise<Alert | null> {
    return this.alerts.get(id) || null;
  }

  async findActiveAlerts(): Promise<Alert[]> {
    return Array.from(this.alerts.values()).filter(alert => alert.isActive());
  }

  async findByRuleId(ruleId: string): Promise<Alert[]> {
    return Array.from(this.alerts.values()).filter(alert => alert.ruleId === ruleId);
  }

  async update(alert: Alert): Promise<void> {
    this.alerts.set(alert.id, alert);
  }
}

