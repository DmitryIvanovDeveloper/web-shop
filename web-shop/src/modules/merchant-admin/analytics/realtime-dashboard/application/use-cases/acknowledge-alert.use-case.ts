import { AlertRepositoryPort } from '../ports/alert-repository.port';
import { Logger } from '../../../../../../application/ports/logger.port';
import { Result, Success } from '../../../../../../shared/domain/result/result';

export interface AcknowledgeAlertInput {
  alertId: string;
}

export class AcknowledgeAlertUseCase {
  constructor(
    private readonly alertRepository: AlertRepositoryPort,
    private readonly logger: Logger
  ) {}

  public async execute(input: AcknowledgeAlertInput): Promise<Result<void, Error>> {
    try {
      const alert = await this.alertRepository.findById(input.alertId);
      if (!alert) {
        return Result.error(new Error(`Alert not found: ${input.alertId}`));
      }

      const acknowledgedAlert = alert.acknowledge(input.alertId);
      await this.alertRepository.update(acknowledgedAlert);
      this.logger.info('Alert acknowledged', { alertId: input.alertId });
      return Success.ok(undefined);
    } catch (error) {
      this.logger.error('Failed to acknowledge alert', { alertId: input.alertId, error });
      return Result.error(error as Error);
    }
  }
}

