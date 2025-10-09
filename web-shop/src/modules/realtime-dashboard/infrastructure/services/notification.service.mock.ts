import { DeliveryChannel } from '../../domain/value-objects/delivery-channel.value-object';
import { NotificationServicePort } from '../../application/ports/notification-service.port';
import { Logger } from '../../../../application/ports/logger.port';
import { Result, Success } from '../../../../shared/result/result';

export class NotificationServiceMock implements NotificationServicePort {
  constructor(private readonly logger: Logger) {}

  async send(channel: DeliveryChannel, message: string, metadata: any): Promise<Result<void, Error>> {
    this.logger.info('Mock notification sent', {
      channelType: channel.type,
      message,
      metadata,
    });

    // Simulate in-app notification
    if (channel.type === 'IN_APP') {
      // In real implementation, this would trigger a toast/notification in UI
      console.log(`[IN-APP NOTIFICATION] ${message}`);
    }

    return Success.ok(undefined);
  }

  async sendBatch(deliveries: Array<{ channel: DeliveryChannel; message: string; metadata: any }>): Promise<void> {
    for (const delivery of deliveries) {
      await this.send(delivery.channel, delivery.message, delivery.metadata);
    }
  }
}

