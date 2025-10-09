import { Result, Success, Failure } from '../../../../shared/result/result';
import { DeliveryChannel } from './delivery-channel.value-object';

export class EscalationPolicy {
  constructor(
    public readonly enabled: boolean,
    public readonly escalateAfter: number, // minutes without acknowledgment
    public readonly escalateTo: DeliveryChannel[],
    public readonly maxEscalations: number
  ) {}

  public static create(params: {
    enabled: boolean;
    escalateAfter: number;
    escalateTo: DeliveryChannel[];
    maxEscalations: number;
  }): Result<EscalationPolicy, Error> {
    if (params.enabled && params.escalateAfter <= 0) {
      return Failure.fail(new Error('Escalation time must be greater than 0'));
    }

    if (params.enabled && params.escalateTo.length === 0) {
      return Failure.fail(new Error('Escalation channels cannot be empty'));
    }

    if (params.maxEscalations < 1) {
      return Failure.fail(new Error('Max escalations must be at least 1'));
    }

    return Success.ok(new EscalationPolicy(
      params.enabled,
      params.escalateAfter,
      params.escalateTo,
      params.maxEscalations
    ));
  }

  public shouldEscalate(alertTriggeredAt: Date, acknowledgedAt?: Date): boolean {
    if (!this.enabled || acknowledgedAt) {
      return false;
    }

    const now = new Date();
    const elapsedMinutes = (now.getTime() - alertTriggeredAt.getTime()) / 60000;

    return elapsedMinutes >= this.escalateAfter;
  }

  public getNextEscalationLevel(currentLevel: number): DeliveryChannel[] {
    if (currentLevel >= this.maxEscalations) {
      return [];
    }

    return this.escalateTo;
  }
}

