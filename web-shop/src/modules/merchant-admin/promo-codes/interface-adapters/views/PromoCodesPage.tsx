'use client';

import React, { useEffect, useState } from 'react';
import { container as appContainer } from '../../../../../infrastructure/bootstrap/container';
import { PROMO_CODE_TYPES } from '../../infrastructure/bootstrap/promo-codes.types';
import { PromoCodesPresenter } from '../presenters/promo-codes.presenter';
import { PromoCodesList } from './components/PromoCodesList';

export interface PromoCodesPageProps {
  readonly appId: string;
}

export function PromoCodesPage(props: PromoCodesPageProps): JSX.Element {
  const { appId } = props;

  const [presenter] = useState(() =>
    appContainer.get<PromoCodesPresenter>(PROMO_CODE_TYPES.PromoCodesPresenter)
  );
  const [viewModel, setViewModel] = useState(presenter.getViewModel());

  useEffect(() => {
    const unsubscribe = presenter.subscribe(() => {
      setViewModel(presenter.getViewModel());
    });

    presenter
      .init(appId)
      .catch((error: unknown) => {
        
              });

    return unsubscribe;
  }, [presenter, appId]);

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
        <div style={{ padding: '24px', textAlign: 'center' }}>{presenter.labels.loading}</div>
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
          <PromoCodesList
            items={viewModel.items}
            labels={presenter.labels}
            onAddPromoCode={() => presenter.startCreating()}
            onEditPromoCode={(item) => presenter.startEditing(item)}
            onToggleStatus={(item) => {
              void presenter.togglePromoCodeStatus(item);
            }}
          />

          {viewModel.isCreating && (
            <div
              style={{
                padding: '16px',
                borderRadius: '12px',
                backgroundColor: '#020617',
                border: '1px solid #1E293B',
              }}
            >
              <h2 style={{ fontSize: '18px', marginBottom: '12px' }}>
                {presenter.labels.formTitle}
              </h2>
              <div style={{ display: 'grid', gap: '8px' }}>
                <label style={{ fontSize: '13px' }}>
                  <div style={{ marginBottom: '4px' }}>{presenter.labels.fieldCode}</div>
                  <input
                    type="text"
                    value={viewModel.form.code}
                    onChange={(e) => presenter.updateForm({ code: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid #1E293B',
                      backgroundColor: '#020617',
                      color: '#F9FAFB',
                    }}
                  />
                </label>
                <label style={{ fontSize: '13px' }}>
                  <div style={{ marginBottom: '4px' }}>{presenter.labels.fieldName}</div>
                  <input
                    type="text"
                    value={viewModel.form.name}
                    onChange={(e) => presenter.updateForm({ name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid #1E293B',
                      backgroundColor: '#020617',
                      color: '#F9FAFB',
                    }}
                  />
                </label>
                <label style={{ fontSize: '13px' }}>
                  <div style={{ marginBottom: '4px' }}>
                    {presenter.labels.fieldDiscountType}
                  </div>
                  <select
                    value={viewModel.form.discountType}
                    onChange={(e) =>
                      presenter.updateForm({
                        discountType: e.target.value as 'percent' | 'fixed_amount',
                      })
                    }
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid #1E293B',
                      backgroundColor: '#020617',
                      color: '#F9FAFB',
                    }}
                  >
                    <option value="percent">Percent</option>
                    <option value="fixed_amount">Fixed amount</option>
                  </select>
                </label>
                <label style={{ fontSize: '13px' }}>
                  <div style={{ marginBottom: '4px' }}>
                    {presenter.labels.fieldDiscountValue}
                  </div>
                  <input
                    type="number"
                    value={viewModel.form.discountValue}
                    onChange={(e) =>
                      presenter.updateForm({
                        discountValue: Number(e.target.value),
                      })
                    }
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid #1E293B',
                      backgroundColor: '#020617',
                      color: '#F9FAFB',
                    }}
                  />
                </label>
                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    marginTop: '8px',
                  }}
                >
                  <button
                    type="button"
                    disabled={viewModel.isSaving}
                    onClick={() => {
                      if (viewModel.isEditing) {
                        void presenter.updatePromoCode();
                      } else {
                        void presenter.createPromoCode();
                      }
                    }}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '999px',
                      border: 'none',
                      background: 'linear-gradient(to right, #22C55E, #16A34A)',
                      color: '#F9FAFB',
                      fontSize: '13px',
                      fontWeight: 500,
                      cursor: viewModel.isSaving ? 'default' : 'pointer',
                      opacity: viewModel.isSaving ? 0.7 : 1,
                    }}
                  >
                    {presenter.labels.buttonCreate}
                  </button>
                  <button
                    type="button"
                    disabled={viewModel.isSaving}
                    onClick={() => presenter.cancelCreating()}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '999px',
                      border: '1px solid #1F2937',
                      background: 'transparent',
                      color: '#E5E7EB',
                      fontSize: '13px',
                      fontWeight: 500,
                      cursor: viewModel.isSaving ? 'default' : 'pointer',
                    }}
                  >
                    {presenter.labels.buttonCancel}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}





