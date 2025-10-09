import { Alert, AlertSeverity } from '../../domain/entities/alert.entity';
import { AlertRuleRepositoryPort } from '../ports/alert-rule-repository.port';
import { AlertRepositoryPort } from '../ports/alert-repository.port';
import { NotificationServicePort } from '../ports/notification-service.port';
import { Logger } from '../../../../application/ports/logger.port';
import { Result, Success, Failure } from '../../../../shared/result/result';
import { v4 as uuidv4 } from 'uuid';

export interface EvaluateAlertsInput {
  metrics: Record<string, number>;
}

export class EvaluateAlertsUseCase {
  constructor(
    private readonly alertRuleRepository: AlertRuleRepositoryPort,
    private readonly alertRepository: AlertRepositoryPort,
    private readonly notificationService: NotificationServicePort,
    private readonly logger: Logger
  ) {}

  public async execute(input: EvaluateAlertsInput): Promise<Result<Alert[], Error>> {
    try {
      const rules = await this.alertRuleRepository.findAll();
      const triggeredAlerts: Alert[] = [];

      for (const rule of rules) {
        const metricValue = input.metrics[rule.metric];
        
        if (metricValue === undefined) {
          this.logger.warn('Metric not found for alert rule', { 
            ruleId: rule.id, 
            metric: rule.metric 
          });
          continue;
        }

        const isTriggered = rule.evaluate(metricValue);

        if (isTriggered) {
          const severity = this.determineSeverity(metricValue, rule.threshold);
          const message = this.buildAlertMessage(rule.name, rule.toExpression(), metricValue);

          const alert = Alert.create({
            id: uuidv4(),
            ruleId: rule.id,
            ruleName: rule.name,
            severity,
            message,
            currentValue: metricValue,
            thresholdValue: typeof rule.threshold === 'number' ? rule.threshold : rule.threshold.min,
            deliveryChannels: [], // Will be set from rule configuration in real implementation
          });

          // Check if alert is silenced
          if (!alert.isSilenced()) {
            // Send notifications
            const notifications = alert.deliveryChannels.map(channel => ({
              channel,
              message,
              metadata: {
                alertId: alert.id,
                ruleId: rule.id,
                severity: alert.severity,
                currentValue: metricValue,
              },
            }));

            await this.notificationService.sendBatch(notifications);
            this.logger.info('Alert triggered and notifications sent', { 
              alertId: alert.id, 
              ruleId: rule.id 
            });
          } else {
            this.logger.info('Alert triggered but silenced', { 
              alertId: alert.id, 
              ruleId: rule.id 
            });
          }

          await this.alertRepository.save(alert);
          triggeredAlerts.push(alert);
        }
      }

      return Success.ok(triggeredAlerts);
    } catch (error) {
      this.logger.error('Failed to evaluate alerts', { error });
      return Failure.fail(error as Error);
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

