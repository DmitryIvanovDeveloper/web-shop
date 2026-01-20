import React from 'react';
import type { OffersPageViewModel, OfferConditionViewModel } from '../../view-models/offers.view-model';
import type { OffersPresenter } from '../../presenters/offers.presenter';
import { ProductRow } from './ProductRow';

export interface OffersProductsListProps {
  readonly viewModel: OffersPageViewModel;
  readonly presenter: OffersPresenter;
}

export function OffersProductsList({ viewModel, presenter }: OffersProductsListProps): JSX.Element {
  if (!viewModel.selectedScenario) {
    return <></>;
  }

  if (viewModel.isLoadingProducts) {
    return <div style={{ color: '#94A3B8', fontSize: '14px' }}>Loading products...</div>;
  }

  const triggerCode = viewModel.selectedScenario.triggerCode;
  const conditionConfig = viewModel.selectedScenario.config.conditions?.find(
    (condition: OfferConditionViewModel) => condition.triggerCode === triggerCode
  );
  const selectedProductIds = new Set(conditionConfig?.productIds ?? []);
  const productDiscounts = conditionConfig?.productDiscounts ?? {};

  return (
    <div
      style={{
        borderRadius: '12px',
        background: 'rgba(15, 23, 42, 0.75)',
        border: '1px solid rgba(148, 163, 184, 0.2)',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxHeight: '300px',
        overflowY: 'auto',
      }}
    >
      {viewModel.products.map((product) => {
        const isChecked = selectedProductIds.has(product.id);
        const currentDiscount = productDiscounts[product.id] || '';

        return (
          <ProductRow
            key={product.id}
            product={product}
            isChecked={isChecked}
            discount={currentDiscount}
            triggerCode={triggerCode}
            selectedScenario={viewModel.selectedScenario}
            onCheckboxChange={(checked) => {
              if (!viewModel.selectedScenario || !triggerCode) {
                return;
              }

              const updated = new Set(selectedProductIds);

              if (checked) {
                updated.add(product.id);
              } else {
                updated.delete(product.id);
              }

              presenter
                .updateScenarioProducts(viewModel.selectedScenario.slug, triggerCode, Array.from(updated))
                .catch(() => {
                  
                });
            }}
            onDiscountChange={(value) => {
              if (!viewModel.selectedScenario || !triggerCode) {
                return;
              }

              presenter
                .updateProductDiscount(viewModel.selectedScenario.slug, triggerCode, product.id, value)
                .catch(() => {
                  
                });
            }}
          />
        );
      })}
    </div>
  );
}

