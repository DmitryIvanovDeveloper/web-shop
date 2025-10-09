import { Result, Success, Failure } from '../../../../shared/result/result';
import { AlertRuleError, InvalidThresholdError, InvalidMetricError, InvalidScopeError } from '../errors/alert-rule.error';

export type AlertOperator = 'GREATER_THAN' | 'LESS_THAN' | 'EQUALS' | 'BETWEEN';
export type AlertScope = 'ALL' | 'REGION' | 'PRODUCT' | 'USER';

export interface ThresholdRange {
  min: number;
  max: number;
}

export class AlertRule {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly metric: string,
    public readonly operator: AlertOperator,
    public readonly threshold: number | ThresholdRange,
    public readonly scope: AlertScope,
    public readonly scopeValue?: string
  ) {}

  public static create(params: {
    id: string;
    name: string;
    metric: string;
    operator: AlertOperator;
    threshold: number | ThresholdRange;
    scope: AlertScope;
    scopeValue?: string;
  }): Result<AlertRule, AlertRuleError> {
    // Validate metric
    if (!params.metric || params.metric.trim().length === 0) {
      return Failure.fail(new InvalidMetricError('Metric name cannot be empty'));
    }

    // Validate threshold based on operator
    if (params.operator === 'BETWEEN') {
      if (typeof params.threshold === 'number') {
        return Failure.fail(new InvalidThresholdError('BETWEEN operator requires a range threshold'));
      }
      const range = params.threshold as ThresholdRange;
      if (range.min >= range.max) {
        return Failure.fail(new InvalidThresholdError('Min threshold must be less than max threshold'));
      }
    } else {
      if (typeof params.threshold !== 'number') {
        return Failure.fail(new InvalidThresholdError(`${params.operator} operator requires a numeric threshold`));
      }
      if (params.threshold < 0) {
        return Failure.fail(new InvalidThresholdError('Threshold must be non-negative'));
      }
    }

    // Validate scope
    if (params.scope !== 'ALL' && !params.scopeValue) {
      return Failure.fail(new InvalidScopeError(`Scope value is required when scope is ${params.scope}`));
    }

    return Success.ok(new AlertRule(
      params.id,
      params.name,
      params.metric,
      params.operator,
      params.threshold,
      params.scope,
      params.scopeValue
    ));
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

