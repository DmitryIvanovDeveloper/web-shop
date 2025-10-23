'use client';
import { ProductsList } from '../../../../products/interface-adapters/ui/components/products-list';

export interface PaymentFlowProps {
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export function PaymentFlow({ className, style }: PaymentFlowProps): JSX.Element {
  // Simplified: just show products list
  // Payment logic is now handled on separate /payment page
  return (
    <div className={className} style={style}>
      <ProductsList />
    </div>
  );
}
