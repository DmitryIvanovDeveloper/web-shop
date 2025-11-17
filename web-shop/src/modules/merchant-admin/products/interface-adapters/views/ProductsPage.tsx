'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { container as appContainer } from '../../../../../infrastructure/bootstrap/container';
import { PRODUCT_TYPES } from '../../infrastructure/bootstrap/products.types';
import { ProductsPresenter } from '../presenters/products.presenter';
import type { ProductFormViewModel } from '../view-models/products.view-model';

export interface ProductsPageProps {
  appId: string;
}

const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  background: 'radial-gradient(circle at top left, rgba(59, 130, 246, 0.15), rgba(15, 23, 42, 0.95) 45%), #0F172A',
  color: '#F8FAFC',
  padding: '32px',
  boxSizing: 'border-box',
  overflow: 'auto',
};

const cardStyle: React.CSSProperties = {
  backgroundColor: 'rgba(15, 23, 42, 0.6)',
  borderRadius: '16px',
  border: '1px solid rgba(148, 163, 184, 0.12)',
  padding: '20px',
  backdropFilter: 'blur(14px)',
  boxShadow: '0 24px 55px rgba(8, 15, 27, 0.45)',
  marginTop: '24px',
};

const buttonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '10px',
  padding: '12px 18px',
  borderRadius: '14px',
  border: '1px solid rgba(148, 163, 184, 0.18)',
  background: 'linear-gradient(145deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.05))',
  color: '#E2E8F0',
  fontWeight: 600,
  fontSize: '14px',
  cursor: 'pointer',
  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 16px',
  borderRadius: '8px',
  border: '1px solid rgba(148, 163, 184, 0.18)',
  background: 'rgba(15, 23, 42, 0.8)',
  color: '#F8FAFC',
  fontSize: '14px',
  marginTop: '8px',
};

export function ProductsPage({ appId }: ProductsPageProps): JSX.Element {
  const presenter = useMemo(
    () => appContainer.get<ProductsPresenter>(PRODUCT_TYPES.ProductsPresenter),
    []
  );

  const [viewModel, setViewModel] = useState(presenter.getViewModel());
  const [formData, setFormData] = useState<ProductFormViewModel>({
    title: '',
    appid: appId,
    main_image: null,
    background_image: null,
    rarity: null,
    discount: null,
    player_limit: null,
    expires_at: null,
    original_price: null,
    current_price: null,
    rp_bonus: null,
    lp_bonus: null,
  });

  useEffect(() => {
    const unsubscribe = presenter.subscribe(() => {
      const nextViewModel = presenter.getViewModel();
      setViewModel(nextViewModel);
      if (nextViewModel.selectedProduct) {
        setFormData(nextViewModel.selectedProduct);
      }
    });

    presenter.init(appId).catch(() => {
      // Presenter already logs failure via LoggerPort
    });

    return () => {
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appId]);

  const handleAddProduct = () => {
    presenter.startCreating();
  };

  const handleEditProduct = (productId: string) => {
    const product = viewModel.products.find((p) => p.id === productId);
    if (product) {
      presenter.startEditing(product);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (confirm(presenter.labels.deleteConfirm)) {
      await presenter.deleteProduct(productId);
    }
  };

  const handleSave = async () => {
    if (viewModel.isCreating) {
      await presenter.createProduct(formData);
    } else if (viewModel.isEditing && formData.id) {
      await presenter.updateProduct(formData.id, formData);
    }
  };

  const handleCancel = () => {
    presenter.cancelForm();
    setFormData({
      title: '',
      appid: appId,
      main_image: null,
      background_image: null,
      rarity: null,
      discount: null,
      player_limit: null,
      expires_at: null,
      original_price: null,
      current_price: null,
      rp_bonus: null,
      lp_bonus: null,
    });
  };

  return (
    <div style={containerStyle}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '0.2px' }}>
            {presenter.labels.pageTitle}
          </h1>
          <p style={{ color: '#94A3B8', marginTop: '6px', fontSize: '14px' }}>
            Manage products for your application
          </p>
        </div>
        <button style={buttonStyle} onClick={handleAddProduct}>
          {presenter.labels.addProduct}
        </button>
      </header>

      {viewModel.errorMessage && (
        <div style={{ ...cardStyle, background: 'rgba(239, 68, 68, 0.2)', borderColor: 'rgba(239, 68, 68, 0.4)' }}>
          <p style={{ color: '#FCA5A5' }}>{viewModel.errorMessage}</p>
        </div>
      )}

      {(viewModel.isCreating || viewModel.isEditing) && (
        <div style={cardStyle}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px' }}>
            {viewModel.isCreating ? presenter.labels.addProduct : presenter.labels.editProduct}
          </h2>
          <div style={{ display: 'grid', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500 }}>
                {presenter.labels.title} *
              </label>
              <input
                type="text"
                style={inputStyle}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Product title"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500 }}>
                {presenter.labels.mainImage}
              </label>
              <input
                type="text"
                style={inputStyle}
                value={formData.main_image || ''}
                onChange={(e) => setFormData({ ...formData, main_image: e.target.value || null })}
                placeholder="Main image URL"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500 }}>
                {presenter.labels.originalPrice}
              </label>
              <input
                type="number"
                step="0.01"
                style={inputStyle}
                value={formData.original_price ?? ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    original_price: e.target.value ? parseFloat(e.target.value) : null,
                  })
                }
                placeholder="Original price"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500 }}>
                {presenter.labels.currentPrice}
              </label>
              <input
                type="number"
                step="0.01"
                style={inputStyle}
                value={formData.current_price ?? ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    current_price: e.target.value ? parseFloat(e.target.value) : null,
                  })
                }
                placeholder="Current price"
              />
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button style={buttonStyle} onClick={handleSave} disabled={viewModel.isLoading}>
                {viewModel.isLoading ? 'Saving...' : presenter.labels.save}
              </button>
              <button
                style={{ ...buttonStyle, background: 'rgba(148, 163, 184, 0.1)' }}
                onClick={handleCancel}
                disabled={viewModel.isLoading}
              >
                {presenter.labels.cancel}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={cardStyle}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px' }}>Products List</h2>
        {viewModel.isLoading ? (
          <p style={{ color: '#94A3B8' }}>{presenter.labels.loading}</p>
        ) : viewModel.products.length === 0 ? (
          <p style={{ color: '#94A3B8' }}>{presenter.labels.noProducts}</p>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {viewModel.products.map((product) => (
              <div
                key={product.id}
                style={{
                  padding: '16px',
                  background: 'rgba(15, 23, 42, 0.4)',
                  borderRadius: '8px',
                  border: '1px solid rgba(148, 163, 184, 0.1)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>
                    {product.title}
                  </h3>
                  <p style={{ fontSize: '12px', color: '#94A3B8' }}>
                    {product.current_price !== null ? `$${product.current_price}` : 'No price'}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    style={{ ...buttonStyle, padding: '8px 12px', fontSize: '12px' }}
                    onClick={() => handleEditProduct(product.id)}
                  >
                    Edit
                  </button>
                  <button
                    style={{
                      ...buttonStyle,
                      padding: '8px 12px',
                      fontSize: '12px',
                      background: 'rgba(239, 68, 68, 0.2)',
                      borderColor: 'rgba(239, 68, 68, 0.4)',
                    }}
                    onClick={() => handleDeleteProduct(product.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

