import React, { useMemo, useState } from 'react';

export interface TransactionRow {
  id: string;
  createdAt: string; 
  user: string;
  amount: number;
  currency: string;
  country?: string;
  method?: string; 
  status: 'success' | 'refunded' | 'chargeback' | 'failed';
}

interface TransactionsTableProps {
  rows: TransactionRow[];
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({ rows }) => {
  const [sort, setSort] = useState<{ key: keyof TransactionRow; dir: 'asc' | 'desc' }>({ key: 'createdAt', dir: 'desc' });

  const sorted = useMemo(() => {
    const copy = [...rows];
    const getComparable = (r: TransactionRow): number | string => {
      switch (sort.key) {
        case 'createdAt':
          return new Date(r.createdAt).getTime();
        case 'amount':
          return r.amount;
        case 'user':
          return r.user || '';
        case 'currency':
          return r.currency || '';
        case 'country':
          return r.country || '';
        case 'method':
          return r.method || '';
        case 'status':
          return r.status || '';
        case 'id':
          return r.id || '';
        default:
          return '';
      }
    };
    copy.sort((a, b) => {
      const v1 = getComparable(a);
      const v2 = getComparable(b);
      if (v1 === v2) return 0;
      const res = v1 > v2 ? 1 : -1;
      return sort.dir === 'asc' ? res : -res;
    });
    return copy;
  }, [rows, sort]);

  const toggle = (key: keyof TransactionRow) => {
    setSort(prev => ({ key, dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc' }));
  };

  const f = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="overflow-x-auto border rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {[
              ['createdAt', 'Date'],
              ['user', 'User'],
              ['amount', 'Amount'],
              ['currency', 'Cur'],
              ['country', 'Country'],
              ['method', 'Method'],
              ['status', 'Status'],
            ].map(([key, label]) => (
              <th key={key} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => toggle(key as keyof TransactionRow)}>
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {sorted.map(r => (
            <tr key={r.id} className="hover:bg-gray-50">
              <td className="px-4 py-2 text-sm text-gray-900">{new Date(r.createdAt).toLocaleString()}</td>
              <td className="px-4 py-2 text-sm text-gray-700">{r.user}</td>
              <td className="px-4 py-2 text-sm text-gray-900">{f.format(r.amount)}</td>
              <td className="px-4 py-2 text-sm text-gray-500">{r.currency}</td>
              <td className="px-4 py-2 text-sm text-gray-700">{r.country || '-'}</td>
              <td className="px-4 py-2 text-sm text-gray-700">{r.method || '-'}</td>
              <td className="px-4 py-2 text-sm">
                <span className={`px-2 py-1 rounded text-xs ${
                  r.status === 'success' ? 'bg-emerald-100 text-emerald-700' :
                  r.status === 'refunded' ? 'bg-yellow-100 text-yellow-700' :
                  r.status === 'chargeback' ? 'bg-rose-100 text-rose-700' :
                  'bg-gray-100 text-gray-700'
                }`}>{r.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

