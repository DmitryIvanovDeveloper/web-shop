import { AlertRepositoryPort } from '../ports/alert-repository.port';
import { Logger } from '../../../../../../application/ports/logger.port';
import { Result, Success } from '../../../../../../shared/domain/result/result';

export interface SilenceAlertInput {
  alertId: string;
  duration: number; // minutes
  reason?: string;
}

export class SilenceAlertUseCase {
  constructor(
    private readonly alertRepository: AlertRepositoryPort,
    private readonly logger: Logger
  ) {}

  public async execute(input: SilenceAlertInput): Promise<Result<void, Error>> {
    try {
      const alert = await this.alertRepository.findById(input.alertId);

      if (!alert) {
        return Result.error(new Error(`Alert not found: ${input.alertId}`));
      }

      const silencedAlert = alert.silence(input.duration, input.reason);
      await this.alertRepository.update(silencedAlert);

      this.logger.info('Alert silenced', { 
        alertId: input.alertId, 
        duration: input.duration,
        reason: input.reason
      });

      return Success.ok(undefined);
    } catch (error) {
      this.logger.error('Failed to silence alert', { 
        alertId: input.alertId, 
        error 
      });
      return Result.error(error as Error);
    }
  }
}

