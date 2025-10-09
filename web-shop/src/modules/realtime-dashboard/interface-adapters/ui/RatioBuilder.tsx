import React, { useState } from 'react';
import { DerivedMetric, MetricOperator } from '../../domain/entities/derived-metric.entity';
import { MetricOption } from './MetricSelector';

export interface RatioBuilderProps {
  availableMetrics: MetricOption[];
  onSave: (metric: {
    name: string;
    numeratorMetricId: string;
    denominatorMetricId?: string;
    operator: MetricOperator;
    format: 'number' | 'currency' | 'percentage';
    decimals: number;
  }) => void;
  onCancel: () => void;
  className?: string;
}

export const RatioBuilder: React.FC<RatioBuilderProps> = ({
  availableMetrics,
  onSave,
  onCancel,
  className = '',
}) => {
  const [name, setName] = useState('');
  const [numeratorId, setNumeratorId] = useState('');
  const [denominatorId, setDenominatorId] = useState('');
  const [operator, setOperator] = useState<MetricOperator>('divide');
  const [format, setFormat] = useState<'number' | 'currency' | 'percentage'>('number');
  const [decimals, setDecimals] = useState(2);

  const operatorOptions: { value: MetricOperator; label: string; requiresDenominator: boolean }[] = [
    { value: 'divide', label: '÷ Division', requiresDenominator: true },
    { value: 'percentage', label: '% Percentage', requiresDenominator: true },
    { value: 'multiply', label: '× Multiplication', requiresDenominator: true },
    { value: 'add', label: '+ Addition', requiresDenominator: true },
    { value: 'subtract', label: '− Subtraction', requiresDenominator: true },
  ];

  const requiresDenominator = operatorOptions.find(op => op.value === operator)?.requiresDenominator;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !numeratorId) {
      return;
    }

    if (requiresDenominator && !denominatorId) {
      return;
    }

    onSave({
      name: name.trim(),
      numeratorMetricId: numeratorId,
      denominatorMetricId: requiresDenominator ? denominatorId : undefined,
      operator,
      format,
      decimals,
    });
  };

  const isValid = name.trim() !== '' && numeratorId !== '' && (!requiresDenominator || denominatorId !== '');

  const numeratorMetric = availableMetrics.find(m => m.id === numeratorId);
  const denominatorMetric = availableMetrics.find(m => m.id === denominatorId);

  // Generate preview formula
  const getFormulaPreview = () => {
    if (!numeratorMetric) return 'Select metrics to see preview';

    const numLabel = numeratorMetric.label;
    const denomLabel = denominatorMetric?.label || '?';

    switch (operator) {
      case 'divide':
        return `${numLabel} ÷ ${denomLabel}`;
      case 'percentage':
        return `(${numLabel} ÷ ${denomLabel}) × 100%`;
      case 'multiply':
        return `${numLabel} × ${denomLabel}`;
      case 'add':
        return `${numLabel} + ${denomLabel}`;
      case 'subtract':
        return `${numLabel} − ${denomLabel}`;
      default:
        return 'Unknown operation';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg border border-gray-200 ${className}`}>
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <span className="text-2xl">🧮</span>
          <span>Ratio Builder</span>
        </h3>
        <p className="text-sm text-gray-600 mt-1">Create custom derived metrics from existing metrics</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Metric Name */}
        <div>
          <label htmlFor="metric-name" className="block text-sm font-medium text-gray-700 mb-2">
            Metric Name *
          </label>
          <input
            id="metric-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Conversion Rate, Revenue per User"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        {/* Operator */}
        <div>
          <label htmlFor="operator" className="block text-sm font-medium text-gray-700 mb-2">
            Operation *
          </label>
          <select
            id="operator"
            value={operator}
            onChange={(e) => setOperator(e.target.value as MetricOperator)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {operatorOptions.map(op => (
              <option key={op.value} value={op.value}>
                {op.label}
              </option>
            ))}
          </select>
        </div>

        {/* Numerator */}
        <div>
          <label htmlFor="numerator" className="block text-sm font-medium text-gray-700 mb-2">
            Numerator (First Metric) *
          </label>
          <select
            id="numerator"
            value={numeratorId}
            onChange={(e) => setNumeratorId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          >
            <option value="">Select a metric</option>
            {availableMetrics.map(metric => (
              <option key={metric.id} value={metric.id}>
                {metric.label} ({metric.category})
              </option>
            ))}
          </select>
        </div>

        {/* Denominator */}
        {requiresDenominator && (
          <div>
            <label htmlFor="denominator" className="block text-sm font-medium text-gray-700 mb-2">
              Denominator (Second Metric) *
            </label>
            <select
              id="denominator"
              value={denominatorId}
              onChange={(e) => setDenominatorId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">Select a metric</option>
              {availableMetrics
                .filter(m => m.id !== numeratorId)
                .map(metric => (
                  <option key={metric.id} value={metric.id}>
                    {metric.label} ({metric.category})
                  </option>
                ))}
            </select>
          </div>
        )}

        {/* Formula Preview */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-sm font-medium text-gray-700 mb-2">Formula Preview:</div>
          <div className="font-mono text-lg text-indigo-600">{getFormulaPreview()}</div>
        </div>

        {/* Format Options */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="format" className="block text-sm font-medium text-gray-700 mb-2">
              Display Format
            </label>
            <select
              id="format"
              value={format}
              onChange={(e) => setFormat(e.target.value as 'number' | 'currency' | 'percentage')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="number">Number</option>
              <option value="currency">Currency</option>
              <option value="percentage">Percentage</option>
            </select>
          </div>

          <div>
            <label htmlFor="decimals" className="block text-sm font-medium text-gray-700 mb-2">
              Decimal Places
            </label>
            <input
              id="decimals"
              type="number"
              min="0"
              max="6"
              value={decimals}
              onChange={(e) => setDecimals(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isValid}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Create Metric
          </button>
        </div>
      </form>
    </div>
  );
};


