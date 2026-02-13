import { Logger } from '../../../../../../application/ports/logger.port';
import { Result } from '@/shared/result/result';

export class NotificationServiceMock {
  constructor(private readonly logger: Logger) {}

  async send(message: string): Promise<Result<void, never>> {
        return Result.ok(undefined);
  }
}

