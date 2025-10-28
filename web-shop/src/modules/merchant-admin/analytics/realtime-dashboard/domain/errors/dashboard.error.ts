export abstract class DashboardDomainError extends Error {
  public readonly code: string;
  public readonly timestamp: Date;
  public readonly context?: Record<string, any>;

  protected constructor(
    message: string,
    code: string,
    context?: Record<string, any>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.timestamp = new Date();
    this.context = context;

    // Убеждаемся, что стек сохраняется
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  public toJSON(): Record<string, any> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      timestamp: this.timestamp.toISOString(),
      context: this.context,
      stack: this.stack
    };
  }
}

export class InvalidPeriodError extends DashboardDomainError {
  constructor(message: string = 'Invalid period specified', context?: Record<string, any>) {
    super(message, 'INVALID_PERIOD', context);
  }
}

export class DataUnavailableError extends DashboardDomainError {
  public readonly metric: string;

  constructor(metric: string, message?: string, context?: Record<string, any>) {
    const defaultMessage = `Data unavailable for metric: ${metric}`;
    super(message || defaultMessage, 'DATA_UNAVAILABLE', { metric, ...context });
    this.metric = metric;
  }
}

export class InvalidFilterError extends DashboardDomainError {
  public readonly filterName: string;
  public readonly filterValue: any;

  constructor(
    filterName: string,
    filterValue: any,
    message?: string,
    context?: Record<string, any>
  ) {
    const defaultMessage = `Invalid filter '${filterName}' with value '${filterValue}'`;
    super(message || defaultMessage, 'INVALID_FILTER', { filterName, filterValue, ...context });
    this.filterName = filterName;
    this.filterValue = filterValue;
  }
}

export class NetworkError extends DashboardDomainError {
  public readonly statusCode?: number;
  public readonly endpoint?: string;

  constructor(
    message: string = 'Network error occurred',
    statusCode?: number,
    endpoint?: string,
    context?: Record<string, any>
  ) {
    super(message, 'NETWORK_ERROR', { statusCode, endpoint, ...context });
    this.statusCode = statusCode;
    this.endpoint = endpoint;
  }
}

export class TimeoutError extends DashboardDomainError {
  public readonly timeoutMs: number;

  constructor(
    timeoutMs: number = 30000,
    message?: string,
    context?: Record<string, any>
  ) {
    const defaultMessage = `Operation timed out after ${timeoutMs}ms`;
    super(message || defaultMessage, 'TIMEOUT_ERROR', { timeoutMs, ...context });
    this.timeoutMs = timeoutMs;
  }
}














