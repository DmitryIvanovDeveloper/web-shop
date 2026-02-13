import { Result, Success, Failure } from '@/shared/result/result';

export class SilencePolicy {
  private constructor(public readonly minutes: number) {}

  static create(minutes: number): Result<SilencePolicy, Error> {
    if (minutes <= 0) return Failure.error(new Error('Invalid minutes'));
    return Success.ok(new SilencePolicy(minutes));
  }
}

