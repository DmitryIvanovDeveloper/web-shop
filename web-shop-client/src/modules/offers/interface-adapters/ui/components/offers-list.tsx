'use client';
import { useEffect, useState, useRef } from 'react';
import { OfferCard } from '../../../../../shared/components/molecules/offer-card';
import { Grid } from '../../../../../shared/components/molecules/grid';
import { OffersPopup } from './offers-popup';
import type { Offer } from '../../../domain/types';

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
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const isFirstLoadRef = useRef(true);

  useEffect(() => {
    console.log('[OffersList] useEffect triggered');

    const loadOffers = async () => {
      try {
        console.log('[OffersList] Loading offers...');

        // Загружаем правила
        const rulesResponse = await fetch('/api/offers/rules');
        const rules = await rulesResponse.json();
        console.log('[OffersList] Rules loaded:', rules);

        // Загружаем покупки пользователя
        const purchasesResponse = await fetch('/api/user/purchases');
        const purchases = await purchasesResponse.json();
        console.log('[OffersList] User purchases:', purchases);

        // Проверяем условие из rules
        const purchasesLength = Array.isArray(purchases) ? purchases.length : 0;
        console.log('[OffersList] User purchases length:', purchasesLength);

        // Извлекаем условие из rules
        const condition = rules.condition;
        const threshold = condition?.value2?.value || 1;
        const conditionType = condition?.conditionType || 'gte';

        console.log('[OffersList] Condition:', { conditionType, threshold, purchasesLength });

        let conditionMet = false;
        if (conditionType === 'gte') {
          conditionMet = purchasesLength >= threshold;
        } else if (conditionType === 'lte') {
          conditionMet = purchasesLength <= threshold;
        } else if (conditionType === 'eq') {
          conditionMet = purchasesLength === threshold;
        }

        console.log('[OffersList] Condition met:', conditionMet);

        if (conditionMet) {
          // Условие выполнено, загружаем offers
          const offerIds = rules.nextOperation?.action?.params?.offerId;
          if (offerIds) {
            console.log('[OffersList] Loading offers:', offerIds);

            // Если offerId - массив, загружаем все offers
            if (Array.isArray(offerIds)) {
              const offersPromises = offerIds.map(async (offerId) => {
                console.log('[OffersList] Loading offer:', offerId);
                const offerResponse = await fetch(`/api/products/offers/${offerId}`);
                const offer = await offerResponse.json();
                console.log('[OffersList] Offer loaded:', offer);
                return offer;
              });

              const loadedOffers = await Promise.all(offersPromises);
              console.log('[OffersList] All offers loaded:', loadedOffers);
              setOffers(loadedOffers);

              // Показываем попап при первой загрузке если есть offers
              if (showPopupOnFirstLoad && isFirstLoadRef.current && loadedOffers.length > 0) {
                console.log('[OffersList] Opening popup for first load');
                setIsPopupOpen(true);
                isFirstLoadRef.current = false;
              }
            } else {
              // Если offerId - строка (для обратной совместимости)
              console.log('[OffersList] Loading single offer:', offerIds);
              const offerResponse = await fetch(`/api/products/offers/${offerIds}`);
              const offer = await offerResponse.json();
              console.log('[OffersList] Offer loaded:', offer);
              const loadedOffers = [offer];
              setOffers(loadedOffers);

              // Показываем попап при первой загрузке если есть offers
              if (showPopupOnFirstLoad && isFirstLoadRef.current && loadedOffers.length > 0) {
                console.log('[OffersList] Opening popup for first load');
                setIsPopupOpen(true);
                isFirstLoadRef.current = false;
              }
            }
          }
        }

        setLoading(false);
      } catch (error) {
        console.error('[OffersList] Error loading offers:', error);
        setError(error instanceof Error ? error.message : 'Failed to load offers');
        setLoading(false);
      }
    };

    loadOffers();
  }, [showPopupOnFirstLoad]);

  if (loading) {
    console.log('[OffersList] Rendering loading state');
    return <div className={className} style={style}>Loading offers...</div>;
  }

  if (error) {
    console.log('[OffersList] Rendering error state:', error);
    return <div className={className} style={style}>Error: {error}</div>;
  }

  if (offers.length === 0) {
    console.log('[OffersList] No offers to render, returning null');
    return null;
  }

  console.log('[OffersList] Offers data:', offers);
  console.log('[OffersList] First offer:', offers[0]);

  console.log('[OffersList] Rendering offers:', offers);

  const handleOfferClick = (offer: Offer) => {
    console.log('[OffersList] Offer clicked:', offer);
    // Можно добавить дополнительную логику при клике на offer в попапе
  };

  const handleClosePopup = () => {
    console.log('[OffersList] Closing popup');
    setIsPopupOpen(false);
  };

  return (
    <>
      <div className={`${className || ''} mb-8`} style={style}>
        <h2 className="text-white text-xl font-bold mb-4">Offers</h2>
        <Grid style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
          {offers.map((offer, index) => (
            <OfferCard key={offer?.id || `offer-${index}`} {...offer} />
          ))}
        </Grid>
      </div>

      {/* Offers Popup */}
      <OffersPopup
        offers={offers}
        isOpen={isPopupOpen}
        onClose={handleClosePopup}
        onOfferClick={handleOfferClick}
      />
    </>
  );
}
