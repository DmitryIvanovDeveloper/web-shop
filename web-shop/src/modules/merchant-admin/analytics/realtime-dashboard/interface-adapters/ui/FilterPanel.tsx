import React, { useState } from 'react';
import { FilterSet } from '../../domain/value-objects/filter-set.value-object';
import { DateRangeFilter, DateRangePreset, DateGranularity } from '../../domain/value-objects/date-range-filter.value-object';
import { GeoFilter } from '../../domain/value-objects/geo-filter.value-object';
import { PaymentFilter, PaymentMethod } from '../../domain/value-objects/payment-filter.value-object';
import { SourceFilter, AcquisitionSource } from '../../domain/value-objects/source-filter.value-object';
import { CurrencyFilter, CurrencyCode } from '../../domain/value-objects/currency-filter.value-object';
import { FilterPreset } from '../../domain/entities/filter-preset.entity';
import { DateRangeFilter as DateRangeFilterComponent } from './DateRangeFilter';
import { MultiSelectFilter, MultiSelectOption } from './MultiSelectFilter';
import { FilterPresetSelector } from './FilterPresetSelector';

interface FilterPanelProps {
  filterSet: FilterSet;
  presets: FilterPreset[];
  currentPresetId?: string;
  onApply: (filterSet: FilterSet) => void;
  onReset: () => void;
  onLoadPreset: (presetId: string) => void;
  onSavePreset: (name: string) => void;
  isLoading?: boolean;
}

const GEO_OPTIONS: MultiSelectOption[] = [
  { value: 'US', label: 'United States', icon: '🇺🇸' },
  { value: 'UK', label: 'United Kingdom', icon: '🇬🇧' },
  { value: 'DE', label: 'Germany', icon: '🇩🇪' },
  { value: 'FR', label: 'France', icon: '🇫🇷' },
  { value: 'JP', label: 'Japan', icon: '🇯🇵' },
  { value: 'CN', label: 'China', icon: '🇨🇳' },
  { value: 'AU', label: 'Australia', icon: '🇦🇺' },
  { value: 'CA', label: 'Canada', icon: '🇨🇦' },
];

const PAYMENT_OPTIONS: MultiSelectOption[] = [
  { value: 'card', label: 'Credit/Debit Card', icon: '💳' },
  { value: 'paypal', label: 'PayPal', icon: '🅿️' },
  { value: 'crypto', label: 'Cryptocurrency', icon: '₿' },
  { value: 'bank_transfer', label: 'Bank Transfer', icon: '🏦' },
];

const SOURCE_OPTIONS: MultiSelectOption[] = [
  { value: 'organic', label: 'Organic Search', icon: '🔍' },
  { value: 'paid', label: 'Paid Advertising', icon: '💰' },
  { value: 'referral', label: 'Referral', icon: '🔗' },
  { value: 'social', label: 'Social Media', icon: '📱' },
  { value: 'email', label: 'Email Marketing', icon: '📧' },
  { value: 'direct', label: 'Direct Traffic', icon: '➡️' },
];

const CURRENCY_OPTIONS: { value: CurrencyCode; label: string }[] = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'JPY', label: 'JPY - Japanese Yen' },
  { value: 'CNY', label: 'CNY - Chinese Yuan' },
  { value: 'AUD', label: 'AUD - Australian Dollar' },
  { value: 'CAD', label: 'CAD - Canadian Dollar' },
];

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filterSet,
  presets,
  currentPresetId,
  onApply,
  onReset,
  onLoadPreset,
  onSavePreset,
  isLoading = false,
}) => {
  const [localFilterSet, setLocalFilterSet] = useState(filterSet);

  const handleDateRangeChange = (preset: DateRangePreset, granularity: DateGranularity, from?: Date, to?: Date): void => {
    let dateRangeResult;
    
    if (preset === 'custom' && from && to) {
      dateRangeResult = DateRangeFilter.create({ preset, granularity, from, to });
    } else {
      dateRangeResult = DateRangeFilter.fromPreset(preset, granularity);
    }

    if (dateRangeResult.isSuccess()) {
      const newFilterSetResult = FilterSet.create({
        ...localFilterSet,
        dateRange: dateRangeResult.data,
      });

      if (newFilterSetResult.isSuccess()) {
        setLocalFilterSet(newFilterSetResult.data);
      }
    }
  };

  const handleGeoChange = (countries: string[]): void => {
    const geoResult = countries.length > 0 
      ? GeoFilter.create({ countries }) 
      : { isSuccess: () => true, data: GeoFilter.createEmpty() };

    if (geoResult.isSuccess()) {
      const newFilterSetResult = FilterSet.create({
        ...localFilterSet,
        geo: geoResult.data,
      });

      if (newFilterSetResult.isSuccess()) {
        setLocalFilterSet(newFilterSetResult.data);
      }
    }
  };

  const handlePaymentChange = (methods: string[]): void => {
    const paymentResult = methods.length > 0
      ? PaymentFilter.create({ methods: methods as PaymentMethod[] })
      : { isSuccess: () => true, data: PaymentFilter.createEmpty() };

    if (paymentResult.isSuccess()) {
      const newFilterSetResult = FilterSet.create({
        ...localFilterSet,
        payment: paymentResult.data,
      });

      if (newFilterSetResult.isSuccess()) {
        setLocalFilterSet(newFilterSetResult.data);
      }
    }
  };

  const handleSourceChange = (sources: string[]): void => {
    const sourceResult = sources.length > 0
      ? SourceFilter.create({ sources: sources as AcquisitionSource[] })
      : { isSuccess: () => true, data: SourceFilter.createEmpty() };

    if (sourceResult.isSuccess()) {
      const newFilterSetResult = FilterSet.create({
        ...localFilterSet,
        source: sourceResult.data,
      });

      if (newFilterSetResult.isSuccess()) {
        setLocalFilterSet(newFilterSetResult.data);
      }
    }
  };

  const handleCurrencyChange = (currency: CurrencyCode): void => {
    const currencyResult = CurrencyFilter.create({ currency });

    if (currencyResult.isSuccess()) {
      const newFilterSetResult = FilterSet.create({
        ...localFilterSet,
        currency: currencyResult.data,
      });

      if (newFilterSetResult.isSuccess()) {
        setLocalFilterSet(newFilterSetResult.data);
      }
    }
  };

  const handleApply = (): void => {
    onApply(localFilterSet);
  };

  const handleReset = (): void => {
    const defaultFilterSet = FilterSet.createDefault();
    setLocalFilterSet(defaultFilterSet);
    onReset();
  };

  return (
    <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-6 shadow-lg pb-24">
      {}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <span>🔍</span>
          Filters & Settings
        </h3>
        <button
          type="button"
          onClick={handleReset}
          disabled={isLoading}
          className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Reset All
        </button>
      </div>

      <div className="space-y-6">
        {}
        <FilterPresetSelector
          presets={presets}
          currentPresetId={currentPresetId}
          onLoad={onLoadPreset}
          onSave={onSavePreset}
          isLoading={isLoading}
        />

        {}
        <DateRangeFilterComponent
          preset={localFilterSet.dateRange.preset}
          granularity={localFilterSet.dateRange.granularity}
          customFrom={localFilterSet.dateRange.from}
          customTo={localFilterSet.dateRange.to}
          onPresetChange={(preset) => handleDateRangeChange(preset, localFilterSet.dateRange.granularity)}
          onGranularityChange={(granularity) =>
            handleDateRangeChange(localFilterSet.dateRange.preset, granularity, localFilterSet.dateRange.from, localFilterSet.dateRange.to)
          }
          onCustomRangeChange={(from, to) => handleDateRangeChange('custom', localFilterSet.dateRange.granularity, from, to)}
        />

        {}
        <MultiSelectFilter
          label="Geography"
          icon="🌍"
          options={GEO_OPTIONS}
          selected={localFilterSet.geo.countries}
          onChange={handleGeoChange}
          placeholder="Select countries..."
        />

        {}
        <MultiSelectFilter
          label="Payment Method"
          icon="💳"
          options={PAYMENT_OPTIONS}
          selected={localFilterSet.payment.methods}
          onChange={handlePaymentChange}
          placeholder="Select payment methods..."
        />

        {}
        <MultiSelectFilter
          label="Acquisition Source"
          icon="📢"
          options={SOURCE_OPTIONS}
          selected={localFilterSet.source.sources}
          onChange={handleSourceChange}
          placeholder="Select sources..."
        />

        {}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <span className="mr-2">💰</span>
            Currency
          </label>
          <select
            value={localFilterSet.currency.currency}
            onChange={(e) => handleCurrencyChange(e.target.value as CurrencyCode)}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {CURRENCY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {}
        <div className="h-2" />

        {}
        {localFilterSet.hasActiveFilters() && (
          <div className="mt-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
            <p className="text-xs font-semibold text-indigo-700 mb-2">Active Filters:</p>
            <div className="flex flex-wrap gap-2">
              {!localFilterSet.geo.isEmpty() && (
                <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full">
                  🌍 {localFilterSet.geo.countries.length} {localFilterSet.geo.countries.length === 1 ? 'country' : 'countries'}
                </span>
              )}
              {!localFilterSet.payment.isEmpty() && (
                <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full">
                  💳 {localFilterSet.payment.methods.length} payment {localFilterSet.payment.methods.length === 1 ? 'method' : 'methods'}
                </span>
              )}
              {!localFilterSet.source.isEmpty() && (
                <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full">
                  📢 {localFilterSet.source.sources.length} {localFilterSet.source.sources.length === 1 ? 'source' : 'sources'}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
      {}
      <div className="fixed bottom-2 left-1/2 -translate-x-1/2 sm:left-auto sm:right-6 sm:translate-x-0 z-50">
        <div className="flex items-center gap-3 bg-white/90 backdrop-blur border border-gray-200 rounded-xl shadow-lg px-3 py-2">
          {}
          <div className="hidden md:flex flex-wrap gap-2 max-w-[50vw]">
            {!localFilterSet.geo.isEmpty() && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-gray-100 border border-gray-300 text-gray-700">🌍 {localFilterSet.geo.countries.length}</span>
            )}
            {!localFilterSet.payment.isEmpty() && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-gray-100 border border-gray-300 text-gray-700">💳 {localFilterSet.payment.methods.length}</span>
            )}
            {!localFilterSet.source.isEmpty() && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-gray-100 border border-gray-300 text-gray-700">📢 {localFilterSet.source.sources.length}</span>
            )}
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-gray-100 border border-gray-300 text-gray-700">💰 {localFilterSet.currency.currency}</span>
          </div>

          <button
            type="button"
            onClick={handleApply}
            disabled={isLoading}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isLoading ? 'Applying…' : 'Apply'}
          </button>
        </div>
      </div>
    </div>
  );
};

