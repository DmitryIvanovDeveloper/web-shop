"use client";

import { useState, useEffect } from "react";
import type { CSSProperties } from "react";
import { Badge } from "../atoms/badge";
import type { OfferCardUIConfig } from "../../config/app-config.types";

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
  // Живой countdown - обновляется каждую секунду
  const [countdown, setCountdown] = useState<string>('');
  
  // Стили из app-config.json (загружаются через AppConfigLoadedEvent)
  // ComponentNode формат: styles содержит вложенные секции (container, image, title, etc)
  const [uiConfigNode, setUiConfigNode] = useState<any>(null);
  
  useEffect(() => {
    if (!timer) return;
    
    const updateCountdown = () => {
      setCountdown(formatCountdown(timer));
    };
    
    updateCountdown(); // Сразу обновляем
    const interval = setInterval(updateCountdown, 1000); // Обновляем каждую секунду
    
    return () => clearInterval(interval);
  }, [timer]);
  
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
  
  // Container styles (only from config/DB)
  const containerBg = styles.container?.backgroundColor;
  const containerRadius = styles.container?.borderRadius;
  const imageBg = styles.image?.backgroundColor;
  const imageHeight = styles.image?.height;
  
  // Top Label styles (only from config/DB)
  const topLabelBg = styles.topLabel?.backgroundColor;
  const topLabelColor = styles.topLabel?.color;
  const topLabelFontSize = styles.topLabel?.fontSize;
  const topLabelFontWeight = styles.topLabel?.fontWeight;
  const topLabelPadding = styles.topLabel?.padding;
  const topLabelRadius = styles.topLabel?.borderRadius;
  
  // Discount Badge styles (only from config/DB)
  const discountBadgeBg = styles.discountBadge?.backgroundColor;
  const discountBadgeColor = styles.discountBadge?.color;
  const discountBadgeFontSize = styles.discountBadge?.fontSize;
  const discountBadgePadding = styles.discountBadge?.padding;
  const discountBadgeRadius = styles.discountBadge?.borderRadius;
  
  // Title styles (only from config/DB)
  const titleFontSize = styles.title?.fontSize;
  const titleFontWeight = styles.title?.fontWeight;
  const titleColor = styles.title?.color;
  
  // Description styles (only from config/DB)
  const descriptionFontSize = styles.description?.fontSize;
  const descriptionFontWeight = styles.description?.fontWeight;
  const descriptionColor = styles.description?.color;
  const descriptionLineHeight = styles.description?.lineHeight;
  
  // Price Block styles (only from config/DB)
  const priceBlockRadius = styles.priceBlock?.borderRadius;
  const priceBlockPadding = styles.priceBlock?.padding;
  const priceBlockMinHeight = styles.priceBlock?.minHeight;
  const priceBlockAlignment = styles.priceBlock?.alignment;
  const priceBlockAlignItems = priceBlockAlignment === 'center'
    ? 'center'
    : priceBlockAlignment === 'right'
      ? 'flex-end'
      : 'flex-start';
  const priceBlockTextAlign = priceBlockAlignment === 'center'
    ? 'center'
    : priceBlockAlignment === 'right'
      ? 'right'
      : 'left';
  const priceBlockJustify = priceBlockAlignment === 'center'
    ? 'center'
    : priceBlockAlignment === 'right'
      ? 'flex-end'
      : 'flex-start';
  
  // Original Price styles (only from config/DB)
  const originalPriceFontSize = styles.originalPrice?.fontSize;
  const originalPriceColor = styles.originalPrice?.color;
  
  // Current Price styles (only from config/DB)
  const currentPriceFontSize = styles.currentPrice?.fontSize;
  const currentPriceColor = styles.currentPrice?.color;
  
  // Legacy styles (only from config/DB)
  const rarityBg = styles.rarity?.backgroundColor;
  const rarityColor = styles.rarity?.color;
  const buyButtonBg = styles.buyButton?.backgroundColor;
  const buyButtonColor = styles.buyButton?.color;
  const purchasedBg = styles.purchasedBadge?.backgroundColor;
  const rpColor = styles.bonuses?.rpColor;
  const lpColor = styles.bonuses?.lpColor;
  
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
          backgroundColor: containerBg,
          borderRadius: topLabel ? (containerRadius ? `0 0 ${containerRadius} ${containerRadius}` : undefined) : containerRadius,
          overflow: 'hidden',
          boxSizing: 'border-box',
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
                  fontWeight: styles.discountBadge?.fontWeight,
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
            gap: '12px',
            padding: '16px',
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
                color: styles.purchasedBadge?.color,
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
                  borderRadius: styles.buyButton?.borderRadius,
                  fontWeight: styles.buyButton?.fontWeight,
                  fontSize: styles.buyButton?.fontSize,
                  padding: originalPrice || currentPrice ? undefined : styles.buyButton?.padding,
                  minHeight: styles.buyButton?.minHeight,
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
                          fontWeight: styles.originalPrice?.fontWeight,
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
                          fontWeight: styles.currentPrice?.fontWeight,
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