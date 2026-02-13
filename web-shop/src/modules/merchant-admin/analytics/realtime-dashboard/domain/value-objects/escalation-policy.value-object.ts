import { Result, Success, Failure } from '@/shared/result/result';
import { DeliveryChannel } from './delivery-channel.value-object';

export class EscalationPolicy {
  private constructor(public readonly level: number) {}

  static create(level: number): Result<EscalationPolicy, Error> {
    if (level < 1) return Failure.error(new Error('Invalid level'));
    return Success.ok(new EscalationPolicy(level));
  }
}

