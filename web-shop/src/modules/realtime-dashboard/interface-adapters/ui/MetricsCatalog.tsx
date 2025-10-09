'use client';

import React, { useState } from 'react';

export interface MetricDefinition {
  id: string;
  name: string;
  category: 'Sales' | 'Revenue' | 'Conversion' | 'Retention' | 'Geography' | 'Advanced';
  description: string;
  formula?: string;
  unit: string;
  dataSource: string;
  freshness: string;
  timezone?: string;
  constraints?: string[];
}

const METRICS_CATALOG: MetricDefinition[] = [
  // Sales Metrics
  {
    id: 'total_sales',
    name: 'Total Sales',
    category: 'Sales',
    description: 'Total number of completed transactions',
    formula: 'COUNT(transactions WHERE status = "completed")',
    unit: 'count',
    dataSource: 'transactions.status',
    freshness: 'Real-time (< 1 min)',
    timezone: 'UTC',
    constraints: ['Excludes refunded transactions', 'Includes all payment methods'],
  },
  {
    id: 'transactions',
    name: 'Transactions',
    category: 'Sales',
    description: 'Number of successful payment transactions',
    formula: 'COUNT(payments WHERE status = "success")',
    unit: 'count',
    dataSource: 'payments.status',
    freshness: 'Real-time (< 1 min)',
  },
  {
    id: 'arpu',
    name: 'ARPU',
    category: 'Sales',
    description: 'Average Revenue Per User',
    formula: 'SUM(revenue) / COUNT(DISTINCT users)',
    unit: 'currency',
    dataSource: 'revenue_aggregates',
    freshness: 'Hourly',
    constraints: ['Calculated over rolling 30-day window'],
  },

  // Revenue Metrics
  {
    id: 'total_revenue',
    name: 'Total Revenue',
    category: 'Revenue',
    description: 'Total revenue from all sources',
    formula: 'SUM(order_total WHERE status = "completed")',
    unit: 'currency',
    dataSource: 'orders.order_total',
    freshness: 'Real-time (< 1 min)',
    timezone: 'UTC',
    constraints: ['After FX conversion to base currency (USD)', 'Excludes taxes and fees'],
  },
  {
    id: 'aov',
    name: 'Average Order Value',
    category: 'Revenue',
    description: 'Average value per order',
    formula: 'SUM(order_total) / COUNT(orders)',
    unit: 'currency',
    dataSource: 'orders.order_total',
    freshness: 'Real-time (< 1 min)',
  },
  {
    id: 'rpv',
    name: 'Revenue Per Visitor',
    category: 'Revenue',
    description: 'Average revenue per website visitor',
    formula: 'SUM(revenue) / COUNT(DISTINCT visitors)',
    unit: 'currency',
    dataSource: 'revenue_aggregates, visitor_logs',
    freshness: 'Hourly',
  },
  {
    id: 'net_income',
    name: 'Net Income',
    category: 'Revenue',
    description: 'Revenue after costs and refunds',
    formula: 'SUM(revenue) - SUM(costs) - SUM(refunds)',
    unit: 'currency',
    dataSource: 'financial_aggregates',
    freshness: 'Daily',
  },

  // Conversion Metrics
  {
    id: 'conversion_rate',
    name: 'Conversion Rate',
    category: 'Conversion',
    description: 'Percentage of visitors who make a purchase',
    formula: '(COUNT(buyers) / COUNT(visitors)) * 100',
    unit: 'percentage',
    dataSource: 'visitor_logs, transactions',
    freshness: 'Real-time (< 5 min)',
    constraints: ['Visitor = unique session with > 10s duration'],
  },
  {
    id: 'cart_abandonment',
    name: 'Cart Abandonment Rate',
    category: 'Conversion',
    description: 'Percentage of carts abandoned before checkout',
    formula: '(COUNT(abandoned_carts) / COUNT(carts_created)) * 100',
    unit: 'percentage',
    dataSource: 'cart_events',
    freshness: 'Hourly',
  },
  {
    id: 'refund_rate',
    name: 'Refund Rate',
    category: 'Conversion',
    description: 'Percentage of transactions that are refunded',
    formula: '(COUNT(refunds) / COUNT(transactions)) * 100',
    unit: 'percentage',
    dataSource: 'refunds, transactions',
    freshness: 'Real-time (< 1 min)',
  },

  // Geography Metrics
  {
    id: 'top_regions',
    name: 'Top Regions',
    category: 'Geography',
    description: 'Sales breakdown by geographical region',
    formula: 'GROUP BY country, SUM(sales)',
    unit: 'mixed',
    dataSource: 'orders.shipping_country',
    freshness: 'Real-time (< 1 min)',
    constraints: ['Grouped by ISO country code'],
  },

  // Advanced Metrics
  {
    id: 'ltv',
    name: 'Lifetime Value (LTV)',
    category: 'Advanced',
    description: 'Predicted total revenue from a customer',
    formula: 'AVG(revenue_per_customer) * AVG(retention_months)',
    unit: 'currency',
    dataSource: 'customer_cohorts',
    freshness: 'Weekly',
    constraints: ['Calculated using 12-month cohort analysis'],
  },
  {
    id: 'retention_d1',
    name: 'D1 Retention',
    category: 'Advanced',
    description: 'Percentage of users who return after 1 day',
    formula: '(COUNT(users_active_day_1) / COUNT(new_users)) * 100',
    unit: 'percentage',
    dataSource: 'user_activity_logs',
    freshness: 'Daily',
  },
  {
    id: 'retention_d7',
    name: 'D7 Retention',
    category: 'Advanced',
    description: 'Percentage of users who return after 7 days',
    formula: '(COUNT(users_active_day_7) / COUNT(new_users)) * 100',
    unit: 'percentage',
    dataSource: 'user_activity_logs',
    freshness: 'Weekly',
  },
  {
    id: 'arppu',
    name: 'ARPPU',
    category: 'Advanced',
    description: 'Average Revenue Per Paying User',
    formula: 'SUM(revenue) / COUNT(DISTINCT paying_users)',
    unit: 'currency',
    dataSource: 'revenue_aggregates',
    freshness: 'Hourly',
  },
];

interface MetricsCatalogProps {
  onSelectMetric?: (metric: MetricDefinition) => void;
}

export const MetricsCatalog: React.FC<MetricsCatalogProps> = ({ onSelectMetric }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedMetric, setExpandedMetric] = useState<string | null>(null);

  const categories = ['All', 'Sales', 'Revenue', 'Conversion', 'Geography', 'Advanced'];

  const filteredMetrics = METRICS_CATALOG.filter((metric) => {
    const matchesSearch =
      metric.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      metric.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || metric.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Sales': return 'bg-blue-100 text-blue-700';
      case 'Revenue': return 'bg-green-100 text-green-700';
      case 'Conversion': return 'bg-orange-100 text-orange-700';
      case 'Geography': return 'bg-purple-100 text-purple-700';
      case 'Advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 backdrop-blur supports-[backdrop-filter]:bg-white/70">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📚</span>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Metrics Catalog</h2>
              <p className="text-sm text-gray-600">Complete reference of all available metrics</p>
            </div>
          </div>
          <div className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-semibold rounded-full">
            {filteredMetrics.length} metrics
          </div>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search metrics… (Cmd/Ctrl + /)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* Category Filters */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex gap-2 flex-wrap">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics List */}
      <div className="p-4 sm:p-6 space-y-3 max-h-[600px] overflow-y-auto">
        {filteredMetrics.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-600 font-medium">No metrics found</p>
            <p className="text-sm text-gray-500 mt-2">Try adjusting your search or filters</p>
          </div>
        ) : (
          filteredMetrics.map((metric) => (
            <div
              key={metric.id}
              className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Metric Header */}
              <div
                className="p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => setExpandedMetric(expandedMetric === metric.id ? null : metric.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{metric.name}</h3>
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${getCategoryColor(metric.category)}`}>
                        {metric.category}
                      </span>
                      <span className="text-xs text-gray-500">{metric.unit}</span>
                    </div>
                    <p className="text-sm text-gray-600">{metric.description}</p>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600 ml-4">
                    {expandedMetric === metric.id ? '▼' : '▶'}
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedMetric === metric.id && (
                <div className="p-4 bg-white border-t border-gray-200 space-y-4">
                  {/* Formula */}
                  {metric.formula && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">Formula:</h4>
                      <code className="block p-3 bg-gray-100 rounded text-sm text-gray-800 font-mono">
                        {metric.formula}
                      </code>
                    </div>
                  )}

                  {/* Data Source */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">Data Source:</h4>
                    <p className="text-sm text-gray-600">{metric.dataSource}</p>
                  </div>

                  {/* Freshness */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">Data Freshness:</h4>
                    <p className="text-sm text-gray-600">{metric.freshness}</p>
                  </div>

                  {/* Timezone */}
                  {metric.timezone && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">Timezone:</h4>
                      <p className="text-sm text-gray-600">{metric.timezone}</p>
                    </div>
                  )}

                  {/* Constraints */}
                  {metric.constraints && metric.constraints.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">Constraints & Rules:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {metric.constraints.map((constraint, idx) => (
                          <li key={idx} className="text-sm text-gray-600">{constraint}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Actions */}
                  {onSelectMetric && (
                    <div className="pt-2">
                      <button
                        onClick={() => onSelectMetric(metric)}
                        className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        Use This Metric
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

