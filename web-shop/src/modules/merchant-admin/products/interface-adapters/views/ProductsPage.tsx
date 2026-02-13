'use client';

import React, { useEffect, useState } from 'react';
import { container as appContainer } from '../../../../../infrastructure/bootstrap/container';
import { PRODUCT_TYPES } from '../../infrastructure/bootstrap/products.types';
import { ProductsPresenter } from '../presenters/products.presenter';
import type { ProductsPageViewModel, ProductFormViewModel } from '../view-models/products.view-model';
import { ProductsList } from './components/ProductsList';
import { ProductFormPanel } from './components/ProductFormPanel';

export interface ProductsPageProps {
  appId: string;
}

export function ProductsPage({ appId }: ProductsPageProps): JSX.Element {
  const [presenter] = useState(() =>
    appContainer.get<ProductsPresenter>(PRODUCT_TYPES.ProductsPresenter)
  );
  const [viewModel, setViewModel] = useState<ProductsPageViewModel>(presenter.getViewModel());

  useEffect(() => {
    const unsubscribe = presenter.subscribe(() => {
      setViewModel(presenter.getViewModel());
    });

    presenter.init(appId).catch((error) => {
          });

    return unsubscribe;
  }, [presenter, appId]);

  const handleEdit = (productId: string): void => {
    const product = viewModel.products.find((p) => p.id === productId);
    if (product) {
      presenter.startEditing(product);
    }
  };

  const handleDelete = async (productId: string): Promise<void> => {
    if (confirm(presenter.labels.deleteConfirm)) {
      await presenter.deleteProduct(productId);
    }
  };

  const handleSave = async (productData: Omit<ProductFormViewModel, 'id'>): Promise<void> => {
    if (viewModel.isEditing && viewModel.selectedProduct?.id) {
      await presenter.updateProduct(viewModel.selectedProduct.id, productData);
    } else {
      await presenter.createProduct(productData);
    }
  };

  const handleCancel = (): void => {
    presenter.cancelForm();
  };

  return (
    <div
      style={{
        padding: '24px',
        minHeight: '100vh',
        backgroundColor: '#0F172A',
        color: '#F8FAFC',
      }}
    >
      <h1 style={{ marginBottom: '24px', fontSize: '28px', fontWeight: 600 }}>
        {presenter.labels.pageTitle}
      </h1>

      {viewModel.isLoading && (
        <div style={{ padding: '24px', textAlign: 'center' }}>
          {presenter.labels.loading}
        </div>
      )}

      {viewModel.errorMessage && (
        <div
          style={{
            padding: '16px',
            backgroundColor: '#7F1D1D',
            borderRadius: '8px',
            marginBottom: '16px',
          }}
        >
          {viewModel.errorMessage}
        </div>
      )}

      {!viewModel.isLoading && !viewModel.errorMessage && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '24px' }}>
          <ProductsList
            products={viewModel.products}
            selectedProductId={viewModel.selectedProduct?.id}
            labels={presenter.labels}
            onAddProduct={() => presenter.startCreating()}
            onSelectProduct={handleEdit}
            onDeleteProduct={(id) => {
              void handleDelete(id);
            }}
          />

          {(viewModel.isEditing || viewModel.isCreating) && viewModel.selectedProduct && (
            <ProductFormPanel
              title={
                viewModel.isEditing ? presenter.labels.editProduct : presenter.labels.addProduct
              }
              product={viewModel.selectedProduct}
              labels={presenter.labels}
              isSaving={viewModel.isSaving}
              onSave={handleSave}
              onCancel={handleCancel}
              onUploadImage={async (file) => {
                const result = await presenter.uploadProductImage(file);
                if (result.isFailure) {
                  throw result.error ?? new Error('Unknown error');
                }
                return result.value!;
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}





