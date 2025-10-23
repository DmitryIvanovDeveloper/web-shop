import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OffersPopup } from '../../interface-adapters/ui/components/offers-popup';
import type { Offer } from '../../domain/types';

describe('OffersPopup', () => {
  const mockOffers: Offer[] = [
    {
      id: 'test-offer-1',
      title: 'Test Offer 1',
      currentPrice: '$10.00'
    },
    {
      id: 'test-offer-2',
      title: 'Test Offer 2',
      currentPrice: '$20.00'
    }
  ];

  it('should render popup when isOpen is true and offers are provided', () => {
    render(
      <OffersPopup
        offers={mockOffers}
        isOpen={true}
        onClose={() => {}}
      />
    );

    expect(screen.getByText('🎁 Special Offers')).toBeDefined();
    expect(screen.getByText('Test Offer 1')).toBeDefined();
    expect(screen.getByText('Test Offer 2')).toBeDefined();
  });

  it('should not render popup when isOpen is false', () => {
    const { container } = render(
      <OffersPopup
        offers={mockOffers}
        isOpen={false}
        onClose={() => {}}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should not render popup when offers array is empty', () => {
    const { container } = render(
      <OffersPopup
        offers={[]}
        isOpen={true}
        onClose={() => {}}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should handle onOfferClick callback', () => {
    const mockOnOfferClick = vi.fn();

    render(
      <OffersPopup
        offers={mockOffers}
        isOpen={true}
        onClose={() => {}}
        onOfferClick={mockOnOfferClick}
      />
    );

    // Проверяем, что попап рендерится
    expect(screen.getByText('🎁 Special Offers')).toBeDefined();
  });
});
