import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { OffersList } from '../../interface-adapters/ui/components/offers-list';

// Mock fetch
global.fetch = vi.fn();

describe('OffersList Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state initially', () => {
    render(<OffersList />);
    expect(screen.getByText('Loading offers...')).toBeInTheDocument();
  });

  it('should render offers when data is loaded', async () => {
    const mockRules = {
      operationType: 'condition',
      condition: {
        conditionType: 'gte',
        value1: { type: 'property', value: 'user.purchases.length' },
        value2: { type: 'value', value: 1 }
      },
      nextOperation: {
        operationType: 'action',
        action: { actionType: 'showOffer', params: { offerId: ['tank-turret'] } }
      }
    };

    const mockPurchases = [
      { id: 'purchase-1', amount: 10 },
      { id: 'purchase-2', amount: 20 }
    ];

    const mockOffer = {
      id: 'tank-turret',
      title: 'Tank Turret',
      mainImage: '/test-image.jpg',
      currentPrice: '$20.00',
      originalPrice: '$39.99'
    };

    // Mock the fetch calls in sequence
    (fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockRules
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockPurchases
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockOffer
      });

    render(<OffersList />);

    await waitFor(() => {
      expect(screen.getByText('Tank Turret')).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('should render error state when fetch fails', async () => {
    (fetch as any).mockRejectedValueOnce(new Error('Network error'));

    render(<OffersList />);

    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
    });
  });

  it('should render empty state when no offers', async () => {
    const mockRules = {
      operationType: 'condition',
      condition: {
        conditionType: 'gte',
        value1: { type: 'property', value: 'user.purchases.length' },
        value2: { type: 'value', value: 10 } // High threshold
      },
      nextOperation: {
        operationType: 'action',
        action: { actionType: 'showOffer', params: { offerId: ['tank-turret'] } }
      }
    };

    const mockPurchases = [
      { id: 'purchase-1', amount: 10 }
    ];

    (fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockRules
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockPurchases
      });

    render(<OffersList />);

    await waitFor(() => {
      expect(screen.getByText('No offers available')).toBeInTheDocument();
    });
  });
});
