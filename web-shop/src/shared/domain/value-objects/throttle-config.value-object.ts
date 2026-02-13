import { Result } from '../../result/result';
import { InvalidArgumentError } from '../errors/invalid-argument.error';

export interface ThrottleConfigProps {
  maxUpdatesPerSecond: number;
  burstLimit: number;
  cooldownMs: number;
}

export class ThrottleConfig {
  private constructor(
    public readonly maxUpdatesPerSecond: number,
    public readonly burstLimit: number,
    public readonly cooldownMs: number
  ) {}

  public static create(props: ThrottleConfigProps): Result<ThrottleConfig, InvalidArgumentError> {
    if (props.maxUpdatesPerSecond < 1) {
      return Result.error(new InvalidArgumentError('maxUpdatesPerSecond must be at least 1'));
    }

    if (props.burstLimit < 1) {
      return Result.error(new InvalidArgumentError('burstLimit must be at least 1'));
    }

    if (props.cooldownMs < 0) {
      return Result.error(new InvalidArgumentError('cooldownMs must be non-negative'));
    }

    return Result.ok(
      new ThrottleConfig(props.maxUpdatesPerSecond, props.burstLimit, props.cooldownMs)
    );
  }

  public getMinIntervalMs(): number {
    return 1000 / this.maxUpdatesPerSecond;
  }
}
