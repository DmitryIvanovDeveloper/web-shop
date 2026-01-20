'use client';

import React from 'react';
import type { OfferCardTemplate, OfferCardStyles } from '../../../domain/entities/app-config.entity';

interface OfferCardEditorProps {
  card: OfferCardTemplate;
  onUpdate: (card: OfferCardTemplate) => void;
}

export function OfferCardEditor({ card, onUpdate }: OfferCardEditorProps): JSX.Element {
  const updateStyles = (styles: Partial<OfferCardStyles>): void => {
    onUpdate({
      ...card,
      styles: {
        ...card.styles,
        ...styles,
      },
    });
  };

  const updateStyleField = (category: keyof OfferCardStyles, field: string, value: string): void => {
    const categoryStyles = card.styles[category] || {};
    updateStyles({
      [category]: {
        ...categoryStyles,
        [field]: value,
      },
    });
  };

  const updateName = (name: string): void => {
    onUpdate({ ...card, name });
  };

  const updateMediaField = (field: 'mainImage' | 'mainImageAlt', value: string): void => {
    const media = card.media || {};
    const trimmed = value.trim();

    if (!trimmed) {
      const { [field]: _removed, ...rest } = media;
      const nextMedia = Object.keys(rest).length > 0 ? rest : undefined;
      onUpdate({ ...card, media: nextMedia });
      return;
    }

    onUpdate({
      ...card,
      media: {
        ...media,
        [field]: trimmed,
      },
    });
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900">Offer Card Settings</h3>
        <p className="text-xs text-gray-500 mt-0.5">{card.name || card.id}</p>
      </div>

      {/* Basic info */}
      <div>
        <label className="text-xs font-medium text-gray-600 block mb-1.5">Name</label>
        <input
          type="text"
          value={card.name}
          onChange={(e) => updateName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          placeholder="Offer Card Name"
        />
      </div>

      {/* Container styles (simplified) */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Container</h4>

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">Background Color</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={card.styles.container?.backgroundColor || '#1F2937'}
              onChange={(e) => updateStyleField('container', 'backgroundColor', e.target.value)}
              className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={card.styles.container?.backgroundColor || ''}
              onChange={(e) => updateStyleField('container', 'backgroundColor', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
              placeholder="#1F2937"
            />
          </div>
        </div>
      </div>

      {/* Main image */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Image</h4>

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">Main Image URL</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={card.media?.mainImage || ''}
              onChange={(e) => updateMediaField('mainImage', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
              placeholder="https://images.example.com/offer-card.png"
            />
            {card.media?.mainImage && (
              <button
                type="button"
                onClick={() => updateMediaField('mainImage', '')}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-500 hover:bg-gray-50"
                title="Clear image"
              >
                ✕
              </button>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Paste an image URL. (File upload is temporarily disabled in this simplified editor.)
          </p>
        </div>
      </div>
    </div>
  );
}

