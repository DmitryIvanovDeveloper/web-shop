'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { container as appContainer } from '../../../../../infrastructure/bootstrap/container';
import { OFFER_TYPES } from '../../infrastructure/bootstrap/offers.types';
import { OffersPresenter } from '../presenters/offers.presenter';
import type { OfferScenarioConfigViewModel } from '../view-models/offers.view-model';
import { LastUpdatedIndicator } from '../../../../../shared/ui/LastUpdatedIndicator';
import { EmptyState } from '../../../../../shared/ui/EmptyState';
import { DataTable } from '../../../../../shared/ui/DataTable';
import { LoadingSkeleton } from '../../../../../shared/ui/LoadingSkeleton';
import type { OfferScenarioConfigurationProps } from '../../domain/entities/offer-scenario-configuration.entity';
import type { OfferItemProps } from '../../domain/value-objects/offer-item.value-object';
import type { DiscountProps } from '../../domain/value-objects/discount.value-object';
import type { BonusProps } from '../../domain/value-objects/bonus.value-object';

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

function toConfigurationProps(
  config: OfferScenarioConfigViewModel,
  offerIds: readonly string[]
): OfferScenarioConfigurationProps {
  return {
    offerIds,
    discount: config.discount
      ? ({
          type: config.discount.type,
          value: config.discount.value,
          currency: config.discount.currency,
          minSpend: config.discount.minSpend,
        } as DiscountProps)
      : undefined,
    bonus: config.bonus
      ? ({
          type: config.bonus.type,
          amount: config.bonus.amount,
          unit: config.bonus.unit,
          description: config.bonus.description,
        } as BonusProps)
      : undefined,
    items: config.items.map((item) => ({
      id: item.id,
      title: item.title,
      type: item.type,
      metadata: { ...item.metadata },
    })) as readonly OfferItemProps[],
    metadata: { ...config.metadata },
  };
}

export function OffersPage({ appId }: OffersPageProps): JSX.Element {
  const presenter = useMemo(
    () => appContainer.get<OffersPresenter>(OFFER_TYPES.OffersPresenter),
    []
  );

  const [viewModel, setViewModel] = useState(presenter.getViewModel());
  const [offerIdsInput, setOfferIdsInput] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeConditionTab, setActiveConditionTab] = useState<string>('new_user_welcome');

  useEffect(() => {
    const unsubscribe = presenter.subscribe(() => {
      const nextViewModel = presenter.getViewModel();
      setViewModel(nextViewModel);
      if (nextViewModel.selectedScenario) {
        // Sync offerIdsInput with configuration.offerIds
        // If products are selected via checkboxes, offerIds are automatically updated
        setOfferIdsInput(nextViewModel.selectedScenario.config.offerIds.join(', '));
        
        // Initialize active condition tab if conditions exist
        if (nextViewModel.selectedScenario.config.conditions && nextViewModel.selectedScenario.config.conditions.length > 0) {
          // Set active tab to first condition or keep current if it exists
          const firstCondition = nextViewModel.selectedScenario.config.conditions[0];
          if (!nextViewModel.selectedScenario.config.conditions.find((c) => c.triggerCode === activeConditionTab)) {
            setActiveConditionTab(firstCondition.triggerCode);
          }
        } else {
          // If no conditions, default to new_user_welcome
          setActiveConditionTab('new_user_welcome');
        }
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

  const handleSaveConfiguration = async () => {
    if (!viewModel.selectedScenario) {
      return;
    }

    setIsSaving(true);
    try {
      const offerIds = offerIdsInput
        .split(',')
        .map((value) => value.trim())
        .filter((value) => value.length > 0);

      if (!offerIds.length) {
        return;
      }

      await presenter.updateScenarioConfiguration(
        viewModel.selectedScenario.slug,
        toConfigurationProps(viewModel.selectedScenario.config, offerIds)
      );
    } finally {
      setIsSaving(false);
    }
  };

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
                  {viewModel.selectedScenario.config.conditions && viewModel.selectedScenario.config.conditions.length > 0 && (
                    <div
                      style={{
                        marginTop: '12px',
                        padding: '12px',
                        borderRadius: '8px',
                        background: 'rgba(59, 130, 246, 0.1)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                      }}
                    >
                      <div style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '4px' }}>
                        Configured Conditions:
                      </div>
                      <div style={{ fontSize: '13px', color: '#60A5FA', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {viewModel.selectedScenario.config.conditions.map((condition) => (
                          <span
                            key={condition.triggerCode}
                            style={{
                              padding: '4px 8px',
                              borderRadius: '6px',
                              background: 'rgba(59, 130, 246, 0.2)',
                              color: '#60A5FA',
                              fontSize: '12px',
                            }}
                          >
                            {condition.label} ({condition.productIds.length} products)
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {(!viewModel.selectedScenario.config.conditions || viewModel.selectedScenario.config.conditions.length === 0) && viewModel.selectedScenario.conditionDescription && (
                    <div
                      style={{
                        marginTop: '12px',
                        padding: '12px',
                        borderRadius: '8px',
                        background: 'rgba(59, 130, 246, 0.1)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                      }}
                    >
                      <div style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '4px' }}>
                        Condition:
                      </div>
                      <div style={{ fontSize: '13px', color: '#60A5FA', fontWeight: 500 }}>
                        {viewModel.selectedScenario.conditionDescription}
                      </div>
                    </div>
                  )}
                </header>

                <div style={{ marginBottom: '20px' }}>
                  <strong style={{ color: '#CBD5F5' }}>{presenter.labels.offers}</strong>
                  <textarea
                    value={offerIdsInput}
                    onChange={(event) => setOfferIdsInput(event.target.value)}
                    style={{
                      marginTop: '8px',
                      width: '100%',
                      minHeight: '96px',
                      borderRadius: '12px',
                      background: 'rgba(15, 23, 42, 0.75)',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      color: '#E2E8F0',
                      padding: '12px',
                      fontFamily: 'inherit',
                      fontSize: '14px',
                    }}
                    placeholder="comma separated offer ids"
                  />
                  <button
                    onClick={handleSaveConfiguration}
                    disabled={isSaving}
                    style={{
                      marginTop: '12px',
                      padding: '10px 16px',
                      borderRadius: '12px',
                      border: 'none',
                      background:
                        'linear-gradient(135deg, rgba(16, 185, 129, 0.45), rgba(16, 185, 129, 0.65))',
                      color: '#0F172A',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {isSaving ? 'Saving...' : 'Save changes'}
                  </button>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <strong style={{ color: '#CBD5F5' }}>{presenter.labels.tags}</strong>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                    {viewModel.selectedScenario.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '999px',
                          background: 'rgba(148, 163, 184, 0.15)',
                          color: '#CBD5F5',
                          fontSize: '12px',
                          letterSpacing: '0.3px',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <strong style={{ color: '#CBD5F5', display: 'block', marginBottom: '12px' }}>
                    Products by Condition
                  </strong>
                    {viewModel.isLoadingProducts ? (
                      <div style={{ color: '#94A3B8', fontSize: '14px' }}>Loading products...</div>
                    ) : (
                      <>
                        {/* Tabs for conditions */}
                        <div
                          style={{
                            display: 'flex',
                            gap: '8px',
                            marginBottom: '16px',
                            flexWrap: 'wrap',
                            borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
                            paddingBottom: '12px',
                          }}
                        >
                          {presenter.getAvailableConditions().map((condition) => {
                            const isActive = activeConditionTab === condition.triggerCode;
                            const conditionConfig = viewModel.selectedScenario?.config.conditions?.find(
                              (c) => c.triggerCode === condition.triggerCode
                            );
                            const selectedCount = conditionConfig?.productIds.length ?? 0;

                            return (
                              <button
                                key={condition.triggerCode}
                                onClick={() => setActiveConditionTab(condition.triggerCode)}
                                style={{
                                  padding: '8px 16px',
                                  borderRadius: '8px',
                                  border: '1px solid rgba(148, 163, 184, 0.2)',
                                  background: isActive
                                    ? 'linear-gradient(135deg, rgba(37, 99, 235, 0.35), rgba(37, 99, 235, 0.15))'
                                    : 'rgba(15, 23, 42, 0.5)',
                                  color: isActive ? '#E2E8F0' : '#94A3B8',
                                  cursor: 'pointer',
                                  fontSize: '13px',
                                  fontWeight: isActive ? 600 : 400,
                                  transition: 'all 0.15s ease',
                                  position: 'relative',
                                }}
                              >
                                {condition.label}
                                {selectedCount > 0 && (
                                  <span
                                    style={{
                                      marginLeft: '6px',
                                      padding: '2px 6px',
                                      borderRadius: '10px',
                                      background: 'rgba(16, 185, 129, 0.3)',
                                      color: '#10B981',
                                      fontSize: '11px',
                                      fontWeight: 600,
                                    }}
                                  >
                                    {selectedCount}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Products for active condition */}
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
                            const conditionConfig = viewModel.selectedScenario?.config.conditions?.find(
                              (c) => c.triggerCode === activeConditionTab
                            );
                            const selectedProductIds = new Set(conditionConfig?.productIds ?? []);
                            const isChecked = selectedProductIds.has(product.id);

                            return (
                              <label
                                key={product.id}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '10px',
                                  cursor: 'pointer',
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(event) => {
                                    if (!viewModel.selectedScenario) return;
                                    const updated = new Set(selectedProductIds);
                                    if (event.target.checked) {
                                      updated.add(product.id);
                                    } else {
                                      updated.delete(product.id);
                                    }
                                    presenter
                                      .updateScenarioProducts(
                                        viewModel.selectedScenario.slug,
                                        activeConditionTab,
                                        Array.from(updated)
                                      )
                                      .catch(() => {
                                        // Presenter already logs failure via LoggerPort
                                      });
                                  }}
                                  style={{ width: 16, height: 16 }}
                                />
                                <span>{product.title}</span>
                              </label>
                            );
                          })}
                        </div>

                        {/* Selected products summary for active condition */}
                        {(() => {
                          const conditionConfig = viewModel.selectedScenario?.config.conditions?.find(
                            (c) => c.triggerCode === activeConditionTab
                          );
                          const selectedProducts = conditionConfig?.productIds ?? [];
                          if (selectedProducts.length > 0) {
                            const productTitles = viewModel.products
                              .filter((p) => selectedProducts.includes(p.id))
                              .map((p) => p.title);
                            return (
                              <div style={{ marginTop: '8px', fontSize: '12px', color: '#94A3B8' }}>
                                Selected: {productTitles.join(', ')}
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </>
                    )}
                </div>

                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>
                    {presenter.labels.configuration}
                  </h3>
                  <DataTable
                    columns={[
                      { key: 'name', label: 'Field' },
                      { key: 'value', label: 'Value' },
                    ]}
                    data={[
                      {
                        name: 'Discount',
                        value: viewModel.selectedScenario.config.discount
                          ? `${viewModel.selectedScenario.config.discount.type} (${viewModel.selectedScenario.config.discount.value}${viewModel.selectedScenario.config.discount.currency ? ` ${viewModel.selectedScenario.config.discount.currency}` : ''})`
                          : 'None',
                      },
                      {
                        name: 'Bonus',
                        value: viewModel.selectedScenario.config.bonus
                          ? `${viewModel.selectedScenario.config.bonus.type}${
                              viewModel.selectedScenario.config.bonus.amount
                                ? ` (${viewModel.selectedScenario.config.bonus.amount})`
                                : ''
                            }`
                          : 'None',
                      },
                      {
                        name: 'Metadata keys',
                        value: Object.keys(viewModel.selectedScenario.config.metadata).join(', ') || '—',
                      },
                      {
                        name: 'Items',
                        value:
                          viewModel.selectedScenario.config.items.length > 0
                            ? viewModel.selectedScenario.config.items.map((item) => item.title).join(', ')
                            : 'None',
                      },
                    ]}
                    pagination={false}
                    className="offers-config-table"
                    ariaLabel="Scenario configuration summary"
                  />
                </div>
              </>
            ) : (
              <EmptyState
                title={presenter.labels.emptyState}
                description="Select or configure a scenario to view details."
              />
            )}
          </section>

          <aside style={{ ...cardStyle, overflowY: 'auto' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600 }}>
                {presenter.labels.ruleTreeTitle}
              </h2>
              {viewModel.lastUpdatedAt && (
                <LastUpdatedIndicator lastUpdated={new Date(viewModel.lastUpdatedAt)} className="text-xs" />
              )}
            </header>
            <pre
              style={{
                marginTop: '16px',
                background: 'rgba(15, 23, 42, 0.75)',
                borderRadius: '12px',
                padding: '16px',
                fontSize: '12px',
                lineHeight: 1.6,
                maxHeight: '520px',
                overflowY: 'auto',
                border: '1px solid rgba(148, 163, 184, 0.18)',
              }}
            >
              {viewModel.ruleTreeJson ?? '// Rule tree not yet published'}
            </pre>
          </aside>
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










