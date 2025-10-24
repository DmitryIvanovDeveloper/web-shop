import React from 'react';

type PlatformType = 'iOS' | 'Android' | 'Web' | 'All';

export interface FilterBarProps {
  regions: string[];
  platform: string;
  currency: string;
  onRegionChange: (regions: string[]) => void;
  onPlatformChange: (platform: string) => void;
  onCurrencyChange: (currency: string) => void;
  className?: string;
}

export function FilterBar({
  regions,
  platform,
  currency,
  onRegionChange,
  onPlatformChange,
  onCurrencyChange,
  className = ''
}: FilterBarProps) {
  const availableRegions = ['US', 'EU', 'APAC', 'LATAM', 'MEA'];
  const availablePlatforms: PlatformType[] = ['All', 'iOS', 'Android', 'Web'];
  const availableCurrencies = ['USD', 'EUR', 'GBP', 'JPY'];

  const toggleRegion = (region: string) => {
    const newRegions = regions.includes(region)
      ? regions.filter(r => r !== region)
      : [...regions, region];
    onRegionChange(newRegions);
  };

  return (
    <div className={`filter-bar ${className}`}>
      <div className="filter-group">
        <label className="filter-label">Regions:</label>
        <div className="filter-options">
          {availableRegions.map(region => (
            <button
              key={region}
              className={`filter-option ${regions.includes(region) ? 'selected' : ''}`}
              onClick={() => toggleRegion(region)}
            >
              {region}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <label className="filter-label">Platform:</label>
        <select
          className="filter-select"
          value={platform}
          onChange={(e) => onPlatformChange(e.target.value as PlatformType)}
        >
          {availablePlatforms.map(plat => (
            <option key={plat} value={plat}>{plat}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label className="filter-label">Currency:</label>
        <select
          className="filter-select"
          value={currency}
          onChange={(e) => onCurrencyChange(e.target.value)}
        >
          {availableCurrencies.map(curr => (
            <option key={curr} value={curr}>{curr}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
