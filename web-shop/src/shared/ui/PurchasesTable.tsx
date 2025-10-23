import React, { useMemo, useState } from 'react';

export interface PurchaseRow {
  id: string;
  createdAt: string; // ISO date
  userId: string;
  productId: string;
  productTitle?: string;
  productRarity?: string;
  paidAmount: number;
  paymentStatus: 'succeeded' | 'pending' | 'failed' | 'refunded';
  paymentMethod?: string;
  stripePaymentIntentId?: string;
  appId?: string;
  merchantId?: string;
}

interface PurchasesTableProps {
  rows: PurchaseRow[];
}

export const PurchasesTable: React.FC<PurchasesTableProps> = ({ rows }) => {
  const [sort, setSort] = useState<{ key: keyof PurchaseRow; dir: 'asc' | 'desc' }>({ key: 'createdAt', dir: 'desc' });

  const sorted = useMemo(() => {
    const copy = [...rows];
    const getComparable = (r: PurchaseRow): number | string => {
      switch (sort.key) {
        case 'createdAt':
          return new Date(r.createdAt).getTime();
        case 'paidAmount':
          return r.paidAmount;
        case 'userId':
          return r.userId || '';
        case 'productId':
          return r.productId || '';
        case 'productTitle':
          return r.productTitle || '';
        case 'productRarity':
          return r.productRarity || '';
        case 'paymentStatus':
          return r.paymentStatus || '';
        case 'paymentMethod':
          return r.paymentMethod || '';
        case 'appId':
          return r.appId || '';
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

  const toggle = (key: keyof PurchaseRow) => {
    setSort(prev => ({ key, dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc' }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded':
        return 'bg-emerald-100 text-emerald-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      case 'refunded':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getRarityColor = (rarity?: string) => {
    if (!rarity) return 'text-gray-500';
    
    if (rarity.includes('MYTHICAL')) return 'text-purple-600 font-semibold';
    if (rarity.includes('LEGENDARY')) return 'text-orange-600 font-semibold';
    if (rarity.includes('EPIC')) return 'text-blue-600 font-semibold';
    if (rarity.includes('RARE')) return 'text-green-600 font-semibold';
    
    return 'text-gray-600';
  };

  return (
    <div className="overflow-x-auto border rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {[
              ['createdAt', 'Date'],
              ['userId', 'User ID'],
              ['productTitle', 'Product'],
              ['productRarity', 'Rarity'],
              ['paidAmount', 'Amount'],
              ['paymentStatus', 'Status'],
              ['paymentMethod', 'Method'],
              ['appId', 'App'],
            ].map(([key, label]) => (
              <th 
                key={key} 
                className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" 
                onClick={() => toggle(key as keyof PurchaseRow)}
              >
                <div className="flex items-center space-x-1">
                  <span>{label}</span>
                  {sort.key === key && (
                    <span className="text-gray-400">
                      {sort.dir === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {sorted.map(r => (
            <tr key={r.id} className="hover:bg-gray-50">
              <td className="px-4 py-2 text-sm text-gray-900">
                {new Date(r.createdAt).toLocaleString()}
              </td>
              <td className="px-4 py-2 text-sm text-gray-700 font-mono">
                {r.userId.substring(0, 8)}...
              </td>
              <td className="px-4 py-2 text-sm text-gray-900">
                <div>
                  <div className="font-medium">{r.productTitle || r.productId}</div>
                  {r.productTitle && (
                    <div className="text-xs text-gray-500">{r.productId}</div>
                  )}
                </div>
              </td>
              <td className="px-4 py-2 text-sm">
                <span className={getRarityColor(r.productRarity)}>
                  {r.productRarity || '-'}
                </span>
              </td>
              <td className="px-4 py-2 text-sm text-gray-900 font-medium">
                {formatCurrency(r.paidAmount)}
              </td>
              <td className="px-4 py-2 text-sm">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(r.paymentStatus)}`}>
                  {r.paymentStatus}
                </span>
              </td>
              <td className="px-4 py-2 text-sm text-gray-700">
                {r.paymentMethod || '-'}
              </td>
              <td className="px-4 py-2 text-sm text-gray-700">
                {r.appId || '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {rows.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No purchases found
        </div>
      )}
    </div>
  );
};
