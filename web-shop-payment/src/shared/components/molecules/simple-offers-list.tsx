'use client';

export interface SimpleOffersListProps {
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export function SimpleOffersList({ className, style }: SimpleOffersListProps): JSX.Element {
  return (
    <div className={`p-4 bg-blue-500 text-white ${className || ''}`} style={style}>
      <h3>Simple Offers List</h3>
      <p>This is a test component to verify rendering works.</p>
    </div>
  );
}
