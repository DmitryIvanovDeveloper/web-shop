import { AlertRepositoryPort } from '../ports/alert-repository.port';
import { AlertRuleRepositoryPort } from '../ports/alert-rule-repository.port';
import { Logger } from '../../../../../../application/ports/logger.port';
import { Result, Success, Failure } from '../../../../../../shared/domain/result/result';
import { v4 as uuidv4 } from 'uuid';
import { AlertSeverity } from '../../domain/entities/alert.entity';

export interface EvaluateAlertsInput {
  metrics: Record<string, number>;
}

export class EvaluateAlertsUseCase {
  constructor(
    private readonly alertRepository: AlertRepositoryPort,
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

  private determineSeverity(currentValue: number, threshold: number | { min: number; max: number }): AlertSeverity {
    const thresholdValue = typeof threshold === 'number' ? threshold : threshold.min;
    const deviation = Math.abs(currentValue - thresholdValue) / thresholdValue;

    if (deviation >= 0.5) return 'CRITICAL';
    if (deviation >= 0.3) return 'HIGH';
    if (deviation >= 0.1) return 'MEDIUM';
    return 'LOW';
  }

  private buildAlertMessage(ruleName: string, expression: string, currentValue: number): string {
    return `Alert: ${ruleName} - ${expression}. Current value: ${currentValue.toFixed(2)}`;
  }
}

