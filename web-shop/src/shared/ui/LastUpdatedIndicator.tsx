import React, { useState, useEffect } from 'react';

export interface LastUpdatedIndicatorProps {
  lastUpdated: Date;
  className?: string;
  showRelativeTime?: boolean;
  targetLatencySeconds?: number; 
  maxLatencySeconds?: number; 
}

export const LastUpdatedIndicator: React.FC<LastUpdatedIndicatorProps> = ({
  lastUpdated,
  className = '',
  showRelativeTime = true,
  targetLatencySeconds = 300,
  maxLatencySeconds = 900,
}) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000); 

    return () => clearInterval(interval);
  }, []);

  const getLagSeconds = (): number => {
    return Math.floor((now.getTime() - lastUpdated.getTime()) / 1000);
  };

  const getStatus = (): 'fresh' | 'warning' | 'stale' => {
    const lag = getLagSeconds();
    if (lag <= targetLatencySeconds) return 'fresh';
    if (lag <= maxLatencySeconds) return 'warning';
    return 'stale';
  };

  const getRelativeTime = (): string => {
    const lagSeconds = getLagSeconds();

    if (lagSeconds < 60) {
      return `${lagSeconds}s ago`;
    }

    const lagMinutes = Math.floor(lagSeconds / 60);
    if (lagMinutes < 60) {
      return `${lagMinutes}m ago`;
    }

    const lagHours = Math.floor(lagMinutes / 60);
    return `${lagHours}h ago`;
  };

  const getStatusConfig = () => {
    const status = getStatus();
    switch (status) {
      case 'fresh':
        return {
          color: 'text-green-600',
          bg: 'bg-green-100',
          border: 'border-green-300',
          icon: '🟢',
          label: 'Fresh',
        };
      case 'warning':
        return {
          color: 'text-yellow-600',
          bg: 'bg-yellow-100',
          border: 'border-yellow-300',
          icon: '🟡',
          label: 'Delayed',
        };
      case 'stale':
        return {
          color: 'text-red-600',
          bg: 'bg-red-100',
          border: 'border-red-300',
          icon: '🔴',
          label: 'Stale',
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${statusConfig.bg} ${statusConfig.border} ${className}`}>
      <span className="text-xs">{statusConfig.icon}</span>
      <div className="flex flex-col">
        <span className={`text-xs font-medium ${statusConfig.color}`}>
          {showRelativeTime ? getRelativeTime() : statusConfig.label}
        </span>
        <span className="text-[10px] text-gray-500">
          {lastUpdated.toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
};

export const LastUpdatedBadge: React.FC<LastUpdatedIndicatorProps> = ({
  lastUpdated,
  className = '',
  targetLatencySeconds = 300,
  maxLatencySeconds = 900,
}) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getLagSeconds = (): number => {
    return Math.floor((now.getTime() - lastUpdated.getTime()) / 1000);
  };

  const getStatus = (): 'fresh' | 'warning' | 'stale' => {
    const lag = getLagSeconds();
    if (lag <= targetLatencySeconds) return 'fresh';
    if (lag <= maxLatencySeconds) return 'warning';
    return 'stale';
  };

  const getRelativeTime = (): string => {
    const lagSeconds = getLagSeconds();
    if (lagSeconds < 60) return `${lagSeconds}s`;
    const lagMinutes = Math.floor(lagSeconds / 60);
    if (lagMinutes < 60) return `${lagMinutes}m`;
    const lagHours = Math.floor(lagMinutes / 60);
    return `${lagHours}h`;
  };

  const getStatusIcon = () => {
    const status = getStatus();
    switch (status) {
      case 'fresh':
        return '🟢';
      case 'warning':
        return '🟡';
      case 'stale':
        return '🔴';
    }
  };

  return (
    <span className={`inline-flex items-center gap-1 text-xs text-gray-600 ${className}`} title={lastUpdated.toLocaleString()}>
      <span>{getStatusIcon()}</span>
      <span>{getRelativeTime()}</span>
    </span>
  );
};

