import { DeliveryChannel } from '../../domain/value-objects/delivery-channel.value-object';
import { Result } from '../../../../../../shared/domain/result/result';

export interface NotificationServicePort {
  send(channel: DeliveryChannel, message: string, metadata: any): Promise<Result<void, Error>>;
  sendBatch(deliveries: Array<{ channel: DeliveryChannel; message: string; metadata: any }>): Promise<void>;
}

