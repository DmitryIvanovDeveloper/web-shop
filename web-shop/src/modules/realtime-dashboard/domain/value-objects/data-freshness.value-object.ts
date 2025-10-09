import { Result, Success, Failure } from '../../../../shared/domain/result';
import { InvalidArgumentError } from '../../../../shared/domain/errors/invalid-argument.error';

export interface DataFreshnessProps {
  lastUpdated: Date;
  targetLatencySeconds?: number; // Default 300 (5 min)
  maxLatencySeconds?: number; // Default 900 (15 min)
}

export class DataFreshness {
  private readonly FRESH_THRESHOLD_SECONDS = 300; // 5 minutes
  private readonly STALE_THRESHOLD_SECONDS = 900; // 15 minutes

  private constructor(
    public readonly lastUpdated: Date,
    public readonly targetLatencySeconds: number,
    public readonly maxLatencySeconds: number
  ) {}

  public static create(props: DataFreshnessProps): Result<DataFreshness, InvalidArgumentError> {
    if (!props.lastUpdated || !(props.lastUpdated instanceof Date)) {
      return new Failure(new InvalidArgumentError('lastUpdated must be a valid Date'));
    }

    if (isNaN(props.lastUpdated.getTime())) {
      return new Failure(new InvalidArgumentError('lastUpdated must be a valid Date'));
    }

    const targetLatency = props.targetLatencySeconds || 300;
    const maxLatency = props.maxLatencySeconds || 900;

    if (targetLatency <= 0 || maxLatency <= 0) {
      return new Failure(new InvalidArgumentError('Latency thresholds must be positive'));
    }

    if (targetLatency > maxLatency) {
      return new Failure(new InvalidArgumentError('Target latency must be less than max latency'));
    }

    return new Success(new DataFreshness(props.lastUpdated, targetLatency, maxLatency));
  }

  public getLagSeconds(now: Date = new Date()): number {
    return Math.floor((now.getTime() - this.lastUpdated.getTime()) / 1000);
  }

  public isFresh(now: Date = new Date()): boolean {
    return this.getLagSeconds(now) <= this.targetLatencySeconds;
  }

  public isStale(now: Date = new Date()): boolean {
    return this.getLagSeconds(now) > this.maxLatencySeconds;
  }

  public isWarning(now: Date = new Date()): boolean {
    const lag = this.getLagSeconds(now);
    return lag > this.targetLatencySeconds && lag <= this.maxLatencySeconds;
  }

  public getStatus(now: Date = new Date()): 'fresh' | 'warning' | 'stale' {
    if (this.isFresh(now)) return 'fresh';
    if (this.isStale(now)) return 'stale';
    return 'warning';
  }

  public getRelativeTime(now: Date = new Date()): string {
    const lagSeconds = this.getLagSeconds(now);

    if (lagSeconds < 60) {
      return `${lagSeconds} second${lagSeconds !== 1 ? 's' : ''} ago`;
    }

    const lagMinutes = Math.floor(lagSeconds / 60);
    if (lagMinutes < 60) {
      return `${lagMinutes} minute${lagMinutes !== 1 ? 's' : ''} ago`;
    }

    const lagHours = Math.floor(lagMinutes / 60);
    return `${lagHours} hour${lagHours !== 1 ? 's' : ''} ago`;
  }

  public updateTimestamp(newTimestamp: Date): Result<DataFreshness, InvalidArgumentError> {
    return DataFreshness.create({
      lastUpdated: newTimestamp,
      targetLatencySeconds: this.targetLatencySeconds,
      maxLatencySeconds: this.maxLatencySeconds,
    });
  }
}


