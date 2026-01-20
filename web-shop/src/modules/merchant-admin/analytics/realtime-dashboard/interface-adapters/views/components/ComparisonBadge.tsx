import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import styles from '../../../styles/dashboard.module.css';

export interface ComparisonBadgeProps {
  percent: number;
  direction: 'up' | 'down' | 'neutral';
  showIcon?: boolean;
  showText?: boolean;
  className?: string;
}

export function ComparisonBadge({
  percent,
  direction,
  showIcon = true,
  showText = true,
  className = ''
}: ComparisonBadgeProps) {
  const isPositive = direction === 'up';
  const isNegative = direction === 'down';
  const isNeutral = direction === 'neutral';

  const isSignificant = Math.abs(percent) > 20;

  const badgeClass = `${styles.comparisonBadge} ${
    isPositive ? styles.positive :
    isNegative ? styles.negative :
    styles.neutral
  } ${isSignificant ? styles.significant : ''} ${className}`;

  const Icon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;
  
  const text = showText ? `${isPositive ? '+' : ''}${percent.toFixed(1)}%` : '';
  
  const ariaLabel = `${isPositive ? 'Increase' : isNegative ? 'Decrease' : 'No change'} of ${Math.abs(percent).toFixed(1)}% compared to previous period`;

  return (
    <span 
      className={badgeClass} 
      title={ariaLabel}
      aria-label={ariaLabel}
      role="status"
    >
      {showIcon && <Icon className={styles.badgeIcon} aria-hidden="true" />}
      {text}
      <span className={styles.comparisonText}>vs last week</span>
    </span>
  );
}

