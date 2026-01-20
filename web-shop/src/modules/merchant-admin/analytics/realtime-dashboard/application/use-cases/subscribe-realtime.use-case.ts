import { injectable, inject } from 'inversify';
import type { RealtimeClientPort } from '../../../../../../application/ports/realtime-client.port';
import type { Logger } from '../../../../../../application/ports/logger.port';
import { ROOT_TYPES } from '../../../../../../infrastructure/bootstrap/types';

@injectable()
export class SubscribeRealtimeUseCase {
  constructor(
    @inject(ROOT_TYPES.RealtimeClient)
    private readonly realtimeClient: RealtimeClientPort,
    @inject(ROOT_TYPES.Logger)
    private readonly logger: Logger
  ) {}

  async execute(
    channels: string[],
    onUpdate: (channel: string, data: any) => void
  ): Promise<void> {
    if (!this.realtimeClient.isConnected()) {
      await this.realtimeClient.connect();
    }

    channels.forEach(channel => {
      this.realtimeClient.subscribe(channel, (message) => {
        onUpdate(channel, message.data);
      });
    });
  }
}

