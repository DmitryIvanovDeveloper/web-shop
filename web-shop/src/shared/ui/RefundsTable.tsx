import React from 'react';

export interface RefundRow {
  id: string;
  transactionId: string;
  createdAt: string;
  amount: number;
  currency: string;
  reason?: string;
  type: 'refund' | 'chargeback';
}

interface RefundsTableProps {
  rows: RefundRow[];
}

export const RefundsTable: React.FC<RefundsTableProps> = ({ rows }) => {
  const f = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return (
    <div className="overflow-x-auto border rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Currency</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {rows.map(r => (
            <tr key={r.id} className="hover:bg-gray-50">
              <td className="px-4 py-2 text-sm text-gray-900">{new Date(r.createdAt).toLocaleString()}</td>
              <td className="px-4 py-2 text-sm text-blue-700">{r.transactionId}</td>
              <td className="px-4 py-2 text-sm text-gray-900">{f.format(r.amount)}</td>
              <td className="px-4 py-2 text-sm text-gray-500">{r.currency}</td>
              <td className="px-4 py-2 text-sm">
                <span className={`px-2 py-1 rounded text-xs ${r.type === 'refund' ? 'bg-yellow-100 text-yellow-700' : 'bg-rose-100 text-rose-700'}`}>{r.type}</span>
              </td>
              <td className="px-4 py-2 text-sm text-gray-700">{r.reason || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

