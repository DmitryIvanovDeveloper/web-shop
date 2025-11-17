'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { container as appContainer } from '../../../../../infrastructure/bootstrap/container';
import { OFFER_TYPES } from '../../infrastructure/bootstrap/offers.types';
import { OffersPresenter } from '../presenters/offers.presenter';
import type { OfferScenarioConfigViewModel } from '../view-models/offers.view-model';
import { EmptyState } from '../../../../../shared/ui/EmptyState';
import { LoadingSkeleton } from '../../../../../shared/ui/LoadingSkeleton';

export interface OffersPageProps {
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
  overflow: 'hidden',
};

const layoutStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '320px 1fr 420px',
  gap: '24px',
  flexGrow: 1,
  marginTop: '24px',
  overflow: 'hidden',
};

const cardStyle: React.CSSProperties = {
  backgroundColor: 'rgba(15, 23, 42, 0.6)',
  borderRadius: '16px',
  border: '1px solid rgba(148, 163, 184, 0.12)',
  padding: '20px',
  backdropFilter: 'blur(14px)',
  boxShadow: '0 24px 55px rgba(8, 15, 27, 0.45)',
  height: '100%',
  overflow: 'hidden',
};

const headerButtonStyle: React.CSSProperties = {
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

// Removed toConfigurationProps - products are now saved automatically via checkboxes
// in "Products by Condition" section through updateScenarioProducts

interface ProductRowProps {
  product: { id: string; title: string; current_price?: number | null; original_price?: number | null };
  isChecked: boolean;
  discount: string;
  triggerCode: string | undefined;
  selectedScenario: { slug: string } | null;
  onCheckboxChange: (checked: boolean) => void;
  onDiscountChange: (value: string) => void;
}

function ProductRow({ product, isChecked, discount, triggerCode, selectedScenario, onCheckboxChange, onDiscountChange }: ProductRowProps) {
  const [localDiscount, setLocalDiscount] = useState(discount);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const isFocusedRef = React.useRef(false);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Only sync when external discount changes AND input is not focused
  useEffect(() => {
    if (!isFocusedRef.current && discount !== localDiscount) {
      setLocalDiscount(discount);
    }
  }, [discount, localDiscount]);

  // Calculate discounted price in real-time
  const calculateDiscountedPrice = (): { original: number | null; discounted: number | null } => {
    const basePrice = product.current_price ?? product.original_price ?? null;
    if (basePrice === null || basePrice === undefined) {
      return { original: null, discounted: null };
    }

    const discountValue = localDiscount ? Number(localDiscount) : 0;
    if (discountValue <= 0 || discountValue > 100) {
      return { original: basePrice, discounted: basePrice };
    }

    const discountedPrice = basePrice * (1 - discountValue / 100);
    return { original: basePrice, discounted: discountedPrice };
  };

  const { original, discounted } = calculateDiscountedPrice();

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty string or valid number between 0 and 100
    if (value === '' || (!isNaN(Number(value)) && Number(value) >= 0 && Number(value) <= 100)) {
      setLocalDiscount(value);

      // Clear previous timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Debounce: send update after user stops typing for 500ms
      timeoutRef.current = setTimeout(() => {
        onDiscountChange(value);
      }, 500);
    }
  };

  const handleFocus = () => {
    isFocusedRef.current = true;
  };

  const handleBlur = () => {
    isFocusedRef.current = false;
    // Send immediately on blur
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    onDiscountChange(localDiscount);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '8px',
        borderRadius: '8px',
        background: isChecked ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
      }}
    >
      <input
        type="checkbox"
        checked={isChecked}
        onChange={(e) => onCheckboxChange(e.target.checked)}
        style={{ width: 16, height: 16, cursor: 'pointer' }}
      />
      <div style={{ flex: '1 1 0', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <span style={{ color: '#E2E8F0' }}>{product.title}</span>
        {original !== null && (
          <span style={{ color: '#94A3B8', fontSize: '12px' }}>
            {discounted !== null && localDiscount && Number(localDiscount) > 0 && discounted < original ? (
              <>
                <span style={{ opacity: 0.7 }}>
                  ${original.toFixed(2)}
                </span>
                <span style={{ margin: '0 6px', color: '#64748B' }}>|</span>
                <span style={{ color: '#60A5FA', fontWeight: 600 }}>
                  ${discounted.toFixed(2)}
                </span>
              </>
            ) : (
              <>${original.toFixed(2)}</>
            )}
          </span>
        )}
      </div>
      <input
        ref={inputRef}
        type="number"
        min="0"
        max="100"
        step="1"
        value={localDiscount}
        onChange={handleDiscountChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder="Discount"
        style={{
          flex: '0 0 120px',
          padding: '6px 10px',
          borderRadius: '6px',
          border: '1px solid rgba(148, 163, 184, 0.3)',
          background: 'rgba(15, 23, 42, 0.9)',
          color: '#E2E8F0',
          fontSize: '14px',
          cursor: 'text',
        }}
      />
    </div>
  );
}

export function OffersPage({ appId }: OffersPageProps): JSX.Element {
  const presenter = useMemo(
    () => appContainer.get<OffersPresenter>(OFFER_TYPES.OffersPresenter),
    []
  );

  const [viewModel, setViewModel] = useState(presenter.getViewModel());
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    const unsubscribe = presenter.subscribe(() => {
      const nextViewModel = presenter.getViewModel();
      setViewModel(nextViewModel);
      if (nextViewModel.selectedScenario) {
        // Products are now selected via checkboxes - no tabs needed since each scenario has only one condition
      }
    });

    presenter.init(appId).catch(() => {
      // Presenter already logs failure via LoggerPort
    });

    presenter.loadProducts().catch(() => {
      // Presenter already logs failure via LoggerPort
    });

    return () => {
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appId]); // presenter is stable from useMemo, no need to include it

  const handleScenarioSelect = (slug: string) => {
    presenter.selectScenario(slug);
  };

  const handleRefresh = () => {
    presenter.refresh();
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      await presenter.publishRuleTree();
    } finally {
      setIsPublishing(false);
    }
  };

  // Removed handleSaveConfiguration - products are now saved automatically via checkboxes
  // in "Products by Condition" section through updateScenarioProducts

  return (
    <div style={containerStyle}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '0.2px' }}>
            {presenter.labels.pageTitle}
          </h1>
          <p style={{ color: '#94A3B8', marginTop: '6px', fontSize: '14px' }}>
            Configure personalised offers and publish rule trees to LiveOps Offer Engine
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button style={headerButtonStyle} onClick={handleRefresh}>
            {presenter.labels.refresh}
          </button>
          <button
            style={{
              ...headerButtonStyle,
              background: 'linear-gradient(140deg, rgba(96, 165, 250, 0.35), rgba(37, 99, 235, 0.65))',
              border: '1px solid rgba(96, 165, 250, 0.45)',
            }}
            onClick={handlePublish}
            disabled={isPublishing}
          >
            {isPublishing ? 'Publishing...' : presenter.labels.publish}
          </button>
        </div>
      </header>

      {viewModel.isLoading ? (
        <LoadingSkeleton rows={6} />
      ) : (
        <div style={layoutStyle}>
          <aside style={{ ...cardStyle, overflowY: 'auto' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Categories</h2>
            {viewModel.categories.length === 0 ? (
              <EmptyState
                title={presenter.labels.emptyState}
                description="Configure scenarios to begin targeting users."
              />
            ) : (
              viewModel.categories.map((category) => (
                <div key={category.code} style={{ marginBottom: '20px' }}>
                  <div style={{ marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 600 }}>{category.title}</h3>
                    <p style={{ color: '#94A3B8', fontSize: '13px' }}>{category.description}</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {category.scenarios.map((scenario) => {
                      const isActive = viewModel.selectedScenario?.slug === scenario.slug;
                      return (
                        <button
                          key={scenario.slug}
                          onClick={() => handleScenarioSelect(scenario.slug)}
                          style={{
                            padding: '12px',
                            borderRadius: '12px',
                            textAlign: 'left',
                            border: '1px solid rgba(148, 163, 184, 0.15)',
                            background: isActive
                              ? 'linear-gradient(135deg, rgba(37, 99, 235, 0.35), rgba(37, 99, 235, 0.15))'
                              : 'rgba(15, 23, 42, 0.5)',
                            color: '#E2E8F0',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <div style={{ fontWeight: 600 }}>{scenario.title}</div>
                          <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>
                            {scenario.triggerLabel}
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '6px' }}>
                            Priority {scenario.priority}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </aside>

          <section style={{ ...cardStyle, overflowY: 'auto' }}>
            {viewModel.selectedScenario ? (
              <>
                <header style={{ marginBottom: '16px' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 42,
                      height: 42,
                      borderRadius: '12px',
                      background: 'rgba(96, 165, 250, 0.15)',
                      color: '#60A5FA',
                      fontSize: '18px',
                      fontWeight: 600,
                    }}
                  >
                    🎯
                  </span>
                  <h2 style={{ fontSize: '20px', fontWeight: 700, marginTop: '12px' }}>
                    {viewModel.selectedScenario.title}
                  </h2>
                  <p style={{ color: '#94A3B8', marginTop: '6px', fontSize: '14px' }}>
                    {viewModel.selectedScenario.description}
                  </p>
                  {/* Removed "Configured Conditions" section - this information is already visible
                      in the "Products by Condition" tabs below with counters showing product counts */}
                  {/* Removed Condition description - it's technical information (e.g., "user.flags.isNew === false")
                      that's not needed for users. They already see the scenario title and can select products. */}
                </header>

                {/* Removed "Offer IDs" text field - products are now selected via checkboxes 
                    in "Products by Condition" section below. Changes are saved automatically. */}

                {/* Removed Tags section - tags are not used for any functionality (filtering, searching, etc.)
                    They are only stored as metadata but not displayed or editable in the UI */}

                <div style={{ marginBottom: '20px' }}>
                  <strong style={{ color: '#CBD5F5', display: 'block', marginBottom: '12px' }}>
                    Products
                  </strong>
                    {viewModel.isLoadingProducts ? (
                      <div style={{ color: '#94A3B8', fontSize: '14px' }}>Loading products...</div>
                    ) : (
                      <>
                        {/* Products list with checkbox, name, and discount */}
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
                          {(() => {
                            const triggerCode = viewModel.selectedScenario?.triggerCode;
                            const conditionConfig = viewModel.selectedScenario?.config.conditions?.find(
                              (c) => c.triggerCode === triggerCode
                            );
                            const selectedProductIds = new Set(conditionConfig?.productIds ?? []);
                            const productDiscounts = conditionConfig?.productDiscounts ?? {};

                            return viewModel.products.map((product) => {
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
                                    if (!viewModel.selectedScenario || !triggerCode) return;
                                    const updated = new Set(selectedProductIds);
                                    if (checked) {
                                      updated.add(product.id);
                                    } else {
                                      updated.delete(product.id);
                                    }
                                    presenter
                                      .updateScenarioProducts(
                                        viewModel.selectedScenario.slug,
                                        triggerCode,
                                        Array.from(updated)
                                      )
                                      .catch(() => {
                                        // Presenter already logs failure via LoggerPort
                                      });
                                  }}
                                  onDiscountChange={(value) => {
                                    if (!viewModel.selectedScenario || !triggerCode) return;
                                    presenter
                                      .updateProductDiscount(
                                        viewModel.selectedScenario.slug,
                                        triggerCode,
                                        product.id,
                                        value
                                      )
                                      .catch(() => {
                                        // Presenter already logs failure via LoggerPort
                                      });
                                  }}
                                />
                              );
                            });
                          })()}
                        </div>
                      </>
                    )}
                </div>

                {/* Removed Configuration section - it only showed "Selected Products" which is already visible
                    in the Products section above with checkboxes and "Selected: ..." summary */}
              </>
            ) : (
              <EmptyState
                title={presenter.labels.emptyState}
                description="Select or configure a scenario to view details."
              />
            )}
          </section>

          {/* Removed Rule Tree preview - it shows technical JSON that users don't need to see.
              Users just select products and publish, they don't need to see the internal rule tree structure. */}
        </div>
      )}

      {viewModel.errorMessage && (
        <div
          style={{
            marginTop: '18px',
            padding: '12px 16px',
            borderRadius: '12px',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#F87171',
            fontSize: '13px',
          }}
        >
          {viewModel.errorMessage}
        </div>
      )}
    </div>
  );
}










