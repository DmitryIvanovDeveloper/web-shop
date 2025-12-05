import React from 'react';
import type { PromoCodesListItemViewModel } from '../../presenters/promo-codes.presenter';

export interface PromoCodesListProps {
  readonly items: readonly PromoCodesListItemViewModel[];
  readonly labels: {
    readonly empty: string;
    readonly newPromoCode: string;
  };
  readonly onAddPromoCode: () => void;
  readonly onEditPromoCode: (item: PromoCodesListItemViewModel) => void;
  readonly onToggleStatus: (item: PromoCodesListItemViewModel) => void;
}

export function PromoCodesList(props: PromoCodesListProps): JSX.Element {
  const { items, labels, onAddPromoCode, onEditPromoCode, onToggleStatus } = props;

  if (items.length === 0) {
    return (
      <div
        style={{
          padding: '16px',
          borderRadius: '8px',
          backgroundColor: '#020617',
          border: '1px solid #1E293B',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span>{labels.empty}</span>
        <button
          type="button"
          onClick={onAddPromoCode}
          style={{
            padding: '8px 14px',
            borderRadius: '999px',
            border: 'none',
            background: 'linear-gradient(to right, #22C55E, #16A34A)',
            color: '#F9FAFB',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          {labels.newPromoCode}
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        borderRadius: '12px',
        backgroundColor: '#020617',
        border: '1px solid #1E293B',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          padding: '10px 16px',
          borderBottom: '1px solid #0F172A',
          backgroundColor: '#020617',
        }}
      >
        <button
          type="button"
          onClick={onAddPromoCode}
          style={{
            padding: '8px 14px',
            borderRadius: '999px',
            border: 'none',
            background: 'linear-gradient(to right, #22C55E, #16A34A)',
            color: '#F9FAFB',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          {labels.newPromoCode}
        </button>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr
            style={{
              backgroundColor: '#0B1120',
              textAlign: 'left',
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            <th style={{ padding: '12px 16px' }}>Code</th>
            <th style={{ padding: '12px 16px' }}>Name</th>
            <th style={{ padding: '12px 16px' }}>Campaign</th>
            <th style={{ padding: '12px 16px' }}>Type</th>
            <th style={{ padding: '12px 16px' }}>Value</th>
            <th style={{ padding: '12px 16px' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item.id}
              style={{
                fontSize: '14px',
                borderTop: '1px solid #0F172A',
                cursor: 'pointer',
              }}
              onClick={() => onEditPromoCode(item)}
            >
              <td style={{ padding: '10px 16px', fontFamily: 'monospace' }}>{item.code}</td>
              <td style={{ padding: '10px 16px' }}>{item.name}</td>
              <td style={{ padding: '10px 16px' }}>{item.campaignId ?? '—'}</td>
              <td style={{ padding: '10px 16px' }}>{item.discountType}</td>
              <td style={{ padding: '10px 16px' }}>
                {item.discountType === 'percent'
                  ? `${item.discountValue}%`
                  : `${item.discountValue} ${item.currency ?? ''}`.trim()}
              </td>
              <td style={{ padding: '10px 16px' }}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleStatus(item);
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '2px 10px',
                    borderRadius: '999px',
                    fontSize: '12px',
                    border: 'none',
                    backgroundColor: item.isActive ? '#0F766E' : '#374151',
                    color: '#ECFEFF',
                    cursor: 'pointer',
                  }}
                >
                  {item.isActive ? 'Active' : 'Inactive'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
