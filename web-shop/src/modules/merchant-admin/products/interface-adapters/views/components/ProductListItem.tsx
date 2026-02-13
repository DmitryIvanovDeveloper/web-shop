'use client';

import React from 'react';
import type { ProductListItemViewModel } from '../../view-models/products.view-model';

export interface ProductListItemProps {
  product: ProductListItemViewModel;
  isSelected?: boolean;
  deleteLabel: string;
  onSelect: () => void;
  onDelete: () => void;
}

export function ProductListItem({
  product,
  isSelected = false,
  deleteLabel,
  onSelect,
  onDelete,
}: ProductListItemProps): JSX.Element {
  return (
    <div
      onClick={onSelect}
      className={`product-card${isSelected ? ' product-card--selected' : ''}`}
      style={{
        padding: '16px',
        borderRadius: '8px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        cursor: 'pointer',
      }}
    >
      <div>
        <div style={{ fontWeight: 600, marginBottom: '4px' }}>{product.title}</div>
        <div style={{ fontSize: '14px', color: '#94A3B8' }}>
          {product.price !== null ? `$${product.price.toFixed(2)}` : 'No price'}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          style={{
            padding: '6px 12px',
            backgroundColor: '#DC2626',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          {deleteLabel}
        </button>
      </div>
    </div>
  );
}







