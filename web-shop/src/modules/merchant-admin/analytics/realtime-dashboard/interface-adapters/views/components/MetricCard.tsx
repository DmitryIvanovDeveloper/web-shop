'use client';

import React from 'react';
import { ShoppingCart, DollarSign, TrendingUp, LucideIcon } from 'lucide-react';
import { ComparisonBadge } from './ComparisonBadge';
import { MiniTrendChart } from './MiniTrendChart';
import styles from '../../../styles/dashboard.module.css';

export interface MetricCardProps {
  title: string;
  value: number | string;
  icon?: LucideIcon;
  formatter?: (value: number) => string;
  comparison?: {
    percent: number;
    direction: 'up' | 'down' | 'neutral';
  };
  trend?: Array<{ date: string; value: number }>;
  loading?: boolean;
  error?: string;
  className?: string;
  children?: React.ReactNode;
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  formatter,
  comparison,
  trend,
  loading = false,
  error,
  className = '',
  children
}: MetricCardProps) {
  const displayValue = typeof value === 'number' && formatter
    ? formatter(value)
    : value;

  // Shimmer skeleton loader
  if (loading) {
    return (
      <div
        className={`${styles.metricCard} ${styles.loading} ${className}`}
      >
        <div className={styles.metricCardHeader}>
          <div className={`${styles.metricCardTitle} ${styles.skeleton}`}></div>
        </div>
        <div className={`${styles.metricCardValue} ${styles.skeleton}`}></div>
        <div className={`${styles.metricCardTrend} ${styles.skeleton}`}></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className={`${styles.metricCard} ${styles.error} ${className}`}
      >
        <div className={styles.metricCardHeader}>
          <div className={styles.metricCardTitle}>{title}</div>
        </div>
        <div className={styles.metricCardError}>
          <span className={styles.errorIcon}>⚠️</span>
          <span className="error-message">{error}</span>
        </div>
      </div>
    );
  }

  // Определяем, является ли карточка позитивной (рост > 0)
  const isPositive = comparison?.direction === 'up' && comparison?.percent > 0;

  return (
    <div
      className={`${styles.metricCard} ${isPositive ? styles.positive : ''} ${className}`}
      tabIndex={0}
      role="article"
      aria-label={`${title}: ${displayValue}`}
    >
      <div className={styles.metricCardHeader}>
        <div className={styles.metricCardTitle}>
          {Icon && <Icon className={styles.metricCardIcon} aria-hidden="true" />}
          {title}
        </div>
        {children}
      </div>

      <div className={styles.metricCardContent}>
        <div className={styles.metricCardValue}>
          {displayValue}
        </div>

        {comparison && (
          <ComparisonBadge
            percent={comparison.percent}
            direction={comparison.direction}
          />
        )}
      </div>

      {trend && trend.length > 0 && (
        <div className={styles.metricCardTrend}>
          <MiniTrendChart data={trend} />
        </div>
      )}
    </div>
  );
}
