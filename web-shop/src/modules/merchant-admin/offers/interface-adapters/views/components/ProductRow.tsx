import React, { useEffect, useRef, useState } from 'react';

export interface ProductRowProps {
  readonly product: { id: string; title: string; price?: number | null };
  readonly isChecked: boolean;
  readonly discount: string;
  readonly triggerCode: string | undefined;
  readonly selectedScenario: { slug: string } | null;
  readonly onCheckboxChange: (checked: boolean) => void;
  readonly onDiscountChange: (value: string) => void;
}

export function ProductRow({
  product,
  isChecked,
  discount,
  triggerCode,
  selectedScenario,
  onCheckboxChange,
  onDiscountChange,
}: ProductRowProps): JSX.Element {
  const [localDiscount, setLocalDiscount] = useState(discount);
  const inputRef = useRef<HTMLInputElement>(null);
  const isFocusedRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isFocusedRef.current && discount !== localDiscount) {
      setLocalDiscount(discount);
    }
  }, [discount, localDiscount]);

  const calculateDiscountedPrice = (): { original: number | null; discounted: number | null } => {
    const basePrice = product.price ?? null;

    if (basePrice === null || basePrice === undefined) {
      return { original: null, discounted: null };
    }

    const discountValue = localDiscount ? Number(localDiscount) : 0;

    if (discountValue <= 0 || discountValue > 100) {
      return { original: basePrice, discounted: basePrice };
    }

    const discountedPrice = basePrice * (1 - discountValue / 100);
    return { original: basePrice, discounted: discountedPrice };
  };

  const { original, discounted } = calculateDiscountedPrice();

  const handleDiscountChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const { value } = event.target;

    if (value === '' || (!Number.isNaN(Number(value)) && Number(value) >= 0 && Number(value) <= 100)) {
      setLocalDiscount(value);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        onDiscountChange(value);
      }, 500);
    }
  };

  const handleFocus = (): void => {
    isFocusedRef.current = true;
  };

  const handleBlur = (): void => {
    isFocusedRef.current = false;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    onDiscountChange(localDiscount);
  };

  useEffect(
    () => () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    },
    []
  );

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '8px',
        borderRadius: '8px',
        background: isChecked ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
      }}
    >
      <input
        type="checkbox"
        checked={isChecked}
        onChange={(event) => onCheckboxChange(event.target.checked)}
        style={{ width: 16, height: 16, cursor: 'pointer' }}
      />
      <div style={{ flex: '1 1 0', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <span style={{ color: '#E2E8F0' }}>{product.title}</span>
        {original !== null && (
          <span style={{ color: '#94A3B8', fontSize: '12px' }}>
            {discounted !== null && localDiscount && Number(localDiscount) > 0 && discounted < original ? (
              <>
                <span style={{ opacity: 0.7 }}>${original.toFixed(2)}</span>
                <span style={{ margin: '0 6px', color: '#64748B' }}>|</span>
                <span style={{ color: '#60A5FA', fontWeight: 600 }}>${discounted.toFixed(2)}</span>
              </>
            ) : (
              <>${original.toFixed(2)}</>
            )}
          </span>
        )}
      </div>
      <input
        ref={inputRef}
        type="number"
        min="0"
        max="100"
        step="1"
        value={localDiscount}
        onChange={handleDiscountChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder="Discount"
        style={{
          flex: '0 0 120px',
          padding: '6px 10px',
          borderRadius: '6px',
          border: '1px solid rgba(148, 163, 184, 0.3)',
          background: 'rgba(15, 23, 42, 0.9)',
          color: '#E2E8F0',
          fontSize: '14px',
          cursor: 'text',
        }}
      />
    </div>
  );
}

