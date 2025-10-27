'use client';

import { useState, useEffect } from 'react';
import { Popup } from '../../../../../shared/components/molecules/popup';
import { Grid } from '../../../../../shared/components/molecules/grid';
import { OfferCard } from '../../../../../shared/components/molecules/offer-card';
import type { Offer } from '../../../domain/types';

export interface OffersPopupProps {
  readonly offers: readonly Offer[];
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onOfferClick?: (offer: Offer) => void;
  readonly loadingOfferIds?: Set<string>;
}

export function OffersPopup({
  offers,
  isOpen,
  onClose,
  onOfferClick,
  loadingOfferIds = new Set()
}: OffersPopupProps): JSX.Element | null {
  if (!isOpen || offers.length === 0) {
    return null;
  }

  return (
    <Popup
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-4xl w-full"
      style={{
        backgroundColor: '#1F2937',
        border: '2px solid #FBBF24',
        borderRadius: '12px',
        padding: '20px',
        width: '90vw',
        maxWidth: '1200px',
        maxHeight: '80vh',
        overflow: 'hidden'
      }}
      overlayStyle={{
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        zIndex: 100
      }}
    >
      <div className="!flex !flex-col h-full !justify-center !items-center">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white text-2xl font-bold">🎁 Special Offers</h2>
        </div>

        {/* Offers Grid */}
        <div className="flex-1 overflow-y-auto">
          <Grid className="justify-center" style={{ width: '100%', maxWidth: '100%', margin: '0 auto' }}>
            {offers.map((offer) => (
              <div key={offer.id} className="@container">
                <OfferCard
                  {...offer}
                  timer={offer.timer ? new Date(offer.timer) : undefined}
                  isLoading={loadingOfferIds.has(offer.id)}
                  onClick={() => onOfferClick?.(offer)}
                  className="cursor-pointer hover:scale-105 transition-transform duration-200"
                />
              </div>
            ))}
          </Grid>
        </div>
      </div>
    </Popup>
  );
}
