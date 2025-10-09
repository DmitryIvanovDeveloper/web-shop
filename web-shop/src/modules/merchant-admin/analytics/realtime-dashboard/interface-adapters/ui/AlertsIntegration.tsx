'use client';

import React, { useState, useEffect } from 'react';
import { AlertsPanel, AlertViewModel } from './AlertsPanel';
import { AlertRepositoryMock } from '../../infrastructure/repositories/alert.repository.mock';
import { AlertRuleRepositoryMock } from '../../infrastructure/repositories/alert-rule.repository.mock';
import { NotificationServiceMock } from '../../infrastructure/services/notification.service.mock';
import { EvaluateAlertsUseCase } from '../../application/use-cases/evaluate-alerts.use-case';
import { AcknowledgeAlertUseCase } from '../../application/use-cases/acknowledge-alert.use-case';
import { SilenceAlertUseCase } from '../../application/use-cases/silence-alert.use-case';
import { Alert } from '../../domain/entities/alert.entity';
import { ConsoleLogger } from '../../../../../../infrastructure/logging/console-logger';

interface AlertsIntegrationProps {
  metrics: Record<string, number>;
}

export const AlertsIntegration: React.FC<AlertsIntegrationProps> = ({ metrics }) => {
  const [alerts, setAlerts] = useState<AlertViewModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize dependencies
  const logger = new ConsoleLogger();
  const alertRepository = new AlertRepositoryMock();
  const alertRuleRepository = new AlertRuleRepositoryMock();
  const notificationService = new NotificationServiceMock(logger);

  const evaluateAlertsUseCase = new EvaluateAlertsUseCase(
    alertRuleRepository,
    logger
  );

  const acknowledgeAlertUseCase = new AcknowledgeAlertUseCase(alertRepository, logger);
  const silenceAlertUseCase = new SilenceAlertUseCase(alertRepository, logger);

  // Evaluate alerts when metrics change
  useEffect(() => {
    const evaluateAlerts = async () => {
      setIsLoading(true);

      const result = await evaluateAlertsUseCase.execute();

      if (result.success) {
        const activeAlerts = await alertRepository.findActiveAlerts();
        setAlerts(activeAlerts.map(toViewModel));
      } else {
        console.error('Failed to evaluate alerts:', result.error);
      }

      setIsLoading(false);
    };

    evaluateAlerts();
  }, [metrics]);

  const handleAcknowledge = async (alertId: string) => {
    const result = await acknowledgeAlertUseCase.execute({
      alertId,
      userId: 'current-user', // In real app, get from auth context
    });

    if (result.success) {
      // Refresh alerts
      const activeAlerts = await alertRepository.findActiveAlerts();
      setAlerts(activeAlerts.map(toViewModel));
    }
  };

  const handleResolve = async (alertId: string) => {
    const alert = await alertRepository.findById(alertId);
    if (alert) {
      const resolvedAlert = alert.resolve('current-user');
      await alertRepository.update(resolvedAlert);

      // Refresh alerts
      const activeAlerts = await alertRepository.findActiveAlerts();
      setAlerts(activeAlerts.map(toViewModel));
    }
  };

  const handleSilence = async (alertId: string, duration: number) => {
    const result = await silenceAlertUseCase.execute({
      alertId,
      duration,
    });

    if (result.success) {
      // Refresh alerts
      const activeAlerts = await alertRepository.findActiveAlerts();
      setAlerts(activeAlerts.map(toViewModel));
    }
  };

  const toViewModel = (alert: Alert): AlertViewModel => {
    return {
      id: alert.id,
      ruleName: alert.ruleName,
      severity: alert.severity,
      message: alert.message,
      triggeredAt: alert.triggeredAt.toISOString(),
      isAcknowledged: !!alert.acknowledgedAt,
      isResolved: !!alert.resolvedAt,
      isSilenced: alert.isSilenced(),
      currentValue: alert.currentValue,
      thresholdValue: alert.thresholdValue,
      escalationLevel: alert.escalationLevel,
    };
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔔</span>
          <h2 className="text-xl font-bold text-gray-900">Alerts & Notifications</h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <AlertsPanel
      alerts={alerts}
      onAcknowledge={handleAcknowledge}
      onResolve={handleResolve}
      onSilence={handleSilence}
    />
  );
};

