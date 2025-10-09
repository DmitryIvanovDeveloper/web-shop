import { Result, Success, Failure } from '../../../../shared/result/result';

export class SilencePolicy {
  constructor(
    public readonly enabled: boolean,
    public readonly duration: number, // minutes
    public readonly reason?: string,
    public readonly silencedUntil?: Date
  ) {}

  public static create(params: {
    enabled: boolean;
    duration: number;
    reason?: string;
    silencedUntil?: Date;
  }): Result<SilencePolicy, Error> {
    if (params.enabled && params.duration <= 0) {
      return Failure.fail(new Error('Silence duration must be greater than 0'));
    }

    return Success.ok(new SilencePolicy(
      params.enabled,
      params.duration,
      params.reason,
      params.silencedUntil
    ));
  }

  public isSilenced(): boolean {
    if (!this.enabled || !this.silencedUntil) {
      return false;
    }

    return new Date() < this.silencedUntil;
  }

  public getRemainingTime(): number {
    if (!this.isSilenced() || !this.silencedUntil) {
      return 0;
    }

    const now = new Date();
    const remainingMs = this.silencedUntil.getTime() - now.getTime();
    return Math.max(0, Math.ceil(remainingMs / 60000)); // Convert to minutes
  }

  public silence(durationMinutes: number): SilencePolicy {
    const now = new Date();
    const silencedUntil = new Date(now.getTime() + durationMinutes * 60000);

    return new SilencePolicy(
      true,
      durationMinutes,
      this.reason,
      silencedUntil
    );
  }
}

