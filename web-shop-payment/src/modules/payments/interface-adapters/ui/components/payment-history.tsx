'use client';

import { useEffect, useState } from 'react';
import { container } from '../../../../../infrastructure/bootstrap/container';
import { PAYMENT_TYPES } from '../../../infrastructure/bootstrap/types';
import { PaymentRealtimePresenter } from '../../presenters/payment-realtime.presenter';
import { PaymentStorageData } from '../../../application/ports/payment-storage.port';

/**
 * Payment History Component with Real-time Updates
 * 
 * Demonstrates RLS + Realtime:
 * - Uses anon key (client-side safe)
 * - Respects RLS policies (user sees only their transactions)
 * - Real-time updates when new transactions are inserted
 * 
 * Usage:
 * <PaymentHistory userId="user-003" />
 */

interface PaymentHistoryProps {
  userId: string;
}

export function PaymentHistory({ userId }: PaymentHistoryProps): JSX.Element {
  const [transactions, setTransactions] = useState<PaymentStorageData[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get PaymentRealtimePresenter from DI container
    const realtimePresenter = container.get<PaymentRealtimePresenter>(
      PAYMENT_TYPES.PaymentRealtimePresenter
    );

    let unsubscribe: (() => void) | undefined;

    const initRealtime = async () => {
      try {
        console.log('[PaymentHistory] Initializing Realtime for user:', userId);

        // Start listening to transaction_log with RLS
        await realtimePresenter.startListening(userId);
        setIsConnected(true);

        // Subscribe to real-time updates
        unsubscribe = realtimePresenter.onTransactionUpdate((transaction) => {
          console.log('[PaymentHistory] Received real-time transaction:', transaction);

          // Add new transaction to the list (if not already present)
          setTransactions(prev => {
            const exists = prev.some(t => t.id === transaction.id);
            if (exists) {
              // Update existing transaction
              return prev.map(t => t.id === transaction.id ? transaction : t);
            } else {
              // Add new transaction at the beginning
              return [transaction, ...prev];
            }
          });
        });

        console.log('[PaymentHistory] Realtime initialized successfully');
      } catch (err) {
        console.error('[PaymentHistory] Failed to initialize Realtime:', err);
        setError(err instanceof Error ? err.message : 'Failed to connect to Realtime');
        setIsConnected(false);
      }
    };

    initRealtime();

    // Cleanup on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      realtimePresenter.stopListening();
    };
  }, [userId]);

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
        <h3 className="text-red-400 font-semibold mb-2">❌ Realtime Connection Error</h3>
        <p className="text-red-300 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">
          💳 Payment History (Real-time)
        </h2>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-500'}`}></div>
          <span className="text-sm text-gray-400">
            {isConnected ? 'Connected with RLS' : 'Connecting...'}
          </span>
        </div>
      </div>

      <div className="text-xs text-gray-500 mb-4 p-2 bg-gray-900/50 rounded border border-gray-700">
        🔒 <strong>RLS Active:</strong> You only see transactions for user: <code className="text-blue-400">{userId}</code>
        <br />
        🔑 Using: <code className="text-green-400">anon key</code> (client-side safe)
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <p>No transactions yet.</p>
          <p className="text-sm mt-2">New transactions will appear here in real-time! ⚡</p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-sm text-gray-400">
                  {transaction.id}
                </span>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  transaction.status === 'succeeded' 
                    ? 'bg-green-500/20 text-green-400'
                    : transaction.status === 'pending'
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {transaction.status}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Amount:</span>
                  <span className="text-white ml-2 font-semibold">
                    ${transaction.amount} {transaction.currency}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Product:</span>
                  <span className="text-white ml-2">{transaction.product_id}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500">Created:</span>
                  <span className="text-white ml-2">
                    {new Date(transaction.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500 text-center">
        ⚡ Live updates powered by Supabase Realtime + RLS
      </div>
    </div>
  );
}

