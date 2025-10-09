import React from 'react';

export interface AlertViewModel {
  id: string;
  ruleName: string;
  severity: string;
  message: string;
  triggeredAt: string;
  isAcknowledged: boolean;
  isResolved: boolean;
  isSilenced: boolean;
  currentValue: number;
  thresholdValue: number;
  escalationLevel: number;
}

interface AlertsPanelProps {
  alerts: AlertViewModel[];
  onAcknowledge?: (alertId: string) => void;
  onResolve?: (alertId: string) => void;
  onSilence?: (alertId: string, duration: number) => void;
}

export const AlertsPanel: React.FC<AlertsPanelProps> = ({
  alerts,
  onAcknowledge,
  onResolve,
  onSilence,
}) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-100 border-red-500 text-red-900';
      case 'HIGH':
        return 'bg-orange-100 border-orange-500 text-orange-900';
      case 'MEDIUM':
        return 'bg-yellow-100 border-yellow-500 text-yellow-900';
      case 'LOW':
        return 'bg-blue-100 border-blue-500 text-blue-900';
      default:
        return 'bg-gray-100 border-gray-500 text-gray-900';
    }
  };

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-500 text-white';
      case 'HIGH':
        return 'bg-orange-500 text-white';
      case 'MEDIUM':
        return 'bg-yellow-500 text-white';
      case 'LOW':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  if (alerts.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">🔔</span>
          <h2 className="text-xl font-bold text-gray-900">Alerts & Notifications</h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="text-6xl mb-4">✅</div>
            <p className="text-gray-600 font-medium">No active alerts</p>
            <p className="text-sm text-gray-500 mt-2">All metrics are within normal thresholds</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔔</span>
          <h2 className="text-xl font-bold text-gray-900">Alerts & Notifications</h2>
          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
            {alerts.length} Active
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`border-l-4 rounded-lg p-4 ${getSeverityColor(alert.severity)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 text-xs font-bold rounded ${getSeverityBadgeColor(alert.severity)}`}>
                    {alert.severity}
                  </span>
                  <h3 className="font-semibold">{alert.ruleName}</h3>
                  {alert.isSilenced && (
                    <span className="px-2 py-1 bg-gray-500 text-white text-xs font-semibold rounded">
                      SILENCED
                    </span>
                  )}
                </div>
                <p className="text-sm mb-2">{alert.message}</p>
                <div className="flex items-center gap-4 text-xs text-gray-600">
                  <span>🕐 {new Date(alert.triggeredAt).toLocaleString()}</span>
                  <span>📊 Current: {alert.currentValue.toFixed(2)}</span>
                  <span>🎯 Threshold: {alert.thresholdValue.toFixed(2)}</span>
                </div>
              </div>

              {!alert.isResolved && (
                <div className="flex gap-2 ml-4">
                  {!alert.isAcknowledged && onAcknowledge && (
                    <button
                      onClick={() => onAcknowledge(alert.id)}
                      className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors"
                    >
                      Acknowledge
                    </button>
                  )}
                  {onResolve && (
                    <button
                      onClick={() => onResolve(alert.id)}
                      className="px-3 py-1 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition-colors"
                    >
                      Resolve
                    </button>
                  )}
                  {!alert.isSilenced && onSilence && (
                    <button
                      onClick={() => onSilence(alert.id, 30)}
                      className="px-3 py-1 bg-gray-600 text-white text-xs font-medium rounded hover:bg-gray-700 transition-colors"
                    >
                      Silence (30m)
                    </button>
                  )}
                </div>
              )}

              {alert.isResolved && (
                <div className="ml-4">
                  <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded">
                    ✓ RESOLVED
                  </span>
                </div>
              )}
            </div>

            {alert.isAcknowledged && !alert.isResolved && (
              <div className="mt-3 pt-3 border-t border-gray-300">
                <span className="text-xs text-gray-600">
                  ✓ Acknowledged
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

