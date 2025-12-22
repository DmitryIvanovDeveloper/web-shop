'use client';

import React from 'react';
import { ButtonEditor } from './ButtonEditor';
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
  // Button / Purchased toggle: derive initial from buyButton.enabled
  const initialButtonMode: 'buy' | 'purchased' =
    card.styles.buyButton && (card.styles.buyButton as any).enabled === false
      ? 'purchased'
      : (card.styles.purchasedBadge && (card.styles.purchasedBadge as any).enabled === true)
      ? 'purchased'
      : 'buy';
  const [buttonMode, setButtonMode] = React.useState<'buy' | 'purchased'>(initialButtonMode);

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

  const handleContainerOpacityChange = (nextValue: string): void => {
    const normalized = nextValue.trim();
    if (normalized === '') {
      updateStyleField('container', 'backgroundOpacity', '');
      return;
    }

    const numeric = Number(normalized);
    if (Number.isNaN(numeric)) {
      return;
    }

    const clamped = Math.min(Math.max(numeric, 0), 1);
    updateStyleField('container', 'backgroundOpacity', clamped.toString());
  };

  const handleContainerBlurChange = (nextValue: string): void => {
    const normalized = nextValue.trim();
    if (normalized === '') {
      updateStyleField('container', 'blurAmount', '');
      return;
    }

    const numeric = Number(normalized);
    if (Number.isNaN(numeric)) {
      return;
    }

    const clamped = Math.max(numeric, 0);
    updateStyleField('container', 'blurAmount', clamped.toString());
  };

  // Helpers for padding input with value + unit
  const parsePadding = (padding: string | number | undefined): { value: string; unit: 'px' | 'rem' } => {
    if (padding === undefined || padding === null || padding === '') {
      return { value: '', unit: 'px' };
    }

    const str = typeof padding === 'number' ? `${padding}px` : padding.toString().trim();
    const match = str.match(/^([\d.,]+)\s*(px|rem)$/i);
    if (match) {
      return { value: match[1], unit: match[2].toLowerCase() as 'px' | 'rem' };
    }

    // fallback: try to extract numeric part, default px
    const numericMatch = str.match(/([\d.,]+)/);
    return {
      value: numericMatch ? numericMatch[1] : '',
      unit: 'px',
    };
  };

  const buildPadding = (value: string, unit: 'px' | 'rem'): string => {
    const normalized = value.trim();
    if (!normalized) {
      return '';
    }
    const numeric = normalized.replace(',', '.');
    return `${numeric}${unit}`;
  };

  // Generic size helpers (px / rem)
  const parseSize = (
    size: string | number | undefined,
    defaultUnit: 'px' | 'rem' = 'px'
  ): { value: string; unit: 'px' | 'rem' } => {
    if (size === undefined || size === null || size === '') {
      return { value: '', unit: defaultUnit };
    }
    const str = typeof size === 'number' ? `${size}${defaultUnit}` : size.toString().trim();
    const match = str.match(/^([\d.,]+)\s*(px|rem)?$/i);
    if (match) {
      return {
        value: match[1],
        unit: (match[2]?.toLowerCase() as 'px' | 'rem') || defaultUnit,
      };
    }
    const numericMatch = str.match(/([\d.,]+)/);
    return {
      value: numericMatch ? numericMatch[1] : '',
      unit: defaultUnit,
    };
  };

  const buildSize = (value: string, unit: 'px' | 'rem'): string => {
    const normalized = value.trim();
    if (!normalized) return '';
    return `${normalized.replace(',', '.')}${unit}`;
  };

  const buildNumberString = (value: string): string => {
    const normalized = value.trim();
    if (!normalized) return '';
    return normalized.replace(',', '.');
  };

  const containerOpacityRaw = card.styles.container?.backgroundOpacity;
  const containerOpacitySliderValue = (() => {
    if (typeof containerOpacityRaw !== 'string' || containerOpacityRaw.trim() === '') {
      return 1;
    }
    const numeric = Number(containerOpacityRaw);
    if (Number.isNaN(numeric)) {
      return 1;
    }
    return Math.min(Math.max(numeric, 0), 1);
  })();

  const containerBlurRaw = card.styles.container?.blurAmount;
  const containerBlurSliderValue = (() => {
    if (typeof containerBlurRaw !== 'string' || containerBlurRaw.trim() === '') {
      return 0;
    }
    const numeric = Number(containerBlurRaw);
    if (Number.isNaN(numeric)) {
      return 0;
    }
    return Math.max(numeric, 0);
  })();

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
            Background Opacity
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={containerOpacitySliderValue}
              onChange={(e) => handleContainerOpacityChange(e.target.value)}
              className="flex-1"
            />
            <input
              type="number"
              min="0"
              max="1"
              step="0.05"
              value={containerOpacityRaw ?? ''}
              onChange={(e) => handleContainerOpacityChange(e.target.value)}
              className="w-20 px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs text-right"
              placeholder="1"
            />
            {typeof containerOpacityRaw === 'string' && containerOpacityRaw.trim() !== '' && (
              <button
                type="button"
                onClick={() => handleContainerOpacityChange('')}
                className="px-2 py-1 text-xs text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Reset
              </button>
            )}
          </div>
          <p className="text-[10px] text-gray-500 mt-1">
            Значение от 0 (полностью прозрачный) до 1 (непрозрачный). По умолчанию 1.
          </p>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Background Blur (px)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="50"
              step="1"
              value={containerBlurSliderValue}
              onChange={(e) => handleContainerBlurChange(e.target.value)}
              className="flex-1"
            />
            <input
              type="number"
              min="0"
              max="200"
              step="1"
              value={containerBlurRaw ?? ''}
              onChange={(e) => handleContainerBlurChange(e.target.value)}
              className="w-24 px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs text-right"
              placeholder="0"
            />
            {containerBlurSliderValue > 0 && (
              <button
                type="button"
                onClick={() => handleContainerBlurChange('0')}
                className="px-2 py-1 text-xs text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Reset
              </button>
            )}
          </div>
          <p className="text-[10px] text-gray-500 mt-1">
            Применяет CSS backdrop-filter: blur(...) только к фону карточки. Контент внутри остаётся чётким. Значение 0 отключает эффект.
          </p>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Border Radius
          </label>
          {(() => {
            const { value, unit } = parseSize(card.styles.container?.borderRadius);
            return (
              <div className="flex gap-2">
          <input
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  value={value}
                  onChange={(e) => updateStyleField('container', 'borderRadius', buildSize(e.target.value, unit))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="8"
                />
                <select
                  value={unit}
                  onChange={(e) => updateStyleField('container', 'borderRadius', buildSize(value, e.target.value as 'px' | 'rem'))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="px">px</option>
                  <option value="rem">rem</option>
                </select>
              </div>
            );
          })()}
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
            Border Radius
          </label>
          {(() => {
            const { value, unit } = parseSize(card.styles.purchasedBadge?.borderRadius);
            return (
              <div className="flex gap-2">
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  value={value}
                  onChange={(e) => updateStyleField('purchasedBadge', 'borderRadius', buildSize(e.target.value, unit))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus-border-transparent text-sm"
                  placeholder="8"
                />
                <select
                  value={unit}
                  onChange={(e) => updateStyleField('purchasedBadge', 'borderRadius', buildSize(value, e.target.value as 'px' | 'rem'))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus-border-transparent text-sm"
                >
                  <option value="px">px</option>
                  <option value="rem">rem</option>
                </select>
              </div>
            );
          })()}
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Font Size
          </label>
          {(() => {
            const { value, unit } = parseSize(card.styles.topLabel?.fontSize);
            return (
              <div className="flex gap-2">
          <input
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  value={value}
                  onChange={(e) => updateStyleField('topLabel', 'fontSize', buildSize(e.target.value, unit))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="12"
                />
                <select
                  value={unit}
                  onChange={(e) => updateStyleField('topLabel', 'fontSize', buildSize(value, e.target.value as 'px' | 'rem'))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="px">px</option>
                  <option value="rem">rem</option>
                </select>
              </div>
            );
          })()}
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Font Weight
          </label>
          <input
            type="number"
            inputMode="decimal"
            step="10"
            value={card.styles.topLabel?.fontWeight ?? ''}
            onChange={(e) => updateStyleField('topLabel', 'fontWeight', buildNumberString(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="600"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Padding
          </label>
          {(() => {
            const { value, unit } = parsePadding(card.styles.topLabel?.padding);
            return (
              <div className="flex gap-2">
          <input
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  value={value}
                  onChange={(e) => updateStyleField('topLabel', 'padding', buildPadding(e.target.value, unit))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="32.7"
                />
                <select
                  value={unit}
                  onChange={(e) => updateStyleField('topLabel', 'padding', buildPadding(value, e.target.value as 'px' | 'rem'))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="px">px</option>
                  <option value="rem">rem</option>
                </select>
              </div>
            );
          })()}
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Border Radius
          </label>
          {(() => {
            const { value, unit } = parseSize(card.styles.topLabel?.borderRadius);
            return (
              <div className="flex gap-2">
          <input
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  value={value}
                  onChange={(e) => updateStyleField('topLabel', 'borderRadius', buildSize(e.target.value, unit))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="20"
                />
                <select
                  value={unit}
                  onChange={(e) => updateStyleField('topLabel', 'borderRadius', buildSize(value, e.target.value as 'px' | 'rem'))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="px">px</option>
                  <option value="rem">rem</option>
                </select>
              </div>
            );
          })()}
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
          {(() => {
            const { value, unit } = parseSize(card.styles.discountBadge?.fontSize);
            return (
              <div className="flex gap-2">
          <input
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  value={value}
                  onChange={(e) => updateStyleField('discountBadge', 'fontSize', buildSize(e.target.value, unit))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="12"
                />
                <select
                  value={unit}
                  onChange={(e) => updateStyleField('discountBadge', 'fontSize', buildSize(value, e.target.value as 'px' | 'rem'))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="px">px</option>
                  <option value="rem">rem</option>
                </select>
              </div>
            );
          })()}
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Font Weight
          </label>
          <input
            type="number"
            inputMode="decimal"
            step="10"
            value={card.styles.discountBadge?.fontWeight ?? ''}
            onChange={(e) => updateStyleField('discountBadge', 'fontWeight', buildNumberString(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="500"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Padding
          </label>
          {(() => {
            const { value, unit } = parsePadding(card.styles.discountBadge?.padding);
            return (
              <div className="flex gap-2">
          <input
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  value={value}
                  onChange={(e) => updateStyleField('discountBadge', 'padding', buildPadding(e.target.value, unit))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="32.7"
                />
                <select
                  value={unit}
                  onChange={(e) => updateStyleField('discountBadge', 'padding', buildPadding(value, e.target.value as 'px' | 'rem'))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="px">px</option>
                  <option value="rem">rem</option>
                </select>
              </div>
            );
          })()}
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Border Radius
          </label>
          {(() => {
            const { value, unit } = parseSize(card.styles.discountBadge?.borderRadius);
            return (
              <div className="flex gap-2">
          <input
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  value={value}
                  onChange={(e) => updateStyleField('discountBadge', 'borderRadius', buildSize(e.target.value, unit))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="20"
                />
                <select
                  value={unit}
                  onChange={(e) => updateStyleField('discountBadge', 'borderRadius', buildSize(value, e.target.value as 'px' | 'rem'))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="px">px</option>
                  <option value="rem">rem</option>
                </select>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Title Styles */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Title</h4>
        
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Font Size
          </label>
          {(() => {
            const { value, unit } = parseSize(card.styles.title?.fontSize);
            return (
              <div className="flex gap-2">
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  value={value}
                  onChange={(e) => updateStyleField('title', 'fontSize', buildSize(e.target.value, unit))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="18"
                />
                <select
                  value={unit}
                  onChange={(e) => updateStyleField('title', 'fontSize', buildSize(value, e.target.value as 'px' | 'rem'))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="px">px</option>
                  <option value="rem">rem</option>
                </select>
              </div>
            );
          })()}
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Font Weight
          </label>
          <input
            type="number"
            inputMode="decimal"
            step="10"
            value={card.styles.title?.fontWeight ?? ''}
            onChange={(e) => updateStyleField('title', 'fontWeight', buildNumberString(e.target.value))}
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
          {(() => {
            const { value, unit } = parseSize(card.styles.description?.fontSize);
            return (
              <div className="flex gap-2">
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  value={value}
                  onChange={(e) => updateStyleField('description', 'fontSize', buildSize(e.target.value, unit))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="16"
                />
                <select
                  value={unit}
                  onChange={(e) => updateStyleField('description', 'fontSize', buildSize(value, e.target.value as 'px' | 'rem'))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="px">px</option>
                  <option value="rem">rem</option>
                </select>
              </div>
            );
          })()}
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Font Weight
          </label>
          <input
            type="number"
            inputMode="decimal"
            step="10"
            value={card.styles.description?.fontWeight ?? ''}
            onChange={(e) => updateStyleField('description', 'fontWeight', buildNumberString(e.target.value))}
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
          {(() => {
            const { value, unit } = parseSize(card.styles.description?.lineHeight);
            return (
              <div className="flex gap-2">
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  value={value}
                  onChange={(e) => updateStyleField('description', 'lineHeight', buildSize(e.target.value, unit))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="23"
                />
                <select
                  value={unit}
                  onChange={(e) => updateStyleField('description', 'lineHeight', buildSize(value, e.target.value as 'px' | 'rem'))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="px">px</option>
                  <option value="rem">rem</option>
                </select>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Original Price Styles */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Original Price</h4>

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Show Original Price
          </label>
          <input
            type="checkbox"
            checked={card.styles.originalPrice?.show !== false}
            onChange={(e) => updateStyleField('originalPrice', 'show', e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
          />
          <p className="text-[10px] text-gray-500 mt-1">
            Show/hide the crossed-out original price in the price block
          </p>
        </div>
        
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Font Size
          </label>
          {(() => {
            const { value, unit } = parseSize(card.styles.originalPrice?.fontSize);
            return (
              <div className="flex gap-2">
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  value={value}
                  onChange={(e) => updateStyleField('originalPrice', 'fontSize', buildSize(e.target.value, unit))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="16"
                />
                <select
                  value={unit}
                  onChange={(e) => updateStyleField('originalPrice', 'fontSize', buildSize(value, e.target.value as 'px' | 'rem'))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="px">px</option>
                  <option value="rem">rem</option>
                </select>
              </div>
            );
          })()}
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Font Weight
          </label>
          <input
            type="number"
            inputMode="decimal"
            step="10"
            value={card.styles.originalPrice?.fontWeight ?? ''}
            onChange={(e) => updateStyleField('originalPrice', 'fontWeight', buildNumberString(e.target.value))}
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
          {(() => {
            const { value, unit } = parseSize(card.styles.currentPrice?.fontSize);
            return (
              <div className="flex gap-2">
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  value={value}
                  onChange={(e) => updateStyleField('currentPrice', 'fontSize', buildSize(e.target.value, unit))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="16"
                />
                <select
                  value={unit}
                  onChange={(e) => updateStyleField('currentPrice', 'fontSize', buildSize(value, e.target.value as 'px' | 'rem'))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="px">px</option>
                  <option value="rem">rem</option>
                </select>
              </div>
            );
          })()}
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Font Weight
          </label>
          <input
            type="number"
            inputMode="decimal"
            step="10"
            value={card.styles.currentPrice?.fontWeight ?? ''}
            onChange={(e) => updateStyleField('currentPrice', 'fontWeight', buildNumberString(e.target.value))}
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

      {/* Action State: Buy vs Purchased */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Action State</h4>
          <div className="inline-flex rounded-md border border-gray-200 overflow-hidden text-xs">
            <button
              type="button"
              onClick={() => {
                setButtonMode('buy');
                // Ensure buy button is enabled when switching to Buy
                updateStyles({
                  buyButton: {
                    ...(card.styles.buyButton || {}),
                    enabled: true,
                  }
                  ,
                  purchasedBadge: {
                    ...(card.styles.purchasedBadge || {}),
                    enabled: false,
                  }
                });
              }}
              className={`px-3 py-1.5 ${buttonMode === 'buy' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              Buy Button
            </button>
            <button
              type="button"
              onClick={() => {
                setButtonMode('purchased');
                // Disable buy button when purchased to force preview state
                updateStyles({
                  buyButton: {
                    ...(card.styles.buyButton || {}),
                    enabled: false,
                  }
                  ,
                  purchasedBadge: {
                    ...(card.styles.purchasedBadge || {}),
                    enabled: true,
                  }
                });
              }}
              className={`px-3 py-1.5 border-l border-gray-200 ${buttonMode === 'purchased' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              Purchased Badge
            </button>
          </div>
        </div>

        {buttonMode === 'buy' && (
          <>
            <p className="text-[11px] text-gray-500">
              Price block оформляет текст на кнопке &mdash; все параметры ниже применяются к кнопке целиком.
            </p>

            <ButtonEditor
              backgroundColor={card.styles.buyButton?.backgroundColor || '#FF6B35'}
              textColor={card.styles.buyButton?.color || '#FFFFFF'}
              borderColor={card.styles.buyButton?.borderColor || '#FF6B35'}
              onColorChange={(colorKey, value) => {
                if (colorKey === 'textColor') {
                  updateStyleField('buyButton', 'color', value);
                } else {
                  updateStyleField('buyButton', colorKey, value);
                }
              }}
              label={card.buyButtonLabel || 'Buy Now'}
              onLabelChange={(value) => {
                // For now, we'll store this in card object, but it could be moved to styles later
                onUpdate({ ...card, buyButtonLabel: value });
              }}
              borderRadius={card.styles.buyButton?.borderRadius}
              onBorderRadiusChange={(value) => updateStyleField('buyButton', 'borderRadius', value)}
              padding={card.styles.buyButton?.padding}
              onPaddingChange={(value) => updateStyleField('buyButton', 'padding', value)}
              width="100%"
              onWidthChange={() => {}} // Fixed width for offer card buttons
              maxHeight={card.styles.buyButton?.maxHeight}
              onMaxHeightChange={(value) => updateStyleField('buyButton', 'maxHeight', value)}
              fontSize={card.styles.buyButton?.fontSize}
              onFontSizeChange={(value) => updateStyleField('buyButton', 'fontSize', value)}
              fontWeight={card.styles.buyButton?.fontWeight}
              onFontWeightChange={(value) => updateStyleField('buyButton', 'fontWeight', value)}
              minHeight={card.styles.buyButton?.minHeight}
              onMinHeightChange={(value) => updateStyleField('buyButton', 'minHeight', value)}
            />

          </>
        )}

        {buttonMode === 'purchased' && (
          <div className="space-y-3">
            <p className="text-[11px] text-gray-500">
              Purchased Badge отображается вместо кнопки, когда товар уже куплен.
            </p>

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

            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1.5">
                Border Radius
              </label>
              {(() => {
                const { value, unit } = parseSize(card.styles.purchasedBadge?.borderRadius);
                return (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.1"
                      value={value}
                      onChange={(e) => updateStyleField('purchasedBadge', 'borderRadius', buildSize(e.target.value, unit))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="8"
                    />
                    <select
                      value={unit}
                      onChange={(e) => updateStyleField('purchasedBadge', 'borderRadius', buildSize(value, e.target.value as 'px' | 'rem'))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      <option value="px">px</option>
                      <option value="rem">rem</option>
                    </select>
                  </div>
                );
              })()}
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1.5">
                Padding
              </label>
              {(() => {
                const { value, unit } = parsePadding(card.styles.purchasedBadge?.padding);
                return (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.1"
                      value={value}
                      onChange={(e) => updateStyleField('purchasedBadge', 'padding', buildPadding(e.target.value, unit))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="12"
                    />
                    <select
                      value={unit}
                      onChange={(e) => updateStyleField('purchasedBadge', 'padding', buildPadding(value, e.target.value as 'px' | 'rem'))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      <option value="px">px</option>
                      <option value="rem">rem</option>
                    </select>
                  </div>
                );
              })()}
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1.5">
                Min Height
              </label>
              {(() => {
                const { value, unit } = parseSize(card.styles.purchasedBadge?.minHeight);
                return (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.1"
                      value={value}
                      onChange={(e) => updateStyleField('purchasedBadge', 'minHeight', buildSize(e.target.value, unit))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="44"
                    />
                    <select
                      value={unit}
                      onChange={(e) => updateStyleField('purchasedBadge', 'minHeight', buildSize(value, e.target.value as 'px' | 'rem'))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      <option value="px">px</option>
                      <option value="rem">rem</option>
                    </select>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
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

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Border Radius
          </label>
          {(() => {
            const { value, unit } = parseSize(card.styles.purchasedBadge?.borderRadius);
            return (
              <div className="flex gap-2">
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  value={value}
                  onChange={(e) => updateStyleField('purchasedBadge', 'borderRadius', buildSize(e.target.value, unit))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-sm"
                  placeholder="8"
                />
                <select
                  value={unit}
                  onChange={(e) => updateStyleField('purchasedBadge', 'borderRadius', buildSize(value, e.target.value as 'px' | 'rem'))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus-border-transparent text-sm"
                >
                  <option value="px">px</option>
                  <option value="rem">rem</option>
                </select>
              </div>
            );
          })()}
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Padding
          </label>
          {(() => {
            const { value, unit } = parsePadding(card.styles.purchasedBadge?.padding);
            return (
              <div className="flex gap-2">
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  value={value}
                  onChange={(e) => updateStyleField('purchasedBadge', 'padding', buildPadding(e.target.value, unit))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="12"
                />
                <select
                  value={unit}
                  onChange={(e) => updateStyleField('purchasedBadge', 'padding', buildPadding(value, e.target.value as 'px' | 'rem'))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus-border-transparent text-sm"
                >
                  <option value="px">px</option>
                  <option value="rem">rem</option>
                </select>
              </div>
            );
          })()}
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">
            Min Height
          </label>
          {(() => {
            const { value, unit } = parseSize(card.styles.purchasedBadge?.minHeight);
            return (
              <div className="flex gap-2">
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  value={value}
                  onChange={(e) => updateStyleField('purchasedBadge', 'minHeight', buildSize(e.target.value, unit))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus-border-transparent text-sm"
                  placeholder="44"
                />
                <select
                  value={unit}
                  onChange={(e) => updateStyleField('purchasedBadge', 'minHeight', buildSize(value, e.target.value as 'px' | 'rem'))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus-border-transparent text-sm"
                >
                  <option value="px">px</option>
                  <option value="rem">rem</option>
                </select>
              </div>
            );
          })()}
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
          {(() => {
            const { value, unit } = parseSize(card.styles.bonuses?.fontSize);
            return (
              <div className="flex gap-2">
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  value={value}
                  onChange={(e) => updateStyleField('bonuses', 'fontSize', buildSize(e.target.value, unit))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="12"
                />
                <select
                  value={unit}
                  onChange={(e) => updateStyleField('bonuses', 'fontSize', buildSize(value, e.target.value as 'px' | 'rem'))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="px">px</option>
                  <option value="rem">rem</option>
                </select>
              </div>
            );
          })()}
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




