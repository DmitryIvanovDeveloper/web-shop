import React, { useState } from 'react';

export interface MetricOption {
  id: string;
  label: string;
  category: string;
  color: string;
  description?: string;
}

export interface MetricSelectorProps {
  availableMetrics: MetricOption[];
  selectedMetrics: string[];
  onSelect: (metricIds: string[]) => void;
  maxSelection?: number;
  className?: string;
}

export const MetricSelector: React.FC<MetricSelectorProps> = ({
  availableMetrics,
  selectedMetrics,
  onSelect,
  maxSelection = 5,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const categories = Array.from(new Set(availableMetrics.map(m => m.category)));

  const filteredMetrics = availableMetrics.filter(metric =>
    metric.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    metric.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleMetric = (metricId: string) => {
    const isSelected = selectedMetrics.includes(metricId);
    
    if (isSelected) {
      onSelect(selectedMetrics.filter(id => id !== metricId));
    } else {
      if (selectedMetrics.length >= maxSelection) {
        return; // Max selection reached
      }
      onSelect([...selectedMetrics, metricId]);
    }
  };

  const clearAll = () => {
    onSelect([]);
  };

  const selectedOptions = availableMetrics.filter(m => selectedMetrics.includes(m.id));

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <span className="text-xl">📊</span>
        <span className="font-medium text-gray-700">
          Select Metrics ({selectedMetrics.length}/{maxSelection})
        </span>
        <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {/* Selected Metrics Pills */}
      {selectedMetrics.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {selectedOptions.map(metric => (
            <div
              key={metric.id}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
              style={{
                backgroundColor: `${metric.color}20`,
                border: `1px solid ${metric.color}`,
                color: metric.color,
              }}
            >
              <span>{metric.label}</span>
              <button
                onClick={() => toggleMetric(metric.id)}
                className="hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-1"
                style={{ color: metric.color }}
                aria-label={`Remove ${metric.label}`}
              >
                ×
              </button>
            </div>
          ))}
          {selectedMetrics.length > 1 && (
            <button
              onClick={clearAll}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded-full"
            >
              <span>Clear all</span>
              <span>×</span>
            </button>
          )}
        </div>
      )}

      {/* Overlay Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Panel */}
          <div
            className="absolute top-full left-0 mt-2 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-[500px] flex flex-col"
            role="dialog"
            aria-label="Metric selection panel"
          >
            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <input
                type="text"
                placeholder="Search metrics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
            </div>

            {/* Metrics List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {categories.map(category => {
                const categoryMetrics = filteredMetrics.filter(m => m.category === category);
                
                if (categoryMetrics.length === 0) return null;

                return (
                  <div key={category}>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">{category}</h3>
                    <div className="space-y-2">
                      {categoryMetrics.map(metric => {
                        const isSelected = selectedMetrics.includes(metric.id);
                        const isDisabled = !isSelected && selectedMetrics.length >= maxSelection;

                        return (
                          <button
                            key={metric.id}
                            onClick={() => !isDisabled && toggleMetric(metric.id)}
                            disabled={isDisabled}
                            className={`w-full text-left px-3 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                              isSelected
                                ? 'bg-indigo-50 border-2 border-indigo-500'
                                : isDisabled
                                ? 'bg-gray-50 border border-gray-200 opacity-50 cursor-not-allowed'
                                : 'bg-white border border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                            }`}
                            aria-pressed={isSelected}
                            aria-disabled={isDisabled}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: metric.color }}
                                  aria-hidden="true"
                                />
                                <span className="font-medium text-gray-900">{metric.label}</span>
                              </div>
                              {isSelected && (
                                <span className="text-indigo-600 font-bold">✓</span>
                              )}
                            </div>
                            {metric.description && (
                              <p className="text-xs text-gray-500 mt-1 ml-5">{metric.description}</p>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {filteredMetrics.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No metrics found for "{searchQuery}"
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 flex items-center justify-between bg-gray-50 rounded-b-lg">
              <div className="text-sm text-gray-600">
                {selectedMetrics.length} of {maxSelection} selected
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};


