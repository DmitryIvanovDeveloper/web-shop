"use client";

import { useState, useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import { Badge } from "../atoms/badge";
import type { OfferCardUIConfig } from "../../config/app-config.types";

const HEX_SHORT_REGEX = /^#([0-9a-f]{3})$/i;
const HEX_LONG_REGEX = /^#([0-9a-f]{6})$/i;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function parseOpacityValue(raw?: string): number | undefined {
  if (raw === undefined || raw === null) {
    return undefined;
  }

  const trimmed = `${raw}`.trim();
  if (trimmed === '') {
    return undefined;
  }

  const parsed = Number(trimmed);
  if (Number.isNaN(parsed)) {
    return undefined;
  }

  return clamp(parsed, 0, 1);
}

function expandShortHex(hex: string): string {
  if (!HEX_SHORT_REGEX.test(hex)) {
    return hex;
  }

  const match = HEX_SHORT_REGEX.exec(hex);
  if (!match) {
    return hex;
  }

  const [, value] = match;
  return `#${value
    .split('')
    .map((char) => `${char}${char}`)
    .join('')}`;
}

function convertHexToRgba(hex: string, alpha: number): string {
  const normalizedHex = expandShortHex(hex);
  if (!HEX_LONG_REGEX.test(normalizedHex)) {
    return hex;
  }

  const value = normalizedHex.slice(1);
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function applyOpacityToColor(color: string | undefined, alpha: number | undefined): string | undefined {
  if (!color) {
    return color;
  }

  if (alpha === undefined) {
    return color;
  }

  const clampedAlpha = clamp(alpha, 0, 1);

  if (HEX_SHORT_REGEX.test(color) || HEX_LONG_REGEX.test(color)) {
    return convertHexToRgba(color, clampedAlpha);
  }

  if (/^rgba\(/i.test(color)) {
    const parts = color.replace(/rgba\(|\)/gi, '').split(',');
    if (parts.length >= 4) {
      const [r, g, b] = parts;
      return `rgba(${r.trim()}, ${g.trim()}, ${b.trim()}, ${clampedAlpha})`;
    }
  }

  if (/^rgb\(/i.test(color)) {
    const parts = color.replace(/rgb\(|\)/gi, '').split(',');
    if (parts.length >= 3) {
      const [r, g, b] = parts;
      return `rgba(${r.trim()}, ${g.trim()}, ${b.trim()}, ${clampedAlpha})`;
    }
  }

  return color;
}

type LayoutMode = 'mobile' | 'tablet' | 'desktop';

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const resolveResponsiveValue = <T,>(value: unknown, layout: LayoutMode): T | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (isPlainObject(value)) {
    const record = value as Record<string, unknown>;
    const layoutSpecific = record[layout];
    if (layoutSpecific !== undefined && layoutSpecific !== null) {
      return layoutSpecific as T;
    }
    if (record.desktop !== undefined && record.desktop !== null) {
      return record.desktop as T;
    }
    if (record.default !== undefined && record.default !== null) {
      return record.default as T;
    }
    return undefined;
  }

  return value as T;
};

const pickSpacingForLayout = (
  value: unknown,
  layout: LayoutMode,
  defaults: Record<LayoutMode, string>
): string => {
  const resolved = resolveResponsiveValue<string>(value, layout);
  if (resolved) {
    return resolved;
  }
  return defaults[layout];
};

const detectLayoutMode = (width: number): LayoutMode => {
  if (width < 360) {
    return 'mobile';
  }
  if (width < 720) {
    return 'tablet';
  }
  return 'desktop';
};

// Функция для форматирования countdown как у Pixel Gun (4D 10:36:27)
function formatCountdown(targetDate: Date): string {
  // Проверка на Invalid Date
  if (!targetDate || isNaN(targetDate.getTime())) {
    return '';
  }
  
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();
  
  if (diff <= 0) return 'EXPIRED';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  if (days > 0) {
    return `${days}D ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export interface BuyButtonStyle {
  readonly backgroundColor?: string;
  readonly textColor?: string;
  readonly borderRadius?: string;
  readonly padding?: string;
  readonly fontWeight?: string;
  readonly fontSize?: string;
}

export interface BuyButton {
  readonly text?: string;
  readonly enabled?: boolean;
  readonly style?: BuyButtonStyle;
}

export interface TitleStyle {
  readonly fontSize?: string;
  readonly fontWeight?: string;
  readonly color?: string;
}

export interface OfferCardProps {
  readonly id?: string;
  readonly mainImage?: string;
  readonly mainImageAlt?: string;
  readonly sideImage?: string;
  readonly backgroundImage?: string;
  readonly includedItems?: string[];
  readonly discount?: string;
  readonly playerLimit?: string;
  readonly timer?: Date;
  readonly title?: string;
  readonly description?: string;
  readonly topLabel?: string;
  readonly titleStyle?: TitleStyle;
  readonly rarity?: string;
  readonly originalPrice?: string;
  readonly currentPrice?: string;
  readonly rpBonus?: number;
  readonly lpBonus?: number;
  readonly buyButton?: BuyButton;
  readonly isPurchased?: boolean;
  readonly isLoading?: boolean;
  readonly className?: string;
  readonly style?: CSSProperties;
  readonly onClick?: () => void;
}

export function OfferCard({
  id,
  mainImage = "",
  mainImageAlt = "Product",
  sideImage,
  backgroundImage,
  includedItems = [],
  discount,
  playerLimit,
  timer,
  title = "",
  description,
  topLabel,
  titleStyle,
  rarity,
  originalPrice,
  currentPrice = "",
  rpBonus,
  lpBonus,
  buyButton,
  isPurchased = false,
  isLoading = false,
  className = "",
  style,
  onClick,
}: OfferCardProps): JSX.Element {
  // Стили из app-config.json (загружаются через AppConfigLoadedEvent)
  // ComponentNode формат: styles содержит вложенные секции (container, image, title, etc)
  const [uiConfigNode, setUiConfigNode] = useState<any>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('desktop');
  
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const measureAndSet = () => {
      const width = cardRef.current?.getBoundingClientRect().width ?? window.innerWidth;
      setLayoutMode(detectLayoutMode(width));
    };

    if (cardRef.current && typeof ResizeObserver === 'function') {
      const observer = new ResizeObserver((entries) => {
        const entry = entries[0];
        const width = entry?.contentRect.width ?? entry?.target?.clientWidth ?? 0;
        setLayoutMode(detectLayoutMode(width));
      });

      observer.observe(cardRef.current);
      measureAndSet();

      return () => {
        observer.disconnect();
      };
    }

    measureAndSet();
    window.addEventListener('resize', measureAndSet);

    return () => {
      window.removeEventListener('resize', measureAndSet);
    };
  }, []);
  
  // Живой countdown - обновляется каждую секунду
  const [countdown, setCountdown] = useState<string>('');
  
  // Загружаем стили из window после AppConfigLoadedEvent и обновляем при изменении
  useEffect(() => {
    const loadStyles = () => {
      if (typeof window !== 'undefined' && (window as any).__offerCardStyles) {
        const newStyles = (window as any).__offerCardStyles;
        console.log('[OfferCard] Loading/updating styles from window.__offerCardStyles', {
          cardId: id,
          buyButtonBg: newStyles.styles?.buyButton?.backgroundColor,
          hasStyles: !!newStyles.styles
        });
        setUiConfigNode(newStyles);
      }
    };

    loadStyles();

    // Слушаем событие загрузки конфига
    const handleConfigLoaded = () => {
      console.log('[OfferCard] appConfigLoaded event received, reloading styles', { cardId: id });
      loadStyles();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('appConfigLoaded', handleConfigLoaded);
      return () => window.removeEventListener('appConfigLoaded', handleConfigLoaded);
    }
  }, [id]);
  
  // Применяем стили из ComponentNode формата
  // uiConfigNode.styles содержит вложенные секции (container, image, title, etc)
  // Стили загружаются из window.__offerCardStyles, который устанавливается в page-renderer.tsx
  // Все стили должны приходить из Supabase app_config через UI Builder (БД)
  // Нет fallback значений - если стиль не указан в БД, он не применяется
  const styles = uiConfigNode?.styles || {};
  const responsive = <T,>(value: unknown): T | undefined =>
    resolveResponsiveValue<T>(value, layoutMode);

  const containerBg = responsive<string>(styles.container?.backgroundColor);
  const containerOpacityValue = responsive<string | number>(styles.container?.backgroundOpacity);
  const containerOpacity = parseOpacityValue(
    containerOpacityValue !== undefined ? `${containerOpacityValue}` : undefined
  );
  const containerBackgroundColor = applyOpacityToColor(containerBg, containerOpacity);
  const containerRadius = responsive<string>(styles.container?.borderRadius);
  const containerBlurInput = responsive<string | number>(styles.container?.blurAmount);
  const containerBlurValue =
    typeof containerBlurInput === 'number'
      ? containerBlurInput
      : typeof containerBlurInput === 'string'
        ? Number.parseFloat(containerBlurInput)
        : 0;
  const containerBackdropFilter =
    Number.isFinite(containerBlurValue) && containerBlurValue > 0
      ? `blur(${containerBlurValue}px)`
      : undefined;
  const imageBg = responsive<string>(styles.image?.backgroundColor);
  const imageHeightRaw = responsive<string | number>(styles.image?.height);
  const imageHeight =
    imageHeightRaw ??
    (layoutMode === 'mobile'
      ? '180px'
      : layoutMode === 'tablet'
        ? '220px'
        : '260px');

  const bodyGapRaw = responsive<string | number>(styles.body?.gap);
  const bodyGap =
    bodyGapRaw ??
    (layoutMode === 'mobile' ? '0.75rem' : layoutMode === 'tablet' ? '0.875rem' : '1rem');
  const bodyPadding = pickSpacingForLayout(
    styles.body?.padding ?? styles.container?.padding,
    layoutMode,
    { mobile: '12px', tablet: '14px', desktop: '16px' }
  );

  const topLabelBg = responsive<string>(styles.topLabel?.backgroundColor);
  const topLabelColor = responsive<string>(styles.topLabel?.color);
  const topLabelFontSize = responsive<string | number>(styles.topLabel?.fontSize);
  const topLabelFontWeight = responsive<string | number>(styles.topLabel?.fontWeight);
  const topLabelPadding = responsive<string>(styles.topLabel?.padding);
  const topLabelRadius = responsive<string>(styles.topLabel?.borderRadius);

  const discountBadgeBg = responsive<string>(styles.discountBadge?.backgroundColor);
  const discountBadgeColor = responsive<string>(styles.discountBadge?.color);
  const discountBadgeFontSize = responsive<string | number>(styles.discountBadge?.fontSize);
  const discountBadgeFontWeight = responsive<string | number>(styles.discountBadge?.fontWeight);
  const discountBadgePadding = responsive<string>(styles.discountBadge?.padding);
  const discountBadgeRadius = responsive<string>(styles.discountBadge?.borderRadius);

  const titleFontSize = responsive<string | number>(styles.title?.fontSize);
  const titleFontWeight = responsive<string | number>(styles.title?.fontWeight);
  const titleColor = responsive<string>(styles.title?.color);

  const descriptionFontSize = responsive<string | number>(styles.description?.fontSize);
  const descriptionFontWeight = responsive<string | number>(styles.description?.fontWeight);
  const descriptionColor = responsive<string>(styles.description?.color);
  const descriptionLineHeight = responsive<string | number>(styles.description?.lineHeight);

  const priceBlockRadius = responsive<string>(styles.priceBlock?.borderRadius);
  const priceBlockPadding = responsive<string | number>(styles.priceBlock?.padding);
  const priceBlockMinHeight = responsive<string | number>(styles.priceBlock?.minHeight);
  const priceBlockAlignment = responsive<'center' | 'left' | 'right'>(
    styles.priceBlock?.alignment
  ) ?? styles.priceBlock?.alignment;
  const priceBlockAlignItems =
    priceBlockAlignment === 'center'
      ? 'center'
      : priceBlockAlignment === 'right'
        ? 'flex-end'
        : 'flex-start';
  const priceBlockTextAlign =
    priceBlockAlignment === 'center'
      ? 'center'
      : priceBlockAlignment === 'right'
        ? 'right'
        : 'left';
  const priceBlockJustify =
    priceBlockAlignment === 'center'
      ? 'center'
      : priceBlockAlignment === 'right'
        ? 'flex-end'
        : 'flex-start';

  const originalPriceFontSize = responsive<string | number>(styles.originalPrice?.fontSize);
  const originalPriceFontWeight = responsive<string | number>(styles.originalPrice?.fontWeight);
  const originalPriceColor = responsive<string>(styles.originalPrice?.color);

  const currentPriceFontSize = responsive<string | number>(styles.currentPrice?.fontSize);
  const currentPriceFontWeight = responsive<string | number>(styles.currentPrice?.fontWeight);
  const currentPriceColor = responsive<string>(styles.currentPrice?.color);

  const rarityBg = responsive<string>(styles.rarity?.backgroundColor);
  const rarityColor = responsive<string>(styles.rarity?.color);
  const buyButtonBg = responsive<string>(styles.buyButton?.backgroundColor);
  const buyButtonColor = responsive<string>(styles.buyButton?.color);
  const buyButtonBorderRadius = responsive<string>(styles.buyButton?.borderRadius);
  const buyButtonFontWeight = responsive<string | number>(styles.buyButton?.fontWeight);
  const buyButtonFontSize = responsive<string | number>(styles.buyButton?.fontSize);
  const buyButtonPadding = responsive<string | number>(styles.buyButton?.padding);
  const buyButtonMinHeight = responsive<string | number>(styles.buyButton?.minHeight);
  const purchasedBg = responsive<string>(styles.purchasedBadge?.backgroundColor);
  const purchasedColor = responsive<string>(styles.purchasedBadge?.color);
  const rpColor = responsive<string>(styles.bonuses?.rpColor);
  const lpColor = responsive<string>(styles.bonuses?.lpColor);
  
  // Parse prices for display
  const parsePrice = (price: string | undefined): { value: string; symbol: string } => {
    if (!price) return { value: '', symbol: '' };
    const match = price.match(/^([^$]*)\s*\$?\s*(.*)$/);
    if (match) {
      return { value: match[1].trim(), symbol: match[2] || '$' };
    }
    return { value: price, symbol: '$' };
  };
  
  const originalPriceParsed = parsePrice(originalPrice);
  const currentPriceParsed = parsePrice(currentPrice);
  
  return (
    <div
      ref={cardRef}
      className={`relative overflow-hidden w-full !flex !flex-col ${className}`}
      style={{
        height: '100%',
        ...style
      }}
      onClick={onClick}
    >
      {/* Top Label */}
      {topLabel && (
        <div
          style={{
            backgroundColor: topLabelBg,
            color: topLabelColor,
            fontSize: topLabelFontSize,
            fontWeight: topLabelFontWeight,
            padding: topLabelPadding,
            borderRadius: `${topLabelRadius} ${topLabelRadius} 0 0`,
            width: '100%',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxSizing: 'border-box',
          }}
        >
          {topLabel}
        </div>
      )}
      
      {/* Main Card Container */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          backgroundColor: containerBackgroundColor,
          borderRadius: topLabel ? (containerRadius ? `0 0 ${containerRadius} ${containerRadius}` : undefined) : containerRadius,
          overflow: 'hidden',
          boxSizing: 'border-box',
          backdropFilter: containerBackdropFilter,
          WebkitBackdropFilter: containerBackdropFilter,
        }}
      >
        {/* Image Container with Discount Badge */}
        {mainImage && (
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: imageHeight,
              backgroundColor: imageBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              boxSizing: 'border-box',
            }}
          >
            <img
              src={mainImage}
              alt={mainImageAlt}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: '50% 50%',
              }}
            />
            {/* Discount Badge */}
            {discount && (
              <div
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  backgroundColor: discountBadgeBg,
                  color: discountBadgeColor,
                  fontSize: discountBadgeFontSize,
                  fontWeight: discountBadgeFontWeight,
                  padding: discountBadgePadding,
                  borderRadius: discountBadgeRadius,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {discount}
              </div>
            )}
          </div>
        )}
        
        {/* Card Body */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: bodyGap,
            padding: bodyPadding,
            width: '100%',
          }}
        >
          {/* Title */}
          {title && (
            <div
              style={{
                fontSize: titleFontSize,
                fontWeight: titleFontWeight,
                color: titleColor,
                width: '100%',
              }}
            >
              {title}
            </div>
          )}
          
          {/* Description */}
          {description && (
            <div
              style={{
                fontSize: descriptionFontSize,
                fontWeight: descriptionFontWeight,
                color: descriptionColor,
                lineHeight: descriptionLineHeight,
                width: '100%',
              }}
            >
              {description}
            </div>
          )}
          
          {/* Legacy Rarity Badge (for backward compatibility) - only show if no price block */}
          {rarity && !(originalPrice || currentPrice) && (
            <Badge text={rarity} variant="rarity" style={{ backgroundColor: rarityBg, color: rarityColor }} />
        )}
          
          {/* Buy Button or Purchased Badge */}
          {isPurchased ? (
            <div
              style={{
                width: '100%',
                backgroundColor: purchasedBg,
                color: purchasedColor,
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              PURCHASED
            </div>
          ) : (
            (buyButton?.enabled !== false) && (
            <button
                type="button"
                className="w-full transition-colors hover:opacity-90 cursor-pointer"
                style={{
                  backgroundColor: buyButtonBg,
                  color: buyButtonColor,
                  borderRadius: buyButtonBorderRadius,
                  fontWeight: buyButtonFontWeight,
                  fontSize: buyButtonFontSize,
                  padding: originalPrice || currentPrice ? undefined : buyButtonPadding,
                  minHeight: buyButtonMinHeight,
                  border: 'none',
                  outline: 'none',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onClick) {
                    onClick();
                  }
                }}
                aria-label={buyButton?.text || 'Buy'}
              >
                {(originalPrice || currentPrice) ? (
                  <div
                    style={{
                      borderRadius: priceBlockRadius,
                      padding: priceBlockPadding,
                      minHeight: priceBlockMinHeight,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      width: '100%',
                      alignItems: priceBlockAlignItems,
                    }}
                  >
                    {originalPrice && (
                      <div
                        style={{
                          display: 'flex',
                          gap: '4px',
                          alignItems: 'center',
                          fontSize: originalPriceFontSize,
                          fontWeight: originalPriceFontWeight,
                          color: originalPriceColor,
                          textDecoration: 'line-through',
                          textAlign: priceBlockTextAlign,
                          width: '100%',
                          justifyContent: priceBlockJustify,
                        }}
                      >
                        <span>{originalPriceParsed.value}</span>
                        <span>{originalPriceParsed.symbol}</span>
                      </div>
                    )}
                    {currentPrice && (
                      <div
              style={{
                          display: 'flex',
                          gap: '4px',
                          alignItems: 'center',
                          fontSize: currentPriceFontSize,
                          fontWeight: currentPriceFontWeight,
                          color: currentPriceColor,
                          textAlign: priceBlockTextAlign,
                          width: '100%',
                          justifyContent: priceBlockJustify,
                        }}
                      >
                        <span>{currentPriceParsed.value}</span>
                        <span>{currentPriceParsed.symbol}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  buyButton?.text ?? 'Buy'
                )}
            </button>
            )
          )}
          
          {/* Timer - only show if no price block */}
          {timer && !(originalPrice || currentPrice) && (
            <div style={{ textAlign: 'center' }}>{countdown}</div>
        )}
        </div>
      </div>
    </div>
  );
}