import { Result, Success, Failure } from '../../../../../../shared/domain/result/result';
import { AlertRuleError, InvalidThresholdError, InvalidMetricError, InvalidScopeError } from '../errors/alert-rule.error';

export type AlertOperator = 'GREATER_THAN' | 'LESS_THAN' | 'EQUALS' | 'BETWEEN';
export type AlertScope = 'ALL' | 'REGION' | 'PRODUCT' | 'USER';

export interface ThresholdRange {
  min: number;
  max: number;
}

export class AlertRule {
  private constructor(
    public readonly id: string,
    public readonly metric: string,
    public readonly operator: '>' | '>=' | '<' | '<=' | '==',
    public readonly threshold: number
  ) {}

  static create(params: { id: string; metric: string; operator: '>' | '>=' | '<' | '<=' | '=='; threshold: number }): Result<AlertRule, Error> {
    if (!params.id || !params.metric) {
      return Failure.error(new Error('Invalid rule'));
    }
    return Success.ok(new AlertRule(params.id, params.metric, params.operator, params.threshold));
  }

  public evaluate(currentValue: number): boolean {
    switch (this.operator) {
      case 'GREATER_THAN':
        return currentValue > (this.threshold as number);
      case 'LESS_THAN':
        return currentValue < (this.threshold as number);
      case 'EQUALS':
        return currentValue === (this.threshold as number);
      case 'BETWEEN':
        const range = this.threshold as ThresholdRange;
        return currentValue >= range.min && currentValue <= range.max;
      default:
        return false;
    }
  }

  public toExpression(): string {
    const metricDisplay = this.metric.replace(/([A-Z])/g, ' $1').trim();
    
    switch (this.operator) {
      case 'GREATER_THAN':
        return `${metricDisplay} > ${this.threshold}`;
      case 'LESS_THAN':
        return `${metricDisplay} < ${this.threshold}`;
      case 'EQUALS':
        return `${metricDisplay} = ${this.threshold}`;
      case 'BETWEEN':
        const range = this.threshold as ThresholdRange;
        return `${range.min} ≤ ${metricDisplay} ≤ ${range.max}`;
      default:
        return '';
    }
  }
}

