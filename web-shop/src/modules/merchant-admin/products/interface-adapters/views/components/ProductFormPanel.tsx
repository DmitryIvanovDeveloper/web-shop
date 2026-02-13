'use client';

import React from 'react';
import type { ProductFormViewModel } from '../../view-models/products.view-model';
import type { ProductsPresenter } from '../../presenters/products.presenter';
import { ProductForm } from './ProductForm';

export interface ProductFormPanelProps {
  title: string;
  product: ProductFormViewModel;
  labels: ProductsPresenter['labels'];
  isSaving: boolean;
  onSave: (productData: Omit<ProductFormViewModel, 'id'>) => Promise<void>;
  onCancel: () => void;
  onUploadImage: (file: File) => Promise<string>;
}

export function ProductFormPanel({
  title,
  product,
  labels,
  isSaving,
  onSave,
  onCancel,
  onUploadImage,
}: ProductFormPanelProps): JSX.Element {
  return (
    <div
      style={{
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        borderRadius: '12px',
        padding: '20px',
        position: 'sticky',
        top: '24px',
        height: 'fit-content',
        maxHeight: 'calc(100vh - 48px)',
        overflowY: 'auto',
      }}
    >
      <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px' }}>{title}</h2>
      <ProductForm
        product={product}
        labels={labels}
        isSaving={isSaving}
        onSave={onSave}
        onCancel={onCancel}
        onUploadImage={onUploadImage}
      />
    </div>
  );
}







