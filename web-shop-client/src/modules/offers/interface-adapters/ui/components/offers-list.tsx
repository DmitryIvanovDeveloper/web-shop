'use client';
import { useEffect, useState, useRef } from 'react';
import { OfferCard } from '../../../../../shared/components/molecules/offer-card';
import { OfferCardSkeleton } from '../../../../../shared/components/molecules/offer-card-skeleton';
import { Grid } from '../../../../../shared/components/molecules/grid';
import { OffersPopup } from './offers-popup';
import type { Offer } from '../../../domain/types';
import { container } from '../../../../../infrastructure/bootstrap/container';
import { PRODUCTS_TYPES } from '../../../../products/infrastructure/bootstrap/types';
import type { SelectProductForPaymentUseCase } from '../../../../products/application/use-cases/select-product-for-payment.use-case';
import { OFFERS_TYPES } from '../../../infrastructure/bootstrap/types';
import type { OffersListPresenter } from '../../presenters/offers-list.presenter';

export interface OffersListProps {
  readonly className?: string;
  readonly style?: React.CSSProperties;
  readonly showPopupOnFirstLoad?: boolean;
}

export function OffersList({
  className,
  style,
  showPopupOnFirstLoad = true
}: OffersListProps): JSX.Element | null {
  console.log('[OffersList] Component rendered with props:', { className, style, showPopupOnFirstLoad });
  const [viewModel, setViewModel] = useState<any>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [loadingOffers, setLoadingOffers] = useState<Set<string>>(new Set());
  const isFirstLoadRef = useRef(true);

  // Load offers using the proper use case instead of direct API calls
  useEffect(() => {
    console.log('[OffersList] useEffect triggered - loading offers using SelectOffersUseCase');

    const loadOffers = async () => {
      try {
        console.log('[OffersList] Loading offers using OffersListPresenter...');

        // Use the proper presenter to load offers
        const presenter = container.get<OffersListPresenter>(OFFERS_TYPES.OffersListPresenter);
        const result = await presenter.present();
        setViewModel(result);
      } catch (error) {
        console.error('[OffersList] Error loading offers:', error);
        setViewModel({
          status: 'error',
          message: error instanceof Error ? error.message : 'Failed to load offers',
          labels: { offersTitle: 'Offers', emptyState: 'No offers available', loadingState: 'Loading...', featuredTitle: 'Featured', expiredBadge: 'Expired' }
        });
      }
    };

    loadOffers();
  }, [showPopupOnFirstLoad]);


  // Открываем popup только после полной загрузки данных
  useEffect(() => {
    if (!loading && offers.length > 0 && showPopupOnFirstLoad && isFirstLoadRef.current) {
      console.log('[OffersList] Data fully loaded, opening popup');
      setIsPopupOpen(true);
      isFirstLoadRef.current = false;
    }
  }, [loading, offers, showPopupOnFirstLoad]);

  if (loading) {
    console.log('[OffersList] Rendering loading state with skeletons');
    return (
      <div className={className} style={style}>
        <Grid>
          {/* Show 3 skeleton cards while loading */}
          {Array.from({ length: 3 }, (_, index) => (
            <div key={`skeleton-${index}`} className="@container" style={{ height: '100%' }}>
              <OfferCardSkeleton />
            </div>
          ))}
        </Grid>
      </div>
    );
  }

  if (!viewModel) {
    return <div className={className} style={style}>Loading offers...</div>;
  }

  if (viewModel.status === 'loading') {
    return (
      <div className={className} style={style}>
        <h2 className="text-white text-xl font-bold mb-4">{viewModel.labels.offersTitle}</h2>
        <Grid>
          {Array.from({ length: 6 }, (_, index) => (
            <div key={`skeleton-${index}`} className="@container">
              <OfferCardSkeleton />
            </div>
          ))}
        </Grid>
      </div>
    );
  }

  if (viewModel.status === 'error') {
    return (
      <div className={className} style={style}>
        <h2 className="text-white text-xl font-bold mb-4">{viewModel.labels.offersTitle}</h2>
        <div className="text-white">Error: {viewModel.message}</div>
      </div>
    );
  }

  if (viewModel.offers.length === 0) {
    return null;
  }

  console.log('[OffersList] Offers data:', offers);
  console.log('[OffersList] First offer:', offers[0]);

  console.log('[OffersList] Rendering offers:', offers);

  const handleBuyOffer = async (offer: Offer) => {
    console.log('[OffersList] Buy offer clicked:', offer);
    console.log('[OffersList] Offer id:', offer.id);
    console.log('[OffersList] Full offer object:', JSON.stringify(offer, null, 2));
    
    if (!offer.id) {
      console.error('[OffersList] Offer has no id!', offer);
      return;
    }
    
    try {
      // Set loading state for this specific offer
      setLoadingOffers(prev => new Set(prev).add(offer.id));
      
      const selectProductForPaymentUseCase = container.get<SelectProductForPaymentUseCase>(
        PRODUCTS_TYPES.SelectProductForPaymentUseCase
      );
      
      await selectProductForPaymentUseCase.execute({ productId: offer.id });
      
      // Note: We intentionally don't remove loading state to keep it infinite
    } catch (error) {
      console.error('[OffersList] Failed to initiate payment:', error);
      // Remove loading state on error
      setLoadingOffers(prev => {
        const next = new Set(prev);
        next.delete(offer.id);
        return next;
      });
    }
  };

  const handleClosePopup = () => {
    console.log('[OffersList] Closing popup');
    setIsPopupOpen(false);
  };

  return (
    <>
      <div className={`${className || ''} mb-8`} style={style}>
        <h2 className="text-white text-xl font-bold mb-4">{viewModel.labels.offersTitle}</h2>
        <Grid className="w-full mx-auto">
          {viewModel.offers.map((offer, index) => (
            <div key={offer?.id || `offer-${index}`} className="@container" style={{ height: '100%' }}>
              <OfferCard 
                {...offer}
                timer={offer.timer ? new Date(offer.timer) : undefined}
                isLoading={loadingOffers.has(offer.id)}
                onClick={() => handleBuyOffer(offer)}
              />
            </div>
          ))}
        </Grid>
      </div>

      {/* Offers Popup */}
      <OffersPopup
        offers={offers}
        isOpen={isPopupOpen}
        onClose={handleClosePopup}
        onOfferClick={handleBuyOffer}
        loadingOfferIds={loadingOffers}
      />
    </>
  );
}
