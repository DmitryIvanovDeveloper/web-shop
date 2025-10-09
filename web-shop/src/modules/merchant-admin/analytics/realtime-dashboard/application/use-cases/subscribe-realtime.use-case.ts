import { RealtimeClientPort } from '../../../../../../application/ports/realtime-client.port';
import { Logger } from '../../../../../../application/ports/logger.port';

export class SubscribeRealtimeUseCase {
  constructor(
    private readonly realtimeClient: RealtimeClientPort,
    private readonly logger: Logger
  ) {}

  async execute(
    channels: string[],
    onUpdate: (channel: string, data: any) => void
  ): Promise<void> {
    this.logger.info(`SubscribeRealtimeUseCase: Subscribing to channels ${channels.join(', ')}`);

    // Connect if not connected
    if (!this.realtimeClient.isConnected()) {
      await this.realtimeClient.connect();
    }

    // Subscribe to each channel
    channels.forEach(channel => {
      this.realtimeClient.subscribe(channel, (message) => {
        this.logger.info(`Received update on ${channel}:`, message.data);
        onUpdate(channel, message.data);
      });
    });
  }
}





