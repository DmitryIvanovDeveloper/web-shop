import { AlertRepositoryPort } from '../ports/alert-repository.port';
import { AlertRuleRepositoryPort } from '../ports/alert-rule-repository.port';
import { Logger } from '../../../../../../application/ports/logger.port';
import { Result, Success, Failure } from '../../../../../../shared/domain/result/result';

export interface EvaluateAlertsInput {
  metrics: Record<string, number>;
}

export class EvaluateAlertsUseCase {
  constructor(
    private readonly alertRuleRepository: AlertRuleRepositoryPort,
    private readonly logger: Logger
  ) {}

  public async execute(): Promise<Result<void, Error>> {
    try {
      const rules = await this.alertRuleRepository.findAll();

      // Evaluate rules against current metrics (stub)
      // ...

      this.logger.info('Alerts evaluated', { rules: rules.length });
      return Success.ok(undefined);
    } catch (error) {
      this.logger.error('Failed to evaluate alerts', { error });
      return Failure.error(error as Error);
    }
  }
}

