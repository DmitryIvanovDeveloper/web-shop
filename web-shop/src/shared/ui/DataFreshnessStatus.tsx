import React from 'react';

export interface DataFreshnessStatusProps {
  overallStatus: 'fresh' | 'warning' | 'stale';
  stalePanels?: string[];
  warningPanels?: string[];
  lastHeartbeat?: Date;
  reconnectAttempts?: number;
  onReconnect?: () => void;
  incidentPlaybook?: string[];
  className?: string;
}

export const DataFreshnessStatus: React.FC<DataFreshnessStatusProps> = ({
  overallStatus,
  stalePanels = [],
  warningPanels = [],
  lastHeartbeat,
  reconnectAttempts = 0,
  onReconnect,
  incidentPlaybook,
  className = '',
}) => {
  const getStatusConfig = () => {
    switch (overallStatus) {
      case 'fresh':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-700',
          icon: '✅',
          title: 'Data is Fresh',
          description: 'All panels are up-to-date',
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-700',
          icon: '⚠️',
          title: 'Data Delayed',
          description: 'Some panels have delayed updates',
        };
      case 'stale':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-700',
          icon: '❌',
          title: 'Data is Stale',
          description: 'Multiple panels have stale data',
        };
    }
  };

  const config = getStatusConfig();
  const showPlaybook = incidentPlaybook && incidentPlaybook.length > 0 && overallStatus !== 'fresh';

  return (
    <div className={`rounded-lg border ${config.border} ${config.bg} p-4 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{config.icon}</span>
            <h3 className={`text-lg font-semibold ${config.text}`}>{config.title}</h3>
          </div>
          
          <p className="text-sm text-gray-600 mb-3">{config.description}</p>

          {}
          {(stalePanels.length > 0 || warningPanels.length > 0) && (
            <div className="space-y-2 mb-3">
              {stalePanels.length > 0 && (
                <div className="flex items-start gap-2">
                  <span className="text-red-600 font-medium text-sm">Stale:</span>
                  <span className="text-sm text-gray-700">{stalePanels.join(', ')}</span>
                </div>
              )}
              {warningPanels.length > 0 && (
                <div className="flex items-start gap-2">
                  <span className="text-yellow-600 font-medium text-sm">Delayed:</span>
                  <span className="text-sm text-gray-700">{warningPanels.join(', ')}</span>
                </div>
              )}
            </div>
          )}

          {}
          {lastHeartbeat && (
            <div className="text-xs text-gray-500">
              Last heartbeat: {lastHeartbeat.toLocaleTimeString()}
            </div>
          )}

          {reconnectAttempts > 0 && (
            <div className="text-xs text-orange-600 mt-1">
              Reconnection attempts: {reconnectAttempts}
            </div>
          )}
        </div>

        {}
        {onReconnect && overallStatus !== 'fresh' && (
          <button
            onClick={onReconnect}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            🔄 Reconnect
          </button>
        )}
      </div>

      {}
      {showPlaybook && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">📋 Incident Playbook:</h4>
          <ol className="list-decimal list-inside space-y-1">
            {incidentPlaybook!.map((step, index) => (
              <li key={index} className="text-sm text-gray-600">
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};

export interface DataFreshnessIndicatorProps {
  status: 'fresh' | 'warning' | 'stale';
  lagSeconds?: number;
  onClick?: () => void;
  className?: string;
}

export const DataFreshnessIndicator: React.FC<DataFreshnessIndicatorProps> = ({
  status,
  lagSeconds,
  onClick,
  className = '',
}) => {
  const getConfig = () => {
    switch (status) {
      case 'fresh':
        return { icon: '🟢', label: 'Fresh', color: 'text-green-600' };
      case 'warning':
        return { icon: '🟡', label: 'Delayed', color: 'text-yellow-600' };
      case 'stale':
        return { icon: '🔴', label: 'Stale', color: 'text-red-600' };
    }
  };

  const config = getConfig();

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors ${className}`}
      title={lagSeconds !== undefined ? `Lag: ${lagSeconds}s` : config.label}
    >
      <span>{config.icon}</span>
      <span className={`text-xs font-medium ${config.color}`}>
        {config.label}
        {lagSeconds !== undefined && ` (${lagSeconds}s)`}
      </span>
    </button>
  );
};

