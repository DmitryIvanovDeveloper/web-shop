import { Result, Success, Failure } from '../result/result';
import { InvalidArgumentError } from '../errors/invalid-argument.error';

export interface RetryConfigProps {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  retryableStatusCodes: number[];
}

export class RetryConfig {
  private constructor(
    public readonly maxAttempts: number,
    public readonly baseDelayMs: number,
    public readonly maxDelayMs: number,
    public readonly backoffMultiplier: number,
    public readonly retryableStatusCodes: number[]
  ) {}

  public static create(props: RetryConfigProps): Result<RetryConfig, InvalidArgumentError> {
    if (props.maxAttempts < 1) {
      return new Failure(new InvalidArgumentError('maxAttempts must be at least 1'));
    }

    if (props.baseDelayMs < 0) {
      return new Failure(new InvalidArgumentError('baseDelayMs must be non-negative'));
    }

    if (props.maxDelayMs < props.baseDelayMs) {
      return new Failure(new InvalidArgumentError('maxDelayMs must be >= baseDelayMs'));
    }

    if (props.backoffMultiplier < 1) {
      return new Failure(new InvalidArgumentError('backoffMultiplier must be at least 1'));
    }

    return new Success(
      new RetryConfig(
        props.maxAttempts,
        props.baseDelayMs,
        props.maxDelayMs,
        props.backoffMultiplier,
        props.retryableStatusCodes
      )
    );
  }

  public getDelayForAttempt(attempt: number): number {
    const delay = this.baseDelayMs * Math.pow(this.backoffMultiplier, attempt - 1);
    return Math.min(delay, this.maxDelayMs);
  }

  public isRetryableStatus(statusCode: number): boolean {
    return this.retryableStatusCodes.includes(statusCode);
  }
}


