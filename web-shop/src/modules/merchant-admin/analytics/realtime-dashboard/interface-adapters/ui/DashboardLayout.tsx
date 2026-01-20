import React from 'react';
import { SalesPanel } from './SalesPanel';
import { RevenuePanel } from './RevenuePanel';
import { GeographyPanel } from './GeographyPanel';
import { ConversionPanel } from './ConversionPanel';
import { ErrorBoundary } from '../../../../../../shared/ui/ErrorBoundary';
import { SalesSummary } from '../../domain/entities/sales-summary.entity';
import { RevenueSummary } from '../../domain/entities/revenue-summary.entity';
import { GeographySummary } from '../../domain/entities/geography-summary.entity';
import { ConversionSummary } from '../../domain/entities/conversion-summary.entity';

interface DashboardLayoutProps {
  salesSummary?: SalesSummary;
  revenueSummary?: RevenueSummary;
  geographySummary?: GeographySummary;
  conversionSummary?: ConversionSummary;
  onPanelClick: (panelType: 'sales' | 'revenue' | 'geography' | 'conversion') => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  salesSummary,
  revenueSummary,
  geographySummary,
  conversionSummary,
  onPanelClick,
}) => {
  return (
    <main
      id="main-content"
      role="main"
      aria-label="Dashboard panels"
      className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {}
        {salesSummary && (
          <ErrorBoundary>
            <div
              onClick={() => onPanelClick('sales')}
              onKeyDown={(e) => e.key === 'Enter' && onPanelClick('sales')}
              role="button"
              tabIndex={0}
              aria-label="View sales details"
              className="sales-panel cursor-pointer transform hover:scale-[1.02] transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-xl"
            >
              <SalesPanel salesSummary={salesSummary} />
            </div>
          </ErrorBoundary>
        )}

        {}
        {revenueSummary && (
          <ErrorBoundary>
            <div
              onClick={() => onPanelClick('revenue')}
              onKeyDown={(e) => e.key === 'Enter' && onPanelClick('revenue')}
              role="button"
              tabIndex={0}
              aria-label="View revenue details"
              className="cursor-pointer transform hover:scale-[1.02] transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded-xl"
            >
              <RevenuePanel revenueSummary={revenueSummary} />
            </div>
          </ErrorBoundary>
        )}

        {}
        {geographySummary && (
          <ErrorBoundary>
            <div
              onClick={() => onPanelClick('geography')}
              onKeyDown={(e) => e.key === 'Enter' && onPanelClick('geography')}
              role="button"
              tabIndex={0}
              aria-label="View geography details"
              className="cursor-pointer transform hover:scale-[1.02] transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 rounded-xl"
            >
              <GeographyPanel geographySummary={geographySummary} />
            </div>
          </ErrorBoundary>
        )}

        {}
        {conversionSummary && (
          <ErrorBoundary>
            <div
              onClick={() => onPanelClick('conversion')}
              onKeyDown={(e) => e.key === 'Enter' && onPanelClick('conversion')}
              role="button"
              tabIndex={0}
              aria-label="View conversion details"
              className="cursor-pointer transform hover:scale-[1.02] transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded-xl"
            >
              <ConversionPanel conversionSummary={conversionSummary} />
            </div>
          </ErrorBoundary>
        )}
      </div>
    </main>
  );
};

