'use client';

import React, { useEffect, useState } from 'react';
import { container as appContainer } from '../../../../../infrastructure/bootstrap/container';
import { PRODUCT_TYPES } from '../../infrastructure/bootstrap/products.types';
import { ProductsPresenter } from '../presenters/products.presenter';
import type { ProductsPageViewModel, ProductFormViewModel } from '../view-models/products.view-model';

export interface ProductsPageProps {
  appId: string;
}

export function ProductsPage({ appId }: ProductsPageProps): JSX.Element {
  const [presenter] = useState(() => appContainer.get<ProductsPresenter>(PRODUCT_TYPES.ProductsPresenter));
  const [viewModel, setViewModel] = useState<ProductsPageViewModel>(presenter.getViewModel());

  useEffect(() => {
    const unsubscribe = presenter.subscribe(() => {
      setViewModel(presenter.getViewModel());
    });

    presenter.init(appId).catch((error) => {
      console.error('[ProductsPage] Failed to initialize presenter', error);
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
    <div style={{ padding: '24px', minHeight: '100vh', backgroundColor: '#0F172A', color: '#F8FAFC' }}>
      <h1 style={{ marginBottom: '24px', fontSize: '28px', fontWeight: 600 }}>
        {presenter.labels.pageTitle}
      </h1>

      {viewModel.isLoading && (
        <div style={{ padding: '24px', textAlign: 'center' }}>
          {presenter.labels.loading}
        </div>
      )}

      {viewModel.errorMessage && (
        <div style={{ padding: '16px', backgroundColor: '#7F1D1D', borderRadius: '8px', marginBottom: '16px' }}>
          {viewModel.errorMessage}
        </div>
      )}

      {!viewModel.isLoading && !viewModel.errorMessage && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '24px' }}>
          {/* Products List */}
          <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', borderRadius: '12px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Products</h2>
              <button
                onClick={() => presenter.startCreating()}
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
                {presenter.labels.addProduct}
              </button>
            </div>

            {viewModel.products.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#94A3B8' }}>
                {presenter.labels.noProducts}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {viewModel.products.map((product) => (
                  <div
                    key={product.id}
                    style={{
                      padding: '16px',
                      backgroundColor: 'rgba(30, 41, 59, 0.5)',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
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
                        onClick={() => handleEdit(product.id)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#3B82F6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px',
                        }}
                      >
                        {presenter.labels.editProduct}
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
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
                        {presenter.labels.deleteProduct}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Edit/Create Form Sidebar */}
          {(viewModel.isEditing || viewModel.isCreating) && viewModel.selectedProduct && (
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
              <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px' }}>
                {viewModel.isEditing ? presenter.labels.editProduct : presenter.labels.addProduct}
              </h2>

              <ProductForm
                product={viewModel.selectedProduct}
                labels={presenter.labels}
                onSave={handleSave}
                onCancel={handleCancel}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface ProductFormProps {
  product: ProductFormViewModel;
  labels: ProductsPresenter['labels'];
  onSave: (productData: Omit<ProductFormViewModel, 'id'>) => Promise<void>;
  onCancel: () => void;
}

function ProductForm({ product, labels, onSave, onCancel }: ProductFormProps): JSX.Element {
  const [formData, setFormData] = useState<Omit<ProductFormViewModel, 'id'>>({
    title: product.title,
    appid: product.appid,
    main_image: product.main_image,
    background_image: product.background_image,
    rarity: product.rarity,
    discount: product.discount,
    player_limit: product.player_limit,
    expires_at: product.expires_at,
    price: product.price,
    rp_bonus: product.rp_bonus,
    lp_bonus: product.lp_bonus,
  });

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    await onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>
          {labels.title} *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          style={{
            width: '100%',
            padding: '8px 12px',
            backgroundColor: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: '6px',
            color: '#F8FAFC',
            fontSize: '14px',
          }}
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>
          {labels.price}
        </label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={formData.price ?? ''}
          onChange={(e) => setFormData({ ...formData, price: e.target.value ? Number.parseFloat(e.target.value) : null })}
          style={{
            width: '100%',
            padding: '8px 12px',
            backgroundColor: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: '6px',
            color: '#F8FAFC',
            fontSize: '14px',
          }}
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>
          {labels.mainImage}
        </label>
        <input
          type="text"
          value={formData.main_image ?? ''}
          onChange={(e) => setFormData({ ...formData, main_image: e.target.value || null })}
          style={{
            width: '100%',
            padding: '8px 12px',
            backgroundColor: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: '6px',
            color: '#F8FAFC',
            fontSize: '14px',
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
        <button
          type="submit"
          style={{
            flex: 1,
            padding: '10px 16px',
            backgroundColor: '#3B82F6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          {labels.save}
        </button>
        <button
          type="button"
          onClick={onCancel}
          style={{
            flex: 1,
            padding: '10px 16px',
            backgroundColor: 'rgba(148, 163, 184, 0.2)',
            color: '#F8FAFC',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          {labels.cancel}
        </button>
      </div>
    </form>
  );
}
