'use client';

import React from 'react';
import { ShoppingCart, Users, DollarSign, TrendingUp, Package } from 'lucide-react';
import { KPICard } from '@/shared/ui/KPICard';
import { MetricFormatter } from '../../formatters';
import { ComparisonBadge } from './ComparisonBadge';
import { MiniTrendChart } from './MiniTrendChart';
import type { PurchaseSummary } from '../../../domain/entities/purchase-summary.entity';

export interface PurchasePanelProps {
  purchaseSummary?: PurchaseSummary | null;
  isLoading?: boolean;
  className?: string;
}

export function PurchasePanel({ 
  purchaseSummary, 
  isLoading = false, 
  className = '' 
}: PurchasePanelProps) {

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-blue-600" />
            Purchase Analytics
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="h-24 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!purchaseSummary) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-blue-600" />
            Purchase Analytics
          </h3>
        </div>
        <div className="text-center text-gray-500 py-8">
          No purchase data available
        </div>
      </div>
    );
  }

  const growthRate = purchaseSummary.getPurchaseGrowthRate();
  const conversionRate = purchaseSummary.getConversionRate();
  const customerLifetimeValue = purchaseSummary.getCustomerLifetimeValue();

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-blue-600" />
          Purchase Analytics
        </h3>
        <div className="flex items-center gap-2">
          {growthRate !== 0 && (
            <ComparisonBadge 
              percent={Math.abs(growthRate)} 
              direction={growthRate > 0 ? 'up' : 'down'}
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Purchases */}
        <KPICard
          title="Total Purchases"
          value={MetricFormatter.formatNumber(purchaseSummary.totalPurchases)}
          icon="📊"
          trend="up"
          changeLabel="Purchases"
          className="border-l-4 border-l-blue-500"
        />

        {/* Unique Customers */}
        <KPICard
          title="Unique Customers"
          value={MetricFormatter.formatNumber(purchaseSummary.uniqueCustomers)}
          icon="👥"
          subtitle={`${conversionRate.toFixed(1)}% conversion rate`}
          className="border-l-4 border-l-green-500"
        />

        {/* Average Purchase Value */}
        <KPICard
          title="Avg Purchase Value"
          value={MetricFormatter.formatCurrency(purchaseSummary.averagePurchaseValue)}
          icon="💰"
          subtitle={`${purchaseSummary.purchaseFrequency.toFixed(1)}x frequency`}
          className="border-l-4 border-l-purple-500"
        />

        {/* Customer Lifetime Value */}
        <KPICard
          title="Customer LTV"
          value={MetricFormatter.formatCurrency(customerLifetimeValue)}
          icon="📈"
          subtitle={`Top: ${purchaseSummary.topProductCategory}`}
          className="border-l-4 border-l-orange-500"
        />
      </div>

      {/* Purchase Trend Chart */}
      {purchaseSummary.trend && purchaseSummary.trend.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Package className="h-4 w-4" />
              Purchase Trend (Last 7 Days)
            </h4>
          </div>
          <div className="h-32">
            <MiniTrendChart
              data={purchaseSummary.trend.map((point: any) => ({ 
                date: point.timestamp ? point.timestamp.toISOString().split('T')[0] : new Date().toISOString().split('T')[0], 
                value: point.value || 0 
              }))}
              strokeColor="#3B82F6"
            />
          </div>
        </div>
      )}
    </div>
  );
}