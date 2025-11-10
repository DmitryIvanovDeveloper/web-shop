import { Suspense } from 'react';
import { PaymentHistory } from '../../../src/modules/payments/interface-adapters/ui/components/payment-history';

/**
 * Payment History Page with Real-time Updates
 * 
 * Test URL: /payment/history?userId=user-003
 * 
 * This page demonstrates:
 * - Supabase Realtime with RLS
 * - Client-side safe (uses anon key)
 * - User sees only their transactions
 */

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  searchParams: { userId?: string };
}

export default function PaymentHistoryPage({ searchParams }: PageProps): JSX.Element {
  const userId = searchParams.userId || 'user-003'; // Default for testing

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            🔄 Real-time Payment History
          </h1>
          <p className="text-gray-400">
            Live updates powered by Supabase Realtime + Row Level Security
          </p>
        </div>

        <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-4 mb-6">
          <h3 className="text-blue-400 font-semibold mb-2">🧪 How to Test:</h3>
          <ol className="text-blue-300 text-sm space-y-1 ml-4 list-decimal">
            <li>Open this page with <code className="bg-blue-950 px-1 rounded">?userId=user-003</code></li>
            <li>Make a payment (it will save to <code className="bg-blue-950 px-1 rounded">transaction_log</code>)</li>
            <li>Watch it appear here in <strong>real-time</strong>! ⚡</li>
            <li>Open another tab with different userId - you won't see each other's transactions (RLS)</li>
          </ol>
        </div>

        <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4 mb-6">
          <h3 className="text-yellow-400 font-semibold mb-2">🔒 Security Info:</h3>
          <ul className="text-yellow-300 text-sm space-y-1 ml-4 list-disc">
            <li>Using <code className="bg-yellow-950 px-1 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> (safe for client)</li>
            <li>RLS policies ensure you only see your own transactions</li>
            <li>Realtime events are filtered by RLS automatically</li>
          </ul>
        </div>

        <Suspense fallback={
          <div className="bg-gray-800/50 rounded-lg p-6 text-center">
            <div className="animate-pulse text-gray-400">Loading payment history...</div>
          </div>
        }>
          <PaymentHistory userId={userId} />
        </Suspense>

        <div className="mt-8 bg-gray-800/30 border border-gray-700 rounded-lg p-4">
          <h3 className="text-white font-semibold mb-2">📚 Technical Details:</h3>
          <div className="text-sm text-gray-400 space-y-1">
            <p>• <strong>Table:</strong> <code className="text-blue-400">transaction_log</code></p>
            <p>• <strong>Channel:</strong> <code className="text-green-400">transaction_log</code></p>
            <p>• <strong>Events:</strong> INSERT, UPDATE, DELETE</p>
            <p>• <strong>RLS Policy:</strong> <code className="text-purple-400">user_id = auth.uid()</code></p>
            <p>• <strong>Client:</strong> SupabaseRealtimeClient (Inversify DI)</p>
            <p>• <strong>Presenter:</strong> PaymentRealtimePresenter (Clean Architecture)</p>
          </div>
        </div>
      </div>
    </div>
  );
}









