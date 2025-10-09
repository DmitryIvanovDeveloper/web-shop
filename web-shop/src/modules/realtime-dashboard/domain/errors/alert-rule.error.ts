export class AlertRuleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AlertRuleError';
  }
}

export class InvalidThresholdError extends AlertRuleError {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidThresholdError';
  }
}

export class InvalidMetricError extends AlertRuleError {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidMetricError';
  }
}

export class InvalidScopeError extends AlertRuleError {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidScopeError';
  }
}

