'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingCart, TrendingUp, Users, DollarSign } from 'lucide-react';
import { PurchasesTable } from '@/shared/ui/PurchasesTable';
import type { PurchaseRow } from '../../../application/ports/purchase-repository.port';
import type { DashboardPresenter } from '../../presenters/dashboard.presenter';

export interface PurchasesAnalyticsPanelProps {
  presenter: DashboardPresenter;
}

export function PurchasesAnalyticsPanel({ presenter }: PurchasesAnalyticsPanelProps) {
  const [purchases, setPurchases] = useState<PurchaseRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPurchases = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const recentPurchases = await presenter.getRecentPurchases(20);
      setPurchases(recentPurchases);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load purchases');
    } finally {
      setIsLoading(false);
    }
  }, [presenter]);

  useEffect(() => {
    loadPurchases();
  }, [loadPurchases]);

  const totalRevenue = purchases.reduce((sum, purchase) => sum + purchase.paidAmount, 0);
  const successfulPurchases = purchases.filter(p => p.paymentStatus === 'succeeded').length;
  const uniqueUsers = new Set(purchases.map(p => p.userId)).size;

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <ShoppingCart className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Recent Purchases</h3>
            <p className="text-sm text-gray-500">Latest transaction data from Supabase</p>
          </div>
        </div>
        
        <button
          onClick={loadPurchases}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Total Revenue</p>
              <p className="text-2xl font-bold text-green-700">
                ${totalRevenue.toFixed(2)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Successful Purchases</p>
              <p className="text-2xl font-bold text-blue-700">
                {successfulPurchases}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Unique Users</p>
              <p className="text-2xl font-bold text-purple-700">
                {uniqueUsers}
              </p>
            </div>
            <Users className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Purchases Table */}
      <div className="border rounded-lg">
        <div className="p-4 border-b bg-gray-50">
          <h4 className="text-sm font-medium text-gray-900">
            Purchase History ({purchases.length} transactions)
          </h4>
        </div>
        
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-sm text-gray-500">Loading purchases...</p>
          </div>
        ) : (
          <PurchasesTable rows={purchases} />
        )}
      </div>
    </div>
  );
}
