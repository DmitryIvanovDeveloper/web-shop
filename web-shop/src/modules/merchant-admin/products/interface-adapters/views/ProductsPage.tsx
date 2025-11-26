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
                {viewModel.products.map((product) => {
                  const isSelected = viewModel.selectedProduct?.id === product.id;
                  return (
                    <div
                      key={product.id}
                      onClick={() => handleEdit(product.id)}
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
                            void handleDelete(product.id);
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
                          {presenter.labels.deleteProduct}
                        </button>
                      </div>
                    </div>
                  );
                })}
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
                isSaving={viewModel.isSaving}
                onSave={handleSave}
                onCancel={handleCancel}
                onUploadImage={async (file) => {
                  const result = await presenter.uploadProductImage(file);
                  if (result.isFailure()) {
                    throw result.error!;
                  }
                  return result.data!;
                }}
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
  isSaving: boolean;
  onSave: (productData: Omit<ProductFormViewModel, 'id'>) => Promise<void>;
  onCancel: () => void;
  onUploadImage: (file: File) => Promise<string>;
}

function ProductForm({ product, labels, isSaving, onSave, onCancel, onUploadImage }: ProductFormProps): JSX.Element {
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

  const [isMainImageUploading, setIsMainImageUploading] = useState(false);

  // Sync form state when user selects another product while editor is open
  React.useEffect(() => {
    setFormData({
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
  }, [product]);

  const handleMainImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    setIsMainImageUploading(true);
    
    try {
      // Use Presenter (follows Clean Architecture: View → Presenter → Use Case → Infrastructure)
      const url = await onUploadImage(file);
      
      // Set the public URL from Supabase Storage
      setFormData((prev) => ({
        ...prev,
        main_image: url,
      }));
    } catch (error) {
      console.error('[ProductForm] Failed to upload image:', error);
      alert(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsMainImageUploading(false);
    }
  };

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ display: 'inline-block', cursor: isSaving ? 'default' : 'pointer' }}>
            <input
              type="file"
              accept="image/*"
              onChange={handleMainImageFileChange}
              disabled={isSaving || isMainImageUploading}
              style={{ display: 'none' }}
            />
            <div
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid rgba(148, 163, 184, 0.4)',
                backgroundColor: isSaving || isMainImageUploading ? 'rgba(30, 41, 59, 0.5)' : 'rgba(30, 41, 59, 0.9)',
                color: '#E5E7EB',
                fontSize: '14px',
                textAlign: 'center',
                cursor: isSaving || isMainImageUploading ? 'default' : 'pointer',
              }}
            >
              {isMainImageUploading ? 'Uploading image…' : 'Upload main image'}
            </div>
          </label>

          {formData.main_image && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <div
                style={{
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: '1px solid rgba(148, 163, 184, 0.4)',
                }}
              >
                <img
                  src={formData.main_image}
                  alt="Product main image"
                  style={{ width: '100%', height: '160px', objectFit: 'cover', display: 'block' }}
                />
              </div>
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, main_image: null }))}
                disabled={isSaving || isMainImageUploading}
                style={{
                  alignSelf: 'flex-start',
                  padding: '6px 10px',
                  borderRadius: '999px',
                  border: '1px solid rgba(239, 68, 68, 0.6)',
                  backgroundColor: 'rgba(127, 29, 29, 0.3)',
                  color: '#FCA5A5',
                  fontSize: '12px',
                  cursor: isSaving || isMainImageUploading ? 'default' : 'pointer',
                }}
              >
                Remove image
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
        <button
          type="submit"
          disabled={isSaving}
          style={{
            flex: 1,
            padding: '10px 16px',
            backgroundColor: isSaving ? 'rgba(59, 130, 246, 0.6)' : '#3B82F6',
            color: isSaving ? 'rgba(248, 250, 252, 0.8)' : 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: isSaving ? 'default' : 'pointer',
            fontWeight: 500,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          {isSaving && (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              style={{
                animation: 'spin 1s linear infinite',
              }}
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                strokeOpacity="0.25"
              />
              <path
                d="M22 12a10 10 0 0 1-10 10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
            </svg>
          )}
          <span>{isSaving ? 'Saving…' : labels.save}</span>
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
