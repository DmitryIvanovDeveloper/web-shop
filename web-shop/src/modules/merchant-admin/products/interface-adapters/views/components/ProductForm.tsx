'use client';

import React, { useState } from 'react';
import type { ProductsPresenter } from '../../presenters/products.presenter';
import type { ProductFormViewModel } from '../../view-models/products.view-model';

export interface ProductFormProps {
  product: ProductFormViewModel;
  labels: ProductsPresenter['labels'];
  isSaving: boolean;
  onSave: (productData: Omit<ProductFormViewModel, 'id'>) => Promise<void>;
  onCancel: () => void;
  onUploadImage: (file: File) => Promise<string>;
}

export function ProductForm({
  product,
  labels,
  isSaving,
  onSave,
  onCancel,
  onUploadImage,
}: ProductFormProps): JSX.Element {
  const [formData, setFormData] = useState<Omit<ProductFormViewModel, 'id'>>({
    title: product.title,
    description: product.description ?? '',
    appid: product.appid,
    main_image: product.main_image,
    background_image: product.background_image,
    rarity: product.rarity,
    discount: product.discount,
    player_limit: product.player_limit,
    limited_offer: product.limited_offer,
    expires_at: product.expires_at,
    price: product.price,
    rp_bonus: product.rp_bonus,
    lp_bonus: product.lp_bonus,
  });

  const [isMainImageUploading, setIsMainImageUploading] = useState(false);

  React.useEffect(() => {
    setFormData({
      title: product.title,
      description: product.description ?? '',
      appid: product.appid,
      main_image: product.main_image,
      background_image: product.background_image,
      rarity: product.rarity,
      discount: product.discount,
      player_limit: product.player_limit,
      limited_offer: product.limited_offer,
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
      const url = await onUploadImage(file);

      setFormData((prev) => ({
        ...prev,
        main_image: url,
      }));
    } catch (error) {
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
          Description
        </label>
        <textarea
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          style={{
            width: '100%',
            padding: '8px 12px',
            backgroundColor: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: '6px',
            color: '#F8FAFC',
            fontSize: '14px',
            resize: 'vertical',
            fontFamily: 'inherit',
          }}
          placeholder="Product description..."
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>
          {labels.rarity}
        </label>
        <input
          type="text"
          value={formData.rarity || ''}
          onChange={(e) => setFormData({ ...formData, rarity: e.target.value })}
          style={{
            width: '100%',
            padding: '8px 12px',
            backgroundColor: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: '6px',
            color: '#F8FAFC',
            fontSize: '14px',
          }}
          placeholder="Product rarity..."
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>
          {labels.limitedOffer}
        </label>
        <input
          type="number"
          min="0"
          value={formData.limited_offer ?? ''}
          onChange={(e) =>
            setFormData({
              ...formData,
              limited_offer: e.target.value ? Number.parseInt(e.target.value, 10) : null,
            })
          }
          style={{
            width: '100%',
            padding: '8px 12px',
            backgroundColor: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: '6px',
            color: '#F8FAFC',
            fontSize: '14px',
          }}
          placeholder="Number of limited offers..."
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
          onChange={(e) =>
            setFormData({
              ...formData,
              price: e.target.value ? Number.parseFloat(e.target.value) : null,
            })
          }
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
                backgroundColor:
                  isSaving || isMainImageUploading ? 'rgba(30, 41, 59, 0.5)' : 'rgba(30, 41, 59, 0.9)',
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

