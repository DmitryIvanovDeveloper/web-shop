'use client';

import React from 'react';
import type { ProductListItemViewModel } from '../../view-models/products.view-model';
import type { ProductsPresenter } from '../../presenters/products.presenter';
import { ProductListItem } from './ProductListItem';

export interface ProductsListProps {
  products: readonly ProductListItemViewModel[];
  selectedProductId?: string;
  labels: ProductsPresenter['labels'];
  onAddProduct: () => void;
  onSelectProduct: (id: string) => void;
  onDeleteProduct: (id: string) => void;
}

export function ProductsList({
  products,
  selectedProductId,
  labels,
  onAddProduct,
  onSelectProduct,
  onDeleteProduct,
}: ProductsListProps): JSX.Element {
  return (
    <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', borderRadius: '12px', padding: '20px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Products</h2>
        <button
          onClick={onAddProduct}
          style={{
            padding: '8px 16px',
            backgroundColor: '#3B82F6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          {labels.addProduct}
        </button>
      </div>

      {products.length === 0 ? (
        <div style={{ padding: '24px', textAlign: 'center', color: '#94A3B8' }}>
          {labels.noProducts}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {products.map((product) => (
            <ProductListItem
              key={product.id}
              product={product}
              isSelected={selectedProductId === product.id}
              deleteLabel={labels.deleteProduct}
              onSelect={() => onSelectProduct(product.id)}
              onDelete={() => onDeleteProduct(product.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}


