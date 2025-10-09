export class DeliveryChannelError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DeliveryChannelError';
  }
}

export class InvalidWebhookUrlError extends DeliveryChannelError {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidWebhookUrlError';
  }
}

export class InvalidEmailError extends DeliveryChannelError {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidEmailError';
  }
}

