import { Result, Success, Failure } from '../../../../shared/result/result';
import { DeliveryChannelError, InvalidWebhookUrlError, InvalidEmailError } from '../errors/delivery-channel.error';

export type DeliveryChannelType = 'IN_APP' | 'EMAIL' | 'WEBHOOK' | 'SMS';

export interface InAppConfig {
  userId: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface EmailConfig {
  to: string[];
  cc?: string[];
  subject: string;
}

export interface WebhookConfig {
  url: string;
  headers?: Record<string, string>;
  method: 'POST' | 'PUT';
}

export interface SmsConfig {
  phoneNumber: string;
}

export type DeliveryConfig = InAppConfig | EmailConfig | WebhookConfig | SmsConfig;

export class DeliveryChannel {
  constructor(
    public readonly type: DeliveryChannelType,
    public readonly config: DeliveryConfig
  ) {}

  public static create(
    type: DeliveryChannelType,
    config: DeliveryConfig
  ): Result<DeliveryChannel, DeliveryChannelError> {
    // Validate based on type
    if (type === 'EMAIL') {
      const emailConfig = config as EmailConfig;
      if (!emailConfig.to || emailConfig.to.length === 0) {
        return Failure.fail(new InvalidEmailError('Email recipients cannot be empty'));
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      for (const email of emailConfig.to) {
        if (!emailRegex.test(email)) {
          return Failure.fail(new InvalidEmailError(`Invalid email address: ${email}`));
        }
      }
    }

    if (type === 'WEBHOOK') {
      const webhookConfig = config as WebhookConfig;
      try {
        new URL(webhookConfig.url);
      } catch {
        return Failure.fail(new InvalidWebhookUrlError(`Invalid webhook URL: ${webhookConfig.url}`));
      }
    }

    if (type === 'IN_APP') {
      const inAppConfig = config as InAppConfig;
      if (!inAppConfig.userId || inAppConfig.userId.trim().length === 0) {
        return Failure.fail(new DeliveryChannelError('User ID cannot be empty for IN_APP delivery'));
      }
    }

    if (type === 'SMS') {
      const smsConfig = config as SmsConfig;
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      if (!phoneRegex.test(smsConfig.phoneNumber)) {
        return Failure.fail(new DeliveryChannelError(`Invalid phone number: ${smsConfig.phoneNumber}`));
      }
    }

    return Success.ok(new DeliveryChannel(type, config));
  }

  public isValid(): boolean {
    return true; // Already validated in create()
  }
}

