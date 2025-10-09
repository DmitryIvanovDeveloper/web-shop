import { AlertRule } from '../../domain/value-objects/alert-rule.value-object';
import { AlertRuleRepositoryPort } from '../../application/ports/alert-rule-repository.port';

export class AlertRuleRepositoryMock implements AlertRuleRepositoryPort {
  private rules: Map<string, AlertRule> = new Map();

  constructor() {
    // Initialize with some default rules for demo
    this.initializeDefaultRules();
  }

  async save(rule: AlertRule): Promise<void> {
    this.rules.set(rule.id, rule);
  }

  async findById(id: string): Promise<AlertRule | null> {
    return this.rules.get(id) || null;
  }

  async findAll(): Promise<AlertRule[]> {
    return Array.from(this.rules.values());
  }

  async delete(id: string): Promise<void> {
    this.rules.delete(id);
  }

  async update(rule: AlertRule): Promise<void> {
    this.rules.set(rule.id, rule);
  }

  private initializeDefaultRules(): void {
    // Rule 1: High refund rate
    const refundRateRule = AlertRule.create({
      id: 'rule-1',
      name: 'High Refund Rate',
      metric: 'refundRate',
      operator: 'GREATER_THAN',
      threshold: 15, // 15%
      scope: 'ALL',
    });

    if (refundRateRule.success) {
      this.rules.set('rule-1', refundRateRule.data);
    }

    // Rule 2: Low sales
    const lowSalesRule = AlertRule.create({
      id: 'rule-2',
      name: 'Low Sales',
      metric: 'totalSales',
      operator: 'LESS_THAN',
      threshold: 100000,
      scope: 'ALL',
    });

    if (lowSalesRule.success) {
      this.rules.set('rule-2', lowSalesRule.data);
    }

    // Rule 3: High conversion rate
    const highConversionRule = AlertRule.create({
      id: 'rule-3',
      name: 'Excellent Conversion',
      metric: 'conversionRate',
      operator: 'GREATER_THAN',
      threshold: 5, // 5%
      scope: 'ALL',
    });

    if (highConversionRule.success) {
      this.rules.set('rule-3', highConversionRule.data);
    }
  }
}

