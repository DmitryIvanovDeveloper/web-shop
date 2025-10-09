import { DeliveryChannel } from '../value-objects/delivery-channel.value-object';
import { SilencePolicy } from '../value-objects/silence-policy.value-object';
import { EscalationPolicy } from '../value-objects/escalation-policy.value-object';

export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export class Alert {
  constructor(
    public readonly id: string,
    public readonly ruleId: string,
    public readonly ruleName: string,
    public readonly triggeredAt: Date,
    public readonly severity: AlertSeverity,
    public readonly message: string,
    public readonly currentValue: number,
    public readonly thresholdValue: number,
    public readonly deliveryChannels: DeliveryChannel[],
    public acknowledgedAt?: Date,
    public acknowledgedBy?: string,
    public resolvedAt?: Date,
    public resolvedBy?: string,
    public silencePolicy?: SilencePolicy,
    public escalationPolicy?: EscalationPolicy,
    public escalationLevel: number = 0
  ) {}

  public static create(params: {
    id: string;
    ruleId: string;
    ruleName: string;
    severity: AlertSeverity;
    message: string;
    currentValue: number;
    thresholdValue: number;
    deliveryChannels: DeliveryChannel[];
    silencePolicy?: SilencePolicy;
    escalationPolicy?: EscalationPolicy;
  }): Alert {
    return new Alert(
      params.id,
      params.ruleId,
      params.ruleName,
      new Date(),
      params.severity,
      params.message,
      params.currentValue,
      params.thresholdValue,
      params.deliveryChannels,
      undefined,
      undefined,
      undefined,
      undefined,
      params.silencePolicy,
      params.escalationPolicy,
      0
    );
  }

  public acknowledge(userId: string): Alert {
    return new Alert(
      this.id,
      this.ruleId,
      this.ruleName,
      this.triggeredAt,
      this.severity,
      this.message,
      this.currentValue,
      this.thresholdValue,
      this.deliveryChannels,
      new Date(),
      userId,
      this.resolvedAt,
      this.resolvedBy,
      this.silencePolicy,
      this.escalationPolicy,
      this.escalationLevel
    );
  }

  public resolve(userId: string): Alert {
    return new Alert(
      this.id,
      this.ruleId,
      this.ruleName,
      this.triggeredAt,
      this.severity,
      this.message,
      this.currentValue,
      this.thresholdValue,
      this.deliveryChannels,
      this.acknowledgedAt,
      this.acknowledgedBy,
      new Date(),
      userId,
      this.silencePolicy,
      this.escalationPolicy,
      this.escalationLevel
    );
  }

  public silence(duration: number, reason?: string): Alert {
    const newSilencePolicy = this.silencePolicy
      ? this.silencePolicy.silence(duration)
      : SilencePolicy.create({ enabled: true, duration, reason }).value;

    return new Alert(
      this.id,
      this.ruleId,
      this.ruleName,
      this.triggeredAt,
      this.severity,
      this.message,
      this.currentValue,
      this.thresholdValue,
      this.deliveryChannels,
      this.acknowledgedAt,
      this.acknowledgedBy,
      this.resolvedAt,
      this.resolvedBy,
      newSilencePolicy,
      this.escalationPolicy,
      this.escalationLevel
    );
  }

  public escalate(): Alert {
    return new Alert(
      this.id,
      this.ruleId,
      this.ruleName,
      this.triggeredAt,
      this.severity,
      this.message,
      this.currentValue,
      this.thresholdValue,
      this.deliveryChannels,
      this.acknowledgedAt,
      this.acknowledgedBy,
      this.resolvedAt,
      this.resolvedBy,
      this.silencePolicy,
      this.escalationPolicy,
      this.escalationLevel + 1
    );
  }

  public isActive(): boolean {
    return !this.resolvedAt && !this.isSilenced();
  }

  public isSilenced(): boolean {
    return this.silencePolicy?.isSilenced() || false;
  }

  public needsEscalation(): boolean {
    if (!this.escalationPolicy || this.acknowledgedAt || this.resolvedAt) {
      return false;
    }

    if (this.escalationLevel >= this.escalationPolicy.maxEscalations) {
      return false;
    }

    return this.escalationPolicy.shouldEscalate(this.triggeredAt, this.acknowledgedAt);
  }
}

