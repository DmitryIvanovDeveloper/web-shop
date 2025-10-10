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
      metric: 'refundRate',
      operator: '>',
      threshold: 15, // 15%
    });

    if (refundRateRule.success) {
      this.rules.set('rule-1', refundRateRule.data!);
    }

    // Rule 2: Low sales
    const lowSalesRule = AlertRule.create({
      id: 'rule-2',
      metric: 'totalSales',
      operator: '<',
      threshold: 100000,
    });

    if (lowSalesRule.success) {
      this.rules.set('rule-2', lowSalesRule.data!);
    }

    // Rule 3: High conversion rate
    const highConversionRule = AlertRule.create({
      id: 'rule-3',
      metric: 'conversionRate',
      operator: '>',
      threshold: 5, // 5%
    });

    if (highConversionRule.success) {
      this.rules.set('rule-3', highConversionRule.data!);
    }
  }
}

