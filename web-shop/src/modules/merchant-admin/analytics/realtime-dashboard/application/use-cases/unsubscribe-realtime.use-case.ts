import { injectable, inject } from 'inversify';
import type { RealtimeClientPort } from '../../../../../../application/ports/realtime-client.port';
import type { Logger } from '../../../../../../application/ports/logger.port';
import { ROOT_TYPES } from '../../../../../../infrastructure/bootstrap/types';

@injectable()
export class UnsubscribeRealtimeUseCase {
  constructor(
    @inject(ROOT_TYPES.RealtimeClient)
    private readonly realtimeClient: RealtimeClientPort,
    @inject(ROOT_TYPES.Logger)
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





