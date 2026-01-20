import React from 'react';

export type ThresholdStatus = 'success' | 'warning' | 'danger' | 'neutral';

export interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  trend?: 'up' | 'down' | 'neutral';
  status?: ThresholdStatus;
  subtitle?: string;
  icon?: string;
  loading?: boolean;
  className?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  change,
  changeLabel,
  trend = 'neutral',
  status = 'neutral',
  subtitle,
  icon,
  loading = false,
  className = '',
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-700',
          icon: 'text-green-500',
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-700',
          icon: 'text-yellow-500',
        };
      case 'danger':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-700',
          icon: 'text-red-500',
        };
      default:
        return {
          bg: 'bg-white',
          border: 'border-gray-200',
          text: 'text-gray-700',
          icon: 'text-gray-500',
        };
    }
  };

  const getTrendConfig = () => {
    switch (trend) {
      case 'up':
        return {
          color: 'text-green-600',
          icon: '↑',
          bg: 'bg-green-100',
        };
      case 'down':
        return {
          color: 'text-red-600',
          icon: '↓',
          bg: 'bg-red-100',
        };
      default:
        return {
          color: 'text-gray-600',
          icon: '→',
          bg: 'bg-gray-100',
        };
    }
  };

  const statusConfig = getStatusConfig();
  const trendConfig = getTrendConfig();

  if (loading) {
    return (
      <div className={`${statusConfig.bg} ${statusConfig.border} border rounded-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
          <div className="h-8 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-300 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${statusConfig.bg} ${statusConfig.border} border rounded-lg p-6 hover:shadow-lg transition-shadow ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
          {subtitle && (
            <p className="text-xs text-gray-500">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className={`text-2xl ${statusConfig.icon}`}>
            {icon}
          </div>
        )}
      </div>

      <div className="mb-3">
        <div className={`text-3xl font-bold ${statusConfig.text}`}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
      </div>

      {change !== undefined && (
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${trendConfig.bg} ${trendConfig.color}`}>
            <span className="mr-1">{trendConfig.icon}</span>
            {change > 0 ? '+' : ''}{change.toFixed(1)}%
          </span>
          {changeLabel && (
            <span className="text-xs text-gray-500">{changeLabel}</span>
          )}
        </div>
      )}
    </div>
  );
};

interface KPIGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export const KPIGrid: React.FC<KPIGridProps> = ({ 
  children, 
  columns = 4,
  className = '' 
}) => {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-4 ${className}`}>
      {children}
    </div>
  );
};

