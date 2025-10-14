# Dashboard Configuration & Filters System

This directory contains mock JSON files that control dashboard behavior, filters, and settings.

## Files Structure

### Settings (`/settings/current.json`)
Controls global dashboard settings:
- **theme**: "dark" | "light"
- **refreshInterval**: milliseconds (e.g., 30000 for 30 seconds)
- **timezone**: timezone identifier (e.g., "UTC", "America/New_York")
- **currency**: default currency (e.g., "USD", "EUR")
- **notifications**: notification preferences
- **display**: display preferences (compact mode, trends, animations)

### Metrics Selection (`/metrics/selected.json`)
Controls which metrics and panels are visible:
- **selectedMetrics**: array of metric IDs to display
- **visiblePanels**: array of panel IDs to show (e.g., "sales", "revenue", "geography")
- **layout**: layout mode ("grid" | "list")

### Metrics Catalog (`/metrics/catalog.json`)
Defines all available metrics organized by categories:
- **Revenue**: totalRevenue, averageOrderValue, revenuePerVisitor, netIncome, monthlyGrowth
- **Sales**: totalSales, transactions, arpu, arppu
- **Conversion**: conversionRate, cartAbandonment
- **User Metrics**: activePayingUsers, ltv, retention (D1/D7/D30)
- **Quality**: refundRate, chargebackRate

### Filters (`/filters/current.json`)
Active filters applied to all data:

#### Date Range
```json
{
  "dateRange": {
    "start": "2025-10-03T00:00:00.000Z",
    "end": "2025-10-10T23:59:59.999Z",
    "preset": "last7days"
  }
}
```

#### Geography
```json
{
  "geography": {
    "countries": ["US", "GB", "DE", "FR", "CA"],
    "regions": [],
    "cities": []
  }
}
```

#### Payment Methods
```json
{
  "payment": {
    "methods": ["card", "paypal", "carrier_billing"],
    "providers": []
  }
}
```

#### Acquisition Sources
```json
{
  "acquisition": {
    "sources": ["organic", "paid", "direct", "referral"],
    "campaigns": [],
    "channels": ["google", "facebook", "instagram", "tiktok"]
  }
}
```

#### Currency & Amount
```json
{
  "currency": ["USD", "EUR", "GBP"],
  "minAmount": null,
  "maxAmount": null
}
```

## How Filters Are Applied

Filters are automatically applied to data in repositories:

1. **Date Filter**: Applied to time-series data (trends, transactions)
2. **Geography Filter**: Applied to regional breakdowns and transactions
3. **Payment Filter**: Applied to payment method data and transactions
4. **Acquisition Filter**: Applied to marketing channels and cohorts
5. **Currency Filter**: Applied to multi-currency transactions
6. **Amount Filter**: Applied to transactions and revenue data

## Usage

### Loading Current Config
```typescript
import { FilterApplier } from '../utils/filter-applier';
import { settingsRepository } from '../repositories/settings.repository.mock';
import { metricsSelectionRepository } from '../repositories/metrics-selection.repository.mock';

// Load filters
const filters = await FilterApplier.loadCurrentFilters();

// Load settings
const settings = await settingsRepository.load();

// Load metrics selection
const metrics = await metricsSelectionRepository.load();
```

### Applying Filters to Data
```typescript
// Apply all filters at once
const filteredData = FilterApplier.applyAllFilters(rawData, filters);

// Or apply specific filters
const dateFiltered = FilterApplier.applyDateFilter(data, filters.dateRange);
const geoFiltered = FilterApplier.applyGeographyFilter(data, filters.geography);
```

### Saving Configuration
```typescript
// Save settings
await settingsRepository.save(newSettings);

// Save filters (simulated in mock)
await FilterApplier.saveCurrentFilters(newFilters);

// Save metrics selection
await metricsSelectionRepository.save(newMetricsSelection);
```

## Dashboard Integration

The dashboard automatically:
1. ✅ Loads configuration on mount
2. ✅ Applies filters to all data repositories
3. ✅ Shows/hides panels based on `visiblePanels`
4. ✅ Highlights selected metrics
5. ✅ Updates when filters/settings change
6. ✅ Persists changes (simulated in mock mode)

## Testing Filter Changes

To test filters:
1. Modify `/mocks/api/filters/current.json`
2. Refresh the dashboard
3. Observe filtered data in all panels

Example: Change date range to last 30 days:
```json
{
  "dateRange": {
    "start": "2025-09-10T00:00:00.000Z",
    "end": "2025-10-10T23:59:59.999Z",
    "preset": "last30days"
  }
}
```

## Panel Visibility

To hide panels, remove them from `visiblePanels`:
```json
{
  "visiblePanels": ["sales", "revenue", "geography"]
}
```

This will show only Sales, Revenue, and Geography panels.

## Future Enhancements

- [ ] Filter presets (save/load multiple filter configurations)
- [ ] User-specific settings (per-user configuration)
- [ ] Real-time filter sync across tabs
- [ ] Advanced date presets (MTD, QTD, YTD)
- [ ] Custom metric formulas
- [ ] Dashboard layouts (save custom arrangements)

