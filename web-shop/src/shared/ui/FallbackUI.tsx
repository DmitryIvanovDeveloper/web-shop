import React from 'react';

export type FallbackType = 'loading' | 'error' | 'no-data' | 'maintenance';

interface FallbackUIProps {
  type: FallbackType;
  title?: string;
  message?: string;
  onRetry?: () => void;
  onRefresh?: () => void;
}

export const FallbackUI: React.FC<FallbackUIProps> = ({
  type,
  title,
  message,
  onRetry,
  onRefresh
}) => {
  const getContent = () => {
    switch (type) {
      case 'loading':
        return {
          icon: '⏳',
          defaultTitle: 'Loading...',
          defaultMessage: 'Please wait while we fetch your data',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-700'
        };
      case 'error':
        return {
          icon: '❌',
          defaultTitle: 'Error',
          defaultMessage: 'Something went wrong',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-700'
        };
      case 'no-data':
        return {
          icon: '📭',
          defaultTitle: 'No Data',
          defaultMessage: 'No data available to display',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-700'
        };
      case 'maintenance':
        return {
          icon: '🔧',
          defaultTitle: 'Maintenance',
          defaultMessage: 'System is under maintenance',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-700'
        };
    }
  };

  const content = getContent();

  return (
    <div className={`p-8 rounded-lg border ${content.bgColor} ${content.borderColor}`}>
      <div className="text-center">
        <div className="text-6xl mb-4">{content.icon}</div>
        <h3 className={`text-xl font-semibold mb-2 ${content.textColor}`}>
          {title || content.defaultTitle}
        </h3>
        <p className={`text-sm ${content.textColor} mb-4`}>
          {message || content.defaultMessage}
        </p>
        <div className="flex gap-3 justify-center">
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Retry
            </button>
          )}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Refresh
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
