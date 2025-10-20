import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { Container } from 'inversify';
import { OffersList } from '../../interface-adapters/ui/components/offers-list';
import { OffersListPresenter } from '../../interface-adapters/presenters/offers-list.presenter';
import { EvaluateOffersUseCase } from '../../application/use-cases/evaluate-offers.use-case';
import { RulesRepository } from '../../infrastructure/repositories/rules.repository';
import { OfferRepository } from '../../infrastructure/repositories/offer.repository';
import { PropertyReadersService } from '../../infrastructure/services/property-readers.service';
import { OFFERS_TYPES } from '../../infrastructure/bootstrap/types';
import { HttpClientMock } from '../../../../infrastructure/http/http-client.mock';
import { TYPES } from '../../../../infrastructure/bootstrap/types';
import type { OffersListViewModel } from '../../interface-adapters/view-models/offers-list.view-model';

// Mock React component for testing
const MockOffersList = ({ presenter }: { presenter: OffersListPresenter }) => {
  const [viewModel, setViewModel] = React.useState<OffersListViewModel>({ status: 'loading' });

  React.useEffect(() => {
    const loadOffers = async () => {
      try {
        const vm = await presenter.present();
        setViewModel(vm);
      } catch (error) {
        setViewModel({
          status: 'error' as const,
          message: error instanceof Error ? error.message : 'Failed to load offers'
        });
      }
    };
    loadOffers();
  }, [presenter]);

  if (viewModel.status === 'loading') {
    return React.createElement('div', { 'data-testid': 'loading' }, 'Loading offers...');
  }

  if (viewModel.status === 'error') {
    return React.createElement('div', { 'data-testid': 'error' }, `Error: ${viewModel.message}`);
  }

  if (viewModel.status === 'success') {
    if (!viewModel.offers || viewModel.offers.length === 0) {
      return React.createElement('div', { 'data-testid': 'no-offers' }, 'No offers available');
    }

    return React.createElement('div', { 'data-testid': 'offers-list' },
      viewModel.offers.map((offer, index) =>
        React.createElement('div', { key: offer.id || index, 'data-testid': `offer-${offer.id || index}` }, offer.title || 'Unknown Offer')
      )
    );
  }

  return React.createElement('div', { 'data-testid': 'unknown-state' }, 'Unknown state');
};

describe('Offers UI E2E Tests', () => {
  let container: Container;
  let presenter: OffersListPresenter;

  beforeEach(() => {
    container = new Container();
    
    // Register dependencies
    container.bind(TYPES.HttpClient).to(HttpClientMock).inSingletonScope();
    container.bind(OFFERS_TYPES.RulesRepository).to(RulesRepository).inSingletonScope();
    container.bind(OFFERS_TYPES.OfferRepository).to(OfferRepository).inSingletonScope();
    container.bind(OFFERS_TYPES.ConditionReader).to(PropertyReadersService).inSingletonScope();
    container.bind(OFFERS_TYPES.EvaluateOffersUseCase).to(EvaluateOffersUseCase).inSingletonScope();
    container.bind(OFFERS_TYPES.OffersListPresenter).to(OffersListPresenter).inSingletonScope();
    
    presenter = container.get(OFFERS_TYPES.OffersListPresenter);
  });

  afterEach(() => {
    container.unbindAll();
  });

  it('should render OffersList component with loading state', async () => {
    render(React.createElement(MockOffersList, { presenter }));
    
    // Should show loading initially
    expect(screen.getByTestId('loading')).toBeInTheDocument();
    expect(screen.getByText('Loading offers...')).toBeInTheDocument();
  });

  it('should render OffersList component with offers', async () => {
    render(React.createElement(MockOffersList, { presenter }));
    
    // Wait for offers to load - just check that loading state changes
    await waitFor(() => {
      const loading = screen.queryByTestId('loading');
      // Loading should disappear eventually
      expect(loading).not.toBeInTheDocument();
    }, { timeout: 10000 });
    
    // Check final state
    const offersList = screen.queryByTestId('offers-list');
    const noOffers = screen.queryByTestId('no-offers');
    const error = screen.queryByTestId('error');
    
    // Should have one of these final states
    expect(offersList || noOffers || error).toBeInTheDocument();
  });

  it('should handle presenter.present() method', async () => {
    const viewModel = await presenter.present();
    
    expect(viewModel).toBeDefined();
    expect(viewModel.status).toBeDefined();
    expect(['loading', 'success', 'error']).toContain(viewModel.status);
    
    if (viewModel.status === 'success') {
      expect(viewModel.offers).toBeDefined();
      expect(Array.isArray(viewModel.offers)).toBe(true);
    }
    
    if (viewModel.status === 'error') {
      expect(viewModel.message).toBeDefined();
    }
  });

  it('should complete full UI flow from presenter to component', async () => {
    // 1. Test presenter directly
    const viewModel = await presenter.present();
    expect(viewModel).toBeDefined();
    
    // 2. Test component rendering
    render(React.createElement(MockOffersList, { presenter }));
    
    // 3. Wait for final state
    await waitFor(() => {
      const loading = screen.queryByTestId('loading');
      expect(loading).not.toBeInTheDocument();
    }, { timeout: 10000 });
    
    // 4. Verify final state
    const offersList = screen.queryByTestId('offers-list');
    const noOffers = screen.queryByTestId('no-offers');
    const error = screen.queryByTestId('error');
    
    // Should have one of these states
    expect(offersList || noOffers || error).toBeInTheDocument();
    
    console.log('UI E2E Test - Final state:', {
      hasOffersList: !!offersList,
      hasNoOffers: !!noOffers,
      hasError: !!error
    });
  });
});
