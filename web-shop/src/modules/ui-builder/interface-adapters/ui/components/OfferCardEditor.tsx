'use client';

import React from 'react';
import type { OfferCardTemplate, OfferCardStyles } from '../../../domain/entities/app-config.entity';

interface OfferCardEditorProps {
  card: OfferCardTemplate;
  onUpdate: (card: OfferCardTemplate) => void;
}

export function OfferCardEditor({ card, onUpdate }: OfferCardEditorProps): JSX.Element {
  const setMedia = (media: OfferCardTemplate['media'] | undefined): void => {
    onUpdate({
      ...card,
      media,
    });
  };

  const updateStyles = (styles: Partial<OfferCardStyles>): void => {
    onUpdate({
      ...card,
      styles: {
        ...card.styles,
        ...styles,
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
      setMedia(nextMedia);
      return;
    }

    setMedia({
      ...media,
      [field]: trimmed,
    });
  };

  const [isMainImageUploading, setIsMainImageUploading] = React.useState(false);

  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
          return;
        }
        reject(new Error('Failed to read file'));
      };

      reader.onerror = () => {
        reject(reader.error ?? new Error('Failed to read file'));
      };

      reader.readAsDataURL(file);
    });
  };

  const handleMainImageUpload = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setIsMainImageUploading(true);

    try {
      const base64 = await readFileAsDataUrl(file);
      const existingMedia = card.media || {};

      setMedia({
        ...existingMedia,
        mainImage: base64,
        mainImageAlt: existingMedia.mainImageAlt || file.name || 'Offer card image',
      });
    } catch {
      // Ignore upload errors for now
    } finally {
      setIsMainImageUploading(false);
      event.target.value = '';
    }
  };

  const updateStyleField = (
    category: keyof OfferCardStyles,
    field: string,
    value: string
  ): void => {
    const categoryStyles = card.styles[category] || {};
    updateStyles({
      [category]: {
        ...categoryStyles,
        [field]: value,
      },
    });
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900">Offer Card Settings</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          {card.name || card.id}
        </p>
      </div>

      {/* Name */}
      <div>
        <label className="text-xs font-medium text-gray-600 block mb-1.5">
          Name
        </label>
        <input
          type="text"
          value={card.name}
          onChange={(e) => updateName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          placeholder="Offer Card Name"
        />
      </div>

      {/* Container Styles */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Container</h4>
        
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Background Color
          </label>
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

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Border Radius
          </label>
          <input
            type="text"
            value={card.styles.container?.borderRadius || ''}
            onChange={(e) => updateStyleField('container', 'borderRadius', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="8px"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Shadow
          </label>
          <input
            type="text"
            value={card.styles.container?.shadow || ''}
            onChange={(e) => updateStyleField('container', 'shadow', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="lg"
          />
        </div>
      </div>

      {/* Image Styles */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Image</h4>
        
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Main Image URL
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={card.media?.mainImage || ''}
              onChange={(e) => updateMediaField('mainImage', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
              placeholder="https://example.com/image.png"
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
            Paste an image URL or upload a file below. Base64 data URLs are supported.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex-1 cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleMainImageUpload}
              disabled={isMainImageUploading}
              className="hidden"
            />
            <div className={`px-3 py-2 border border-gray-300 rounded-lg text-sm text-center text-gray-700 ${isMainImageUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 cursor-pointer'}`}>
              {isMainImageUploading ? '📤 Uploading…' : '📤 Upload Image'}
            </div>
          </label>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Alt Text
          </label>
          <input
            type="text"
            value={card.media?.mainImageAlt || ''}
            onChange={(e) => updateMediaField('mainImageAlt', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="Offer card image"
          />
        </div>

        {card.media?.mainImage && (
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1.5">
              Preview
            </label>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <img
                src={card.media.mainImage}
                alt={card.media.mainImageAlt || 'Offer card image'}
                className="w-full h-40 object-cover"
              />
            </div>
          </div>
        )}

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Background Color
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={card.styles.image?.backgroundColor || '#374151'}
              onChange={(e) => updateStyleField('image', 'backgroundColor', e.target.value)}
              className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={card.styles.image?.backgroundColor || ''}
              onChange={(e) => updateStyleField('image', 'backgroundColor', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
              placeholder="#374151"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Aspect Ratio
          </label>
          <input
            type="text"
            value={card.styles.image?.aspectRatio || ''}
            onChange={(e) => updateStyleField('image', 'aspectRatio', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="1.5 / 1"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Height
          </label>
          <input
            type="text"
            value={card.styles.image?.height || ''}
            onChange={(e) => updateStyleField('image', 'height', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="274px"
          />
        </div>
      </div>

      {/* Top Label Styles */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Top Label</h4>
        
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Background Color
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={card.styles.topLabel?.backgroundColor || '#ffb63e'}
              onChange={(e) => updateStyleField('topLabel', 'backgroundColor', e.target.value)}
              className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={card.styles.topLabel?.backgroundColor || ''}
              onChange={(e) => updateStyleField('topLabel', 'backgroundColor', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
              placeholder="#ffb63e"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Color
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={card.styles.topLabel?.color || '#FFFFFF'}
              onChange={(e) => updateStyleField('topLabel', 'color', e.target.value)}
              className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={card.styles.topLabel?.color || ''}
              onChange={(e) => updateStyleField('topLabel', 'color', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
              placeholder="#FFFFFF"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Font Size
          </label>
          <input
            type="text"
            value={card.styles.topLabel?.fontSize || ''}
            onChange={(e) => updateStyleField('topLabel', 'fontSize', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="12px"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Font Weight
          </label>
          <input
            type="text"
            value={card.styles.topLabel?.fontWeight || ''}
            onChange={(e) => updateStyleField('topLabel', 'fontWeight', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="600"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Padding
          </label>
          <input
            type="text"
            value={card.styles.topLabel?.padding || ''}
            onChange={(e) => updateStyleField('topLabel', 'padding', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="8px 4px"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Border Radius
          </label>
          <input
            type="text"
            value={card.styles.topLabel?.borderRadius || ''}
            onChange={(e) => updateStyleField('topLabel', 'borderRadius', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="20px"
          />
        </div>
      </div>

      {/* Discount Badge Styles */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Discount Badge</h4>
        
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Background Color
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={card.styles.discountBadge?.backgroundColor || '#ff2060'}
              onChange={(e) => updateStyleField('discountBadge', 'backgroundColor', e.target.value)}
              className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={card.styles.discountBadge?.backgroundColor || ''}
              onChange={(e) => updateStyleField('discountBadge', 'backgroundColor', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
              placeholder="#ff2060"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Color
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={card.styles.discountBadge?.color || '#FFFFFF'}
              onChange={(e) => updateStyleField('discountBadge', 'color', e.target.value)}
              className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={card.styles.discountBadge?.color || ''}
              onChange={(e) => updateStyleField('discountBadge', 'color', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
              placeholder="#FFFFFF"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Font Size
          </label>
          <input
            type="text"
            value={card.styles.discountBadge?.fontSize || ''}
            onChange={(e) => updateStyleField('discountBadge', 'fontSize', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="12px"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Font Weight
          </label>
          <input
            type="text"
            value={card.styles.discountBadge?.fontWeight || ''}
            onChange={(e) => updateStyleField('discountBadge', 'fontWeight', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="500"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Padding
          </label>
          <input
            type="text"
            value={card.styles.discountBadge?.padding || ''}
            onChange={(e) => updateStyleField('discountBadge', 'padding', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="8px 4px"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Border Radius
          </label>
          <input
            type="text"
            value={card.styles.discountBadge?.borderRadius || ''}
            onChange={(e) => updateStyleField('discountBadge', 'borderRadius', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="20px"
          />
        </div>
      </div>

      {/* Title Styles */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Title</h4>
        
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Font Size
          </label>
          <input
            type="text"
            value={card.styles.title?.fontSize || ''}
            onChange={(e) => updateStyleField('title', 'fontSize', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="18px"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Font Weight
          </label>
          <input
            type="text"
            value={card.styles.title?.fontWeight || ''}
            onChange={(e) => updateStyleField('title', 'fontWeight', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="500"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Color
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={card.styles.title?.color || '#FAF9F6'}
              onChange={(e) => updateStyleField('title', 'color', e.target.value)}
              className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={card.styles.title?.color || ''}
              onChange={(e) => updateStyleField('title', 'color', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
              placeholder="#FAF9F6"
            />
          </div>
        </div>
      </div>

      {/* Description Styles */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Description</h4>
        
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Font Size
          </label>
          <input
            type="text"
            value={card.styles.description?.fontSize || ''}
            onChange={(e) => updateStyleField('description', 'fontSize', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="16px"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Font Weight
          </label>
          <input
            type="text"
            value={card.styles.description?.fontWeight || ''}
            onChange={(e) => updateStyleField('description', 'fontWeight', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="400"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Color
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={card.styles.description?.color || '#FAF9F6'}
              onChange={(e) => updateStyleField('description', 'color', e.target.value)}
              className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={card.styles.description?.color || ''}
              onChange={(e) => updateStyleField('description', 'color', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
              placeholder="#FAF9F6"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Line Height
          </label>
          <input
            type="text"
            value={card.styles.description?.lineHeight || ''}
            onChange={(e) => updateStyleField('description', 'lineHeight', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="23px"
          />
        </div>
      </div>

      {/* Original Price Styles */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Original Price</h4>
        
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Font Size
          </label>
          <input
            type="text"
            value={card.styles.originalPrice?.fontSize || ''}
            onChange={(e) => updateStyleField('originalPrice', 'fontSize', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="16px"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Font Weight
          </label>
          <input
            type="text"
            value={card.styles.originalPrice?.fontWeight || ''}
            onChange={(e) => updateStyleField('originalPrice', 'fontWeight', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="500"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Color
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={card.styles.originalPrice?.color || '#FFFFFF'}
              onChange={(e) => updateStyleField('originalPrice', 'color', e.target.value)}
              className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={card.styles.originalPrice?.color || ''}
              onChange={(e) => updateStyleField('originalPrice', 'color', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
              placeholder="#FFFFFF"
            />
          </div>
        </div>
      </div>

      {/* Current Price Styles */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Current Price</h4>
        
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Font Size
          </label>
          <input
            type="text"
            value={card.styles.currentPrice?.fontSize || ''}
            onChange={(e) => updateStyleField('currentPrice', 'fontSize', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="16px"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Font Weight
          </label>
          <input
            type="text"
            value={card.styles.currentPrice?.fontWeight || ''}
            onChange={(e) => updateStyleField('currentPrice', 'fontWeight', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="500"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Color
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={card.styles.currentPrice?.color || '#FAF9F6'}
              onChange={(e) => updateStyleField('currentPrice', 'color', e.target.value)}
              className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={card.styles.currentPrice?.color || ''}
              onChange={(e) => updateStyleField('currentPrice', 'color', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
              placeholder="#FAF9F6"
            />
          </div>
        </div>
      </div>

      {/* Rarity Styles */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Rarity</h4>
        
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Background Color
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={card.styles.rarity?.backgroundColor || '#8A2BE2'}
              onChange={(e) => updateStyleField('rarity', 'backgroundColor', e.target.value)}
              className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={card.styles.rarity?.backgroundColor || ''}
              onChange={(e) => updateStyleField('rarity', 'backgroundColor', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
              placeholder="#8A2BE2"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Color
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={card.styles.rarity?.color || '#FFFFFF'}
              onChange={(e) => updateStyleField('rarity', 'color', e.target.value)}
              className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={card.styles.rarity?.color || ''}
              onChange={(e) => updateStyleField('rarity', 'color', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
              placeholder="#FFFFFF"
            />
          </div>
        </div>
      </div>

      {/* Buy Button + Price Block Styles */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Buy Button &amp; Price Block</h4>
        <p className="text-[11px] text-gray-500">
          Price block оформляет текст на кнопке &mdash; все параметры ниже применяются к кнопке целиком.
        </p>

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Background Color
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={card.styles.buyButton?.backgroundColor || '#FF6B35'}
              onChange={(e) => updateStyleField('buyButton', 'backgroundColor', e.target.value)}
              className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={card.styles.buyButton?.backgroundColor || ''}
              onChange={(e) => updateStyleField('buyButton', 'backgroundColor', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
              placeholder="#FF6B35"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Color
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={card.styles.buyButton?.color || '#FFFFFF'}
              onChange={(e) => updateStyleField('buyButton', 'color', e.target.value)}
              className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={card.styles.buyButton?.color || ''}
              onChange={(e) => updateStyleField('buyButton', 'color', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
              placeholder="#FFFFFF"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Border Radius
          </label>
          <input
            type="text"
            value={card.styles.buyButton?.borderRadius || ''}
            onChange={(e) => updateStyleField('buyButton', 'borderRadius', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="8px"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Font Size
          </label>
          <input
            type="text"
            value={card.styles.buyButton?.fontSize || ''}
            onChange={(e) => updateStyleField('buyButton', 'fontSize', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="clamp(12px, 4cqw, 18px)"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Font Weight
          </label>
          <input
            type="text"
            value={card.styles.buyButton?.fontWeight || ''}
            onChange={(e) => updateStyleField('buyButton', 'fontWeight', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="bold"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Padding
          </label>
          <input
            type="text"
            value={card.styles.buyButton?.padding || ''}
            onChange={(e) => updateStyleField('buyButton', 'padding', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="12px 8px"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Min Height
          </label>
          <input
            type="text"
            value={card.styles.buyButton?.minHeight || ''}
            onChange={(e) => updateStyleField('buyButton', 'minHeight', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="48px"
          />
        </div>

        <div className="pt-3 border-t border-gray-200">
          <p className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide mb-2">Price Block внутри кнопки</p>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1.5">
                Border Radius
              </label>
              <input
                type="text"
                value={card.styles.priceBlock?.borderRadius || ''}
                onChange={(e) => updateStyleField('priceBlock', 'borderRadius', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="20px"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1.5">
                Padding
              </label>
              <input
                type="text"
                value={card.styles.priceBlock?.padding || ''}
                onChange={(e) => updateStyleField('priceBlock', 'padding', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="16px 12px"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1.5">
                Min Height
              </label>
              <input
                type="text"
                value={card.styles.priceBlock?.minHeight || ''}
                onChange={(e) => updateStyleField('priceBlock', 'minHeight', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="60px"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1.5">
                Alignment
              </label>
              <select
                value={card.styles.priceBlock?.alignment || ''}
                onChange={(e) => updateStyleField('priceBlock', 'alignment', e.target.value as 'left' | 'center' | 'right' | '')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="">Default</option>
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Purchased Badge Styles */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Purchased Badge</h4>
        
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Background Color
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={card.styles.purchasedBadge?.backgroundColor || '#10B981'}
              onChange={(e) => updateStyleField('purchasedBadge', 'backgroundColor', e.target.value)}
              className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={card.styles.purchasedBadge?.backgroundColor || ''}
              onChange={(e) => updateStyleField('purchasedBadge', 'backgroundColor', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
              placeholder="#10B981"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Color
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={card.styles.purchasedBadge?.color || '#FFFFFF'}
              onChange={(e) => updateStyleField('purchasedBadge', 'color', e.target.value)}
              className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={card.styles.purchasedBadge?.color || ''}
              onChange={(e) => updateStyleField('purchasedBadge', 'color', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
              placeholder="#FFFFFF"
            />
          </div>
        </div>
      </div>

      {/* Bonuses Styles */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Bonuses</h4>
        
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            RP Color
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={card.styles.bonuses?.rpColor || '#FBBF24'}
              onChange={(e) => updateStyleField('bonuses', 'rpColor', e.target.value)}
              className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={card.styles.bonuses?.rpColor || ''}
              onChange={(e) => updateStyleField('bonuses', 'rpColor', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
              placeholder="#FBBF24"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            LP Color
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={card.styles.bonuses?.lpColor || '#3B82F6'}
              onChange={(e) => updateStyleField('bonuses', 'lpColor', e.target.value)}
              className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={card.styles.bonuses?.lpColor || ''}
              onChange={(e) => updateStyleField('bonuses', 'lpColor', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
              placeholder="#3B82F6"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Font Size
          </label>
          <input
            type="text"
            value={card.styles.bonuses?.fontSize || ''}
            onChange={(e) => updateStyleField('bonuses', 'fontSize', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="12px"
          />
        </div>
      </div>

      {/* Included Items Styles */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Included Items</h4>
        
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Background Color
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={card.styles.includedItems?.backgroundColor || '#374151'}
              onChange={(e) => updateStyleField('includedItems', 'backgroundColor', e.target.value)}
              className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={card.styles.includedItems?.backgroundColor || ''}
              onChange={(e) => updateStyleField('includedItems', 'backgroundColor', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
              placeholder="#374151"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Item Background Color
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={card.styles.includedItems?.itemBackgroundColor || '#4B5563'}
              onChange={(e) => updateStyleField('includedItems', 'itemBackgroundColor', e.target.value)}
              className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={card.styles.includedItems?.itemBackgroundColor || ''}
              onChange={(e) => updateStyleField('includedItems', 'itemBackgroundColor', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
              placeholder="#4B5563"
            />
          </div>
        </div>
      </div>
    </div>
  );
}


