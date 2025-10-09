import { RealtimeClientPort } from '../../../../application/ports/realtime-client.port';
import { Logger } from '../../../../application/ports/logger.port';

export class UnsubscribeRealtimeUseCase {
  constructor(
    private readonly realtimeClient: RealtimeClientPort,
    private readonly logger: Logger
  ) {}

  async execute(channels: string[]): Promise<void> {
    this.logger.info(`UnsubscribeRealtimeUseCase: Unsubscribing from channels ${channels.join(', ')}`);

    // Unsubscribe from each channel
    channels.forEach(channel => {
      this.realtimeClient.unsubscribe(channel);
    });

    // Disconnect if no more subscriptions
    await this.realtimeClient.disconnect();
  }
}





