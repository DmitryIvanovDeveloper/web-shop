import React, { useState, useEffect, useCallback } from 'react';

export type ConnectionStatusType = 'connected' | 'disconnected' | 'connecting' | 'error';

interface ConnectionStatusProps {
  status: ConnectionStatusType;
  lastConnected?: Date;
  retryCount?: number;
  onRetry?: () => void;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  status,
  lastConnected,
  retryCount,
  onRetry
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'connected': return 'bg-green-50 border-green-200 text-green-700';
      case 'connecting': return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'error': return 'bg-red-50 border-red-200 text-red-700';
      default: return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'connected': return '✅';
      case 'connecting': return '⏳';
      case 'error': return '❌';
      default: return '⚪';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected': return 'Connected';
      case 'connecting': return 'Connecting...';
      case 'error': return `Connection Error${retryCount ? ` (Retry ${retryCount})` : ''}`;
      default: return 'Disconnected';
    }
  };

  return (
    <div className={`p-3 rounded-lg border ${getStatusColor()} flex items-center justify-between`}>
      <div className="flex items-center gap-2">
        <span className="text-xl">{getStatusIcon()}</span>
        <span className="font-medium">{getStatusText()}</span>
        {lastConnected && status === 'connected' && (
          <span className="text-sm opacity-75">
            · Last: {lastConnected.toLocaleTimeString()}
          </span>
        )}
      </div>
      {status === 'error' && onRetry && (
        <button
          onClick={onRetry}
          className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  );
};

export function useConnectionStatus() {
  const [status, setStatus] = useState<ConnectionStatusType>('disconnected');
  const [lastConnected, setLastConnected] = useState<Date | undefined>();
  const [retryCount, setRetryCount] = useState(0);

  const updateStatus = useCallback((newStatus: ConnectionStatusType) => {
    setStatus(newStatus);
    if (newStatus === 'connected') {
      setLastConnected(new Date());
      setRetryCount(0);
    } else if (newStatus === 'error') {
      setRetryCount(prev => prev + 1);
    }
  }, []);

  const retry = useCallback(() => {
    setStatus('connecting');
    
  }, []);

  return { status, lastConnected, retryCount, updateStatus, retry };
}
