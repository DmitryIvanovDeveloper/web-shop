import { Logger } from '../../../../../../application/ports/logger.port';
import { Result, Success } from '../../../../../../shared/domain/result/result';

export class NotificationServiceMock {
  constructor(private readonly logger: Logger) {}

  async send(message: string): Promise<Result<void, never>> {
    this.logger.info('Notification sent', { message });
    return Success.ok(undefined);
  }
}

