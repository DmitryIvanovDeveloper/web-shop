'use client';
import { useEffect, useState } from 'react';
import { OfferCard } from '../../../../../shared/components/molecules/offer-card';
import { Grid } from '../../../../../shared/components/molecules/grid';

export interface OffersListProps {
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export function OffersList({ className, style }: OffersListProps): JSX.Element | null {
  console.log('[OffersList] Component rendered with props:', { className, style });
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        
        // Проверяем условие: user.purchases.length >= 1
        const purchasesLength = Array.isArray(purchases) ? purchases.length : 0;
        console.log('[OffersList] User purchases length:', purchasesLength);
        
        if (purchasesLength >= 1) {
          // Условие выполнено, загружаем offers
          const offerIds = rules.nextOperation?.action?.params?.offerId;
          if (offerIds) {
            console.log('[OffersList] Loading offers:', offerIds);
            
            // Если offerId - массив, загружаем все offers
            if (Array.isArray(offerIds)) {
              const offersPromises = offerIds.map(async (offerId) => {
                console.log('[OffersList] Loading offer:', offerId);
                const offerResponse = await fetch(`/mocks/api/products/offers/${offerId}.json`);
                const offer = await offerResponse.json();
                console.log('[OffersList] Offer loaded:', offer);
                return offer;
              });
              
              const offers = await Promise.all(offersPromises);
              console.log('[OffersList] All offers loaded:', offers);
              setOffers(offers);
            } else {
              // Если offerId - строка (для обратной совместимости)
              console.log('[OffersList] Loading single offer:', offerIds);
              const offerResponse = await fetch(`/mocks/api/products/offers/${offerIds}.json`);
              const offer = await offerResponse.json();
              console.log('[OffersList] Offer loaded:', offer);
              setOffers([offer]);
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
  }, []);

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
  return (
    <div className={`${className || ''} mb-8`} style={style}>
      <h2 className="text-white text-xl font-bold mb-4">Offers</h2>
      <Grid>
        {offers.map((offer, index) => (
          <OfferCard key={offer?.id || `offer-${index}`} {...offer} />
        ))}
      </Grid>
    </div>
  );
}
