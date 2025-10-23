'use client';

import React, { useMemo } from 'react';
import { Calendar, Download } from 'lucide-react';
import { PeriodPreset } from '../domain';
import { SalesPanel, RevenuePanel } from './components';
import { container as appContainer } from '../../../../../../infrastructure/bootstrap/container';
import { TYPES } from '../../infrastructure/bootstrap/types';
import { DashboardPresenter } from '../presenters/dashboard.presenter';
import styles from '../../styles/dashboard.module.css';

export interface DashboardPageProps {
  className?: string;
}


export function DashboardPage({ className = '' }: DashboardPageProps) {
  // Получаем Presenter из DI контейнера один раз
  const presenter = useMemo(
    () => appContainer.get<DashboardPresenter>(TYPES.DashboardPresenter),
    []
  );

  const [selectedPeriod] = React.useState<PeriodPreset>('last7days');

  const periodDisplay = selectedPeriod === 'today' ? 'Today' 
    : selectedPeriod === 'last7days' ? 'Last 7 Days' 
    : selectedPeriod === 'last30days' ? 'Last 30 Days' 
    : 'Custom';

  return (
    <div className={`${styles.dashboardPage} ${className}`}>
      {/* Header - Sticky with Glassmorphism */}
      <header className={styles.dashboardHeader}>
        <div className={styles.dashboardHeaderContent}>
          <div className={styles.dashboardTitle}>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 8, background: '#eff6ff', color: '#3b82f6' }}>📈</span>
              Sales Panel
              <span className={styles.liveChip}>LIVE</span>
            </h1>
          </div>

          <div className={styles.dashboardControls}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '0.5rem' }}>
              <Calendar size={16} style={{ color: '#3b82f6' }} />
              <span style={{ fontSize: '14px', fontWeight: 500, color: '#1e293b' }}>{periodDisplay}</span>
            </div>

            <button 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                padding: '0.5rem 1rem', 
                background: 'rgba(255, 255, 255, 0.8)',
                border: '1px solid rgba(226, 232, 240, 0.8)',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
                color: '#1e293b',
                transition: 'all 0.15s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 1)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <Download size={16} />
              Export
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.dashboardMain}>
        <div className={styles.dashboardContent}>
          {/* Performance Overview Section */}
          <section className={styles.dashboardSection}>
            <h2 className={styles.sectionTitle}>Performance Overview</h2>
            <div className={styles.panelsRow}>
              <SalesPanel presenter={presenter} />
              <RevenuePanel presenter={presenter} />
            </div>
          </section>

          {/* User & Geography Section */}
          <section className={styles.dashboardSection}>
            <h2 className={styles.sectionTitle}>User & Geography</h2>
            <div className={styles.sectionContent}>
              <div className={styles.panelPlaceholder}>
                <p>GeographyPanel, PlatformSplitPanel will be added here</p>
              </div>
            </div>
          </section>

          {/* Payments & Products Section */}
          <section className={styles.dashboardSection}>
            <h2 className={styles.sectionTitle}>Payments & Products</h2>
            <div className={styles.sectionContent}>
              <div className={styles.panelPlaceholder}>
                <p>PaymentSuccessPanel, ProductAnalyticsPanel will be added here</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
