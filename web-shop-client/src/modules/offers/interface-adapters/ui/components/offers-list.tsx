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
    const [viewModel, setViewModel] = useState<any>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [loadingOffers, setLoadingOffers] = useState<Set<string>>(new Set());
  const isFirstLoadRef = useRef(true);

    useEffect(() => {
        const loadOffers = async () => {
      try {
                        const presenter = container.get<OffersListPresenter>(OFFERS_TYPES.OffersListPresenter);
        const result = await presenter.present();
        setViewModel(result);
      } catch (error) {
                setViewModel({
          status: 'error',
          message: error instanceof Error ? error.message : 'Failed to load offers',
          labels: { offersTitle: 'Offers', emptyState: 'No offers available', loadingState: 'Loading...', featuredTitle: 'Featured', expiredBadge: 'Expired' }
        });
      }
    };

    loadOffers();
  }, [showPopupOnFirstLoad]);


    useEffect(() => {
    if (!loading && offers.length > 0 && showPopupOnFirstLoad && isFirstLoadRef.current) {
            setIsPopupOpen(true);
      isFirstLoadRef.current = false;
    }
  }, [loading, offers, showPopupOnFirstLoad]);

  if (loading) {
        return (
      <div className={className} style={style}>
        <Grid>
          {}
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

        const handleBuyOffer = async (offer: Offer) => {
            console.log('[OffersList] Full offer object:', JSON.stringify(offer, null, 2));
    
    if (!offer.id) {
            return;
    }
    
    try {
            setLoadingOffers(prev => new Set(prev).add(offer.id));
      
      const selectProductForPaymentUseCase = container.get<SelectProductForPaymentUseCase>(
        PRODUCTS_TYPES.SelectProductForPaymentUseCase
      );
      
      await selectProductForPaymentUseCase.execute({ productId: offer.id });
      
          } catch (error) {
                  setLoadingOffers(prev => {
        const next = new Set(prev);
        next.delete(offer.id);
        return next;
      });
    }
  };

  const handleClosePopup = () => {
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

      {}
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
