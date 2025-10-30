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
  
  // Загружаем стили из window после AppConfigLoadedEvent
  useEffect(() => {
    const loadStyles = () => {
      if (typeof window !== 'undefined' && (window as any).__offerCardStyles) {
        setUiConfigNode((window as any).__offerCardStyles);
      }
    };

    loadStyles();

    // Слушаем событие загрузки конфига
    const handleConfigLoaded = () => {
      loadStyles();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('appConfigLoaded', handleConfigLoaded);
      return () => window.removeEventListener('appConfigLoaded', handleConfigLoaded);
    }
  }, []);
  
  // Применяем стили из ComponentNode формата с fallback на хардкод
  // uiConfigNode.styles содержит вложенные секции (container, image, title, etc)
  const styles = uiConfigNode?.styles || {};
  const containerBg = styles.container?.backgroundColor || '#1F2937';
  const containerRadius = styles.container?.borderRadius || '8px';
  const imageBg = styles.image?.backgroundColor || '#374151';
  const titleFontSize = styles.title?.fontSize || 'clamp(10px, 4cqw, 18px)';
  const titleColor = styles.title?.color || '#FFFFFF';
  const rarityBg = styles.rarity?.backgroundColor || '#8A2BE2';
  const rarityColor = styles.rarity?.color || '#FFFFFF';
  const buyButtonBg = styles.buyButton?.backgroundColor || '#FF6B35';
  const buyButtonColor = styles.buyButton?.color || '#FFFFFF';
  const purchasedBg = styles.purchasedBadge?.backgroundColor || '#10B981';
  const rpColor = styles.bonuses?.rpColor || '#FBBF24';
  const lpColor = styles.bonuses?.lpColor || '#3B82F6';
  
  // Simplified, safe JSX to avoid unclosed tag issues during build
  return (
    <div
      className={`relative overflow-hidden w-full ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: containerBg,
        borderRadius: containerRadius,
        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        ...style
      }}
      onClick={onClick}
    >
      <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {title && (
          <h3 style={{ color: titleColor, fontSize: titleFontSize, fontWeight: 'bold', textAlign: 'center' }}>{title}</h3>
        )}
        {mainImage && (
          <div style={{ position: 'relative', width: '100%', aspectRatio: '3 / 2', backgroundColor: imageBg }}>
            <img src={mainImage} alt={mainImageAlt} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
        )}
            {rarity && (
          <Badge text={rarity} variant="rarity" style={{ backgroundColor: rarityBg, color: rarityColor, padding: '4px 8px' }} />
        )}
          {isPurchased ? (
            <div
              style={{
                width: '100%',
              backgroundColor: purchasedBg,
              color: '#FFFFFF',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '14px',
                padding: '12px 8px',
                minHeight: '48px',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              PURCHASED
            </div>
          ) : (
            buyButton && buyButton.enabled && (
            <button
              className="w-full transition-colors hover:opacity-90"
              style={{
                backgroundColor: buyButton.style?.backgroundColor || buyButtonBg,
                color: buyButton.style?.textColor || buyButtonColor,
                borderRadius: buyButton.style?.borderRadius || '8px',
                fontWeight: buyButton.style?.fontWeight || 'bold',
                fontSize: buyButton.style?.fontSize || '14px',
                padding: buyButton.style?.padding || '12px 8px',
                minHeight: '48px'
              }}
            >
              {buyButton.text ?? 'Buy'}
            </button>
            )
          )}
        {timer && (
          <div style={{ color: '#A0A0A0', fontSize: 12, textAlign: 'center' }}>{countdown}</div>
        )}
      </div>
    </div>
  );
}