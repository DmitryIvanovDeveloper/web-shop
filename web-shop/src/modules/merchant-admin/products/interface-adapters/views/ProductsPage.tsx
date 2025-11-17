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

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0, 0, 0, 0.5)',
  zIndex: 1000,
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'stretch',
  animation: 'fadeIn 0.2s ease-out',
};

const sidebarStyle: React.CSSProperties = {
  width: '500px',
  maxWidth: '90vw',
  background: 'radial-gradient(circle at top left, rgba(59, 130, 246, 0.15), rgba(15, 23, 42, 0.95) 45%), #0F172A',
  color: '#F8FAFC',
  padding: '32px',
  boxSizing: 'border-box',
  overflow: 'auto',
  boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.5)',
  animation: 'slideInRight 0.3s ease-out',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
};

const sidebarHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '24px',
  paddingBottom: '16px',
  borderBottom: '1px solid rgba(148, 163, 184, 0.12)',
};

const closeButtonStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  color: '#94A3B8',
  fontSize: '24px',
  cursor: 'pointer',
  padding: '4px 8px',
  borderRadius: '4px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'color 0.2s ease, background 0.2s ease',
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
    price: null,
    rp_bonus: null,
    lp_bonus: null,
  });
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Add CSS animations on mount
  useEffect(() => {
    if (!document.head.querySelector('style[data-products-sidebar]')) {
      const styleSheet = document.createElement('style');
      styleSheet.setAttribute('data-products-sidebar', 'true');
      styleSheet.textContent = `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `;
      document.head.appendChild(styleSheet);
    }
  }, []);

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

  // Handle Escape key to close sidebar
  useEffect(() => {
    if (!viewModel.isEditing) {
      return;
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewModel.isEditing]);

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
      price: null,
      rp_bonus: null,
      lp_bonus: null,
    });
    setImagePreview(null);
  };

  const handleImageFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Invalid file type. Only images (JPEG, PNG, GIF, WebP) are allowed.');
      e.target.value = '';
      return;
    }

    // Validate file size (max 2MB for base64 - smaller limit due to database size)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      alert('File size exceeds 2MB limit.');
      e.target.value = '';
      return;
    }

    setIsUploadingImage(true);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('appId', appId);

      const response = await fetch('/api/products/upload-image', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload image');
      }

      const data = await response.json();
      if (!data.url) {
        throw new Error('No URL returned from upload');
      }
      setFormData({ ...formData, main_image: data.url });
      setImagePreview(data.url);
    } catch (error) {
      console.error('[ProductsPage] Image upload error:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === 'object' && error !== null && 'error' in error
            ? String(error.error)
            : 'Failed to upload image';
      alert(errorMessage);
    } finally {
      setIsUploadingImage(false);
      e.target.value = ''; // Reset file input
    }
  };

  // Update preview when main_image changes
  useEffect(() => {
    if (formData.main_image) {
      setImagePreview(formData.main_image);
    } else {
      setImagePreview(null);
    }
  }, [formData.main_image]);

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

      {/* Create form - shown on page */}
      {viewModel.isCreating && (
        <div style={cardStyle}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px' }}>
            {presenter.labels.addProduct}
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
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
                {presenter.labels.mainImage}
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleImageFileSelect}
                    disabled={isUploadingImage}
                    style={{
                      ...inputStyle,
                      padding: '8px',
                      cursor: isUploadingImage ? 'not-allowed' : 'pointer',
                      opacity: isUploadingImage ? 0.6 : 1,
                    }}
                  />
                  {isUploadingImage && (
                    <span style={{ color: '#94A3B8', fontSize: '12px' }}>Uploading...</span>
                  )}
                </div>
                <input
                  type="text"
                  style={inputStyle}
                  value={formData.main_image || ''}
                  onChange={(e) => setFormData({ ...formData, main_image: e.target.value || null })}
                  placeholder="Or enter image URL manually"
                />
                {imagePreview && (
                  <div
                    style={{
                      marginTop: '8px',
                      padding: '8px',
                      background: 'rgba(15, 23, 42, 0.4)',
                      borderRadius: '8px',
                      border: '1px solid rgba(148, 163, 184, 0.1)',
                    }}
                  >
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{
                        maxWidth: '200px',
                        maxHeight: '200px',
                        borderRadius: '4px',
                        objectFit: 'contain',
                      }}
                      onError={() => setImagePreview(null)}
                    />
                  </div>
                )}
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500 }}>
                {presenter.labels.price}
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                style={inputStyle}
                value={formData.price ?? ''}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                    setFormData({
                      ...formData,
                      price: null,
                    });
                  } else {
                    const numValue = parseFloat(value);
                    // Prevent negative values - business rule: price >= 0
                    if (!Number.isNaN(numValue) && numValue >= 0) {
                      setFormData({
                        ...formData,
                        price: numValue,
                      });
                    }
                  }
                }}
                placeholder="Price"
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

      {/* Edit form - shown in sidebar */}
      {viewModel.isEditing && (
        <div style={overlayStyle} onClick={handleCancel}>
          <div style={sidebarStyle} onClick={(e) => e.stopPropagation()}>
            <div style={sidebarHeaderStyle}>
              <h2 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>
                {presenter.labels.editProduct}
              </h2>
              <button
                style={closeButtonStyle}
                onClick={handleCancel}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#F8FAFC';
                  e.currentTarget.style.background = 'rgba(148, 163, 184, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#94A3B8';
                  e.currentTarget.style.background = 'transparent';
                }}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div style={{ display: 'grid', gap: '16px', flex: 1, overflow: 'auto' }}>
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
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
                  {presenter.labels.mainImage}
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={handleImageFileSelect}
                      disabled={isUploadingImage}
                      style={{
                        ...inputStyle,
                        padding: '8px',
                        cursor: isUploadingImage ? 'not-allowed' : 'pointer',
                        opacity: isUploadingImage ? 0.6 : 1,
                      }}
                    />
                    {isUploadingImage && (
                      <span style={{ color: '#94A3B8', fontSize: '12px' }}>Uploading...</span>
                    )}
                  </div>
                  <input
                    type="text"
                    style={inputStyle}
                    value={formData.main_image || ''}
                    onChange={(e) => setFormData({ ...formData, main_image: e.target.value || null })}
                    placeholder="Or enter image URL manually"
                  />
                  {imagePreview && (
                    <div
                      style={{
                        marginTop: '8px',
                        padding: '8px',
                        background: 'rgba(15, 23, 42, 0.4)',
                        borderRadius: '8px',
                        border: '1px solid rgba(148, 163, 184, 0.1)',
                      }}
                    >
                      <img
                        src={imagePreview}
                        alt="Preview"
                        style={{
                          maxWidth: '200px',
                          maxHeight: '200px',
                          borderRadius: '4px',
                          objectFit: 'contain',
                        }}
                        onError={() => setImagePreview(null)}
                      />
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500 }}>
                  {presenter.labels.price}
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  style={inputStyle}
                  value={formData.price ?? ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '') {
                      setFormData({
                        ...formData,
                        price: null,
                      });
                    } else {
                      const numValue = parseFloat(value);
                      // Prevent negative values - business rule: price >= 0
                      if (!Number.isNaN(numValue) && numValue >= 0) {
                        setFormData({
                          ...formData,
                          price: numValue,
                        });
                      }
                    }
                  }}
                  placeholder="Price"
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: 'auto', paddingTop: '24px' }}>
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
                    {product.price !== null ? `$${product.price}` : 'No price'}
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

