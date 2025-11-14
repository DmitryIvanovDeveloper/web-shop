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
  const [loadingOffers, setLoadingOffers] = useState<Set<string>>(new Set());
  const isFirstLoadRef = useRef(true);

  // DISABLED: Offers loading is now handled only via UserAuthenticatedEvent through PersonalOffersWidget
  // This ensures that context is loaded and conditions are checked only after authentication
  // useEffect(() => {
  //   console.log('[OffersList] useEffect triggered');

  //   const loadOffers = async () => {
  //     try {
  //       console.log('[OffersList] Loading offers...');

  //       // Загружаем правила
  //       const rulesResponse = await fetch('/api/offers/rules');
  //       const ruleTree = await rulesResponse.json();
  //       console.log('[OffersList] Rule tree loaded:', {
  //         hasRuleSet: !!ruleTree.ruleSet,
  //         scenariosCount: ruleTree.scenarios?.length ?? 0,
  //       });

  //       // Check if ruleTree has scenarios array with items
  //       // IMPORTANT: We should evaluate conditions before using items
  //       // For now, OffersList uses a simplified approach - it should be refactored to use EvaluateOffersUseCase
  //       // This is a temporary workaround that uses items directly, but ideally conditions should be checked
  //       if (ruleTree.scenarios && Array.isArray(ruleTree.scenarios)) {
  //         console.log('[OffersList] Checking scenarios for items...');
          
  //         // Load user context to evaluate conditions
  //         const contextResponse = await fetch('/api/user/offer-context');
  //         const context = await contextResponse.json();
  //         const userContext = context?.data || {};
          
  //         console.log('[OffersList] User context loaded:', {
  //           isNew: userContext['user.flags.isNew'],
  //           purchasesLength: userContext['user.purchases.length'],
  //         });
          
  //         // Find scenarios with items that match returning_no_purchase
  //         // AND check if condition is met: user.flags.isNew === false AND user.purchases.length === 0
  //         const returningScenarios = ruleTree.scenarios.filter((s: any) => {
  //           if (s.triggerCode === 'returning_no_purchase' && s.items && s.items.length > 0) {
  //             // Evaluate condition: user.flags.isNew === false AND user.purchases.length === 0
  //             const isNew = userContext['user.flags.isNew'] === true;
  //             const purchasesLength = userContext['user.purchases.length'] ?? 0;
  //             const conditionMet = !isNew && purchasesLength === 0;
              
  //             console.log('[OffersList] Evaluating returning_no_purchase condition:', {
  //               scenarioSlug: s.slug,
  //               isNew,
  //               purchasesLength,
  //               conditionMet,
  //             });
              
  //             return conditionMet;
  //           }
  //           return false;
  //         });
          
  //         if (returningScenarios.length > 0) {
  //           console.log('[OffersList] Found returning scenarios with items and matching conditions:', returningScenarios.length);
            
  //           // Convert items directly to offers
  //           const offersFromItems: Offer[] = [];
  //           for (const scenario of returningScenarios) {
  //             if (scenario.items) {
  //               for (const item of scenario.items) {
  //                 // Create Offer object from item
  //                 const offer: Offer = {
  //                   id: item.id,
  //                   title: item.title,
  //                   // Add other properties as needed
  //                 };
  //                 offersFromItems.push(offer);
  //               }
  //             }
  //           }
            
  //           if (offersFromItems.length > 0) {
  //             console.log('[OffersList] Created offers from scenario items:', offersFromItems.length);
  //             setOffers(offersFromItems);
  //             setLoading(false);
  //             return;
  //           }
  //         } else {
  //           console.log('[OffersList] No returning scenarios with matching conditions found');
  //         }
  //       }

  //       // Fallback: original logic using ruleSet
  //       // Загружаем покупки пользователя
  //       const purchasesResponse = await fetch('/api/user/purchases');
  //       const purchases = await purchasesResponse.json();
  //       console.log('[OffersList] User purchases:', purchases);

  //       // Проверяем условие из rules
  //       const purchasesLength = Array.isArray(purchases) ? purchases.length : 0;
  //       console.log('[OffersList] User purchases length:', purchasesLength);

  //       // Извлекаем условие из rules
  //       const condition = ruleTree.ruleSet?.condition;
  //       const threshold = condition?.value2?.value || 1;
  //       const conditionType = condition?.conditionType || 'gte';

  //       console.log('[OffersList] Condition:', { conditionType, threshold, purchasesLength });

  //       let conditionMet = false;
  //       if (conditionType === 'gte') {
  //         conditionMet = purchasesLength >= threshold;
  //       } else if (conditionType === 'lte') {
  //         conditionMet = purchasesLength <= threshold;
  //       } else if (conditionType === 'eq') {
  //         conditionMet = purchasesLength === threshold;
  //       }

  //       if (conditionMet) {
  //         // Условие выполнено, загружаем offers
  //         const offerIds = ruleTree.ruleSet?.nextOperation?.action?.params?.offerId;
  //         if (offerIds) {

  //           // Если offerId - массив, загружаем все offers
  //           if (Array.isArray(offerIds)) {
  //             const offersPromises = offerIds.map(async (offerId) => {
  //               const offerResponse = await fetch(`/api/products/offers/${offerId}`);
  //               const offer = await offerResponse.json();
  //               return offer;
  //             });

  //             const loadedOffers = await Promise.all(offersPromises);
  //             console.log('[OffersList] All offers loaded:', loadedOffers);
  //             setOffers(loadedOffers);
  //           } else {
  //             // Если offerId - строка (для обратной совместимости)
  //             const offerResponse = await fetch(`/api/products/offers/${offerIds}`);
  //             const offer = await offerResponse.json();
  //             const loadedOffers = [offer];
  //             setOffers(loadedOffers);
  //           }
  //         }
  //       }

  //       setLoading(false);
  //     } catch (error) {
  //       console.error('[OffersList] Error loading offers:', error);
  //       setError(error instanceof Error ? error.message : 'Failed to load offers');
  //       setLoading(false);
  //     }
  //   };

  //   loadOffers();
  // }, [showPopupOnFirstLoad]);

  // Set loading to false immediately since we're not loading offers on mount
  useEffect(() => {
    setLoading(false);
  }, []);

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
            <div key={`skeleton-${index}`} className="@container">
              <OfferCardSkeleton />
            </div>
          ))}
        </Grid>
      </div>
    );
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
        <h2 className="text-white text-xl font-bold mb-4">Offers</h2>
        <Grid className="w-full mx-auto">
          {offers.map((offer, index) => (
            <div key={offer?.id || `offer-${index}`} className="@container">
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
