'use client';

import React from 'react';
import type { OfferCardTemplate } from '../../../domain/entities/app-config.entity';

interface OfferCardsManagerProps {
  offerCards: OfferCardTemplate[];
  selectedCardId: string | null;
  onSelect: (cardId: string) => void;
  onAdd: () => void;
  onDelete: (cardId: string) => void;
  onMigrate?: () => void;
}

export function OfferCardsManager({ 
  offerCards, 
  selectedCardId, 
  onSelect, 
  onAdd, 
  onDelete,
  onMigrate
}: OfferCardsManagerProps): JSX.Element {
  
  const needsMigration = offerCards.length > 0 && offerCards.some(card => !card.styles?.topLabel);
  
  return (
    <div className="p-4 border-t border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
          Offer Cards
        </h3>
        <div className="flex gap-1">
          {needsMigration && onMigrate && (
            <button
              onClick={onMigrate}
              className="px-2 py-1 text-xs rounded bg-orange-500 text-white hover:bg-orange-600 transition-colors"
              title="Migrate to Figma styles"
            >
              🎨 Migrate
            </button>
          )}
          <button
            onClick={onAdd}
            className="px-2 py-1 text-xs rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            title="Add new offer card"
          >
            + Add Card
          </button>
        </div>
      </div>

      {offerCards.length === 0 ? (
        <div className="text-gray-500 text-sm text-center py-4">
          No offer cards found
        </div>
      ) : (
        <div className="space-y-1">
          {offerCards.map((card) => (
            <div
              key={card.id}
              className={`flex items-center gap-1 rounded text-xs transition-colors ${
                selectedCardId === card.id ? 'bg-blue-500' : ''
              }`}
            >
              <button
                onClick={() => onSelect(card.id)}
                className={`flex-1 text-left px-2 py-1.5 rounded transition-colors ${
                  selectedCardId === card.id
                    ? 'text-white font-medium'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] uppercase font-semibold ${
                    selectedCardId === card.id ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    Card
                  </span>
                  <span className="font-mono text-xs">{card.id}</span>
                </div>
                {card.name && card.name !== card.id && (
                  <div className={`text-[10px] mt-0.5 ${
                    selectedCardId === card.id ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    "{card.name}"
                  </div>
                )}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(`Delete offer card "${card.name || card.id}"?`)) {
                    onDelete(card.id);
                  }
                }}
                className="px-2 py-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                title="Delete offer card"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

