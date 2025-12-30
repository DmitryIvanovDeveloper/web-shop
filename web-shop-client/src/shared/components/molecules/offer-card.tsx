"use client";

import { useState, useEffect } from "react";
import type { CSSProperties } from "react";
import { Badge } from "../atoms/badge";
// import type { OfferCardUIConfig } from "../../config/app-config.types";

export interface BuyButtonStyle {
  readonly backgroundColor?: string;
  readonly textColor?: string;
  readonly borderRadius?: string;
  readonly padding?: string;
  readonly fontWeight?: string;
}

export interface BuyButton {
  readonly text?: string;
  readonly enabled?: boolean;
  readonly style?: BuyButtonStyle;
}

export interface OfferCardProps {
  readonly id?: string;
  readonly mainImage?: string;
  readonly mainImageAlt?: string;
  readonly sideImage?: string;
  readonly includedItems?: string[];
  readonly discount?: string;
  readonly playerLimit?: string;
  readonly timer?: string;
  readonly title?: string;
  readonly rarity?: string;
  readonly originalPrice?: string;
  readonly currentPrice?: string;
  readonly rpBonus?: number;
  readonly lpBonus?: number;
  readonly isPurchased?: boolean;
  readonly isLoading?: boolean;
  readonly buyButton?: BuyButton;
  readonly className?: string;
  readonly style?: CSSProperties;
  readonly onClick?: () => void;
}

export function OfferCard({
  mainImage = "",
  mainImageAlt = "Product",
  sideImage,
  includedItems = [],
  discount,
  playerLimit,
  timer,
  title = "",
  rarity,
  originalPrice,
  currentPrice,
  rpBonus,
  lpBonus,
  isPurchased = false,
  isLoading = false,
  buyButton,
  className = "",
  style,
  onClick
}: OfferCardProps): JSX.Element {
  // State for dynamic styles from config
  const [cardStyles, setCardStyles] = useState<any>(null);

  // Load styles from window.__offerCardStyles when component mounts or config updates
  useEffect(() => {
    const updateStyles = () => {
      if (typeof window !== 'undefined' && (window as any).__offerCardStyles?.styles) {
        setCardStyles((window as any).__offerCardStyles.styles);
      }
    };

    // Initial load
    updateStyles();

    // Listen for config updates
    window.addEventListener('appConfigLoaded', updateStyles);
    return () => window.removeEventListener('appConfigLoaded', updateStyles);
  }, []);

  return (
    <div
      className={`relative bg-gray-800 rounded-lg overflow-hidden shadow-lg w-full ${className}`}
      style={{
        backgroundColor: cardStyles?.container?.backgroundColor,
        borderRadius: cardStyles?.container?.borderRadius,
        height: '100%', // Фиксированная высота как у skeleton
        display: 'flex',
        flexDirection: 'column',
        containerType: 'inline-size', // Для container queries
        ...style
      }}
      onClick={onClick}
    >
      {/* Discount Badge */}
      {discount && (
        <Badge
          text={discount}
          variant="discount"
          className="absolute top-2 left-2 z-10"
          style={{
            backgroundColor: cardStyles?.discountBadge?.backgroundColor || "#FF4500",
            color: cardStyles?.discountBadge?.color || "white"
          }}
        />
      )}

      {/* Player Limit Badge */}
      {playerLimit && (
        <Badge
          text={playerLimit}
          variant="limit"
          className="absolute top-2 right-2 z-10"
          style={{
            backgroundColor: cardStyles?.playerLimitBadge?.backgroundColor || "#4169E1",
            color: cardStyles?.playerLimitBadge?.color || "white"
          }}
        />
      )}

      {/* Timer Badge */}
      {timer && (
        <Badge
          text={typeof timer === 'string' ? timer : String(timer)}
          variant="timer"
          className="absolute bottom-2 left-2 z-10"
          style={{
            backgroundColor: cardStyles?.timerBadge?.backgroundColor || "#FFD700",
            color: cardStyles?.timerBadge?.color || "black"
          }}
        />
      )}

      {/* Main Image Section */}
      <div
        className="relative w-full h-48 bg-gray-700 flex items-center justify-center"
        style={{
          backgroundColor: cardStyles?.image?.backgroundColor,
          aspectRatio: cardStyles?.image?.aspectRatio
        }}
      >
        {mainImage && (
          <img
            src={mainImage}
            alt={mainImageAlt}
            className="object-cover w-full h-full"
          />
        )}
      </div>

      {/* Content Section - CSS Grid как у skeleton */}
      <div
        className="p-2 sm:p-3 md:p-4 grid w-full"
        style={{
          display: 'grid',
          gridTemplateRows: 'auto auto 1fr auto', // Row 1: title, Row 2: rarity space, Row 3: spacer, Row 4: button
          gap: '8px',
          height: '100%', // Использовать всю доступную высоту
          alignContent: 'start'
        }}
      >
        {/* Row 1: Title - фиксированная высота как у skeleton */}
        <div className="flex flex-col" style={{
          minHeight: '44px',
          maxHeight: '44px', // Ограничить максимальную высоту
          overflow: 'hidden' // Скрыть переполнение
        }}>
          {title && (
            <h3
              className="text-white text-lg font-bold truncate"
              style={{
                fontSize: cardStyles?.title?.fontSize,
                fontWeight: cardStyles?.title?.fontWeight,
                color: cardStyles?.title?.color,
                lineHeight: '1.2', // Фиксированная высота строки
                display: '-webkit-box',
                WebkitLineClamp: 2, // Максимум 2 строки
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {title}
            </h3>
          )}
        </div>

        {/* Row 2: Rarity space - пустое пространство как у skeleton */}
        <div className="flex flex-col" style={{
          minHeight: '36px' // Фиксированная высота как у skeleton
        }}>
          {/* Пустое пространство для будущих rarity бейджей */}
        </div>

        {/* Row 3: Spacer - растягивается автоматически */}
        <div></div>

        {/* Row 4: Buy Button или Purchased Badge - всегда внизу */}
        <div>
          {isPurchased ? (
            // PURCHASED Badge (использует те же стили что и кнопка, кроме backgroundColor)
            <div
              className="w-full py-3 px-4 text-white font-bold rounded-lg text-center"
              style={{
                backgroundColor: cardStyles?.purchasedBadge?.backgroundColor || "#10B981",
                color: cardStyles?.buyButton?.color || "#FFFFFF",
                borderRadius: cardStyles?.buyButton?.borderRadius || "8px",
                padding: cardStyles?.buyButton?.padding || "12px 8px",
                fontWeight: cardStyles?.buyButton?.fontWeight || "bold",
                fontSize: cardStyles?.buyButton?.fontSize || "clamp(12px, 4cqw, 18px)",
                minHeight: cardStyles?.buyButton?.minHeight || "48px",
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {cardStyles?.purchasedBadge?.text || "PURCHASED"}
            </div>
          ) : (
            // BUY Button
            buyButton && buyButton.enabled && (
              <button
                className="w-full py-3 px-4 text-white font-bold rounded-lg transition-colors hover:opacity-90 disabled:opacity-50"
                style={{
                  backgroundColor: cardStyles?.buyButton?.backgroundColor || buyButton.style?.backgroundColor || "#FF6B35",
                  color: cardStyles?.buyButton?.color || buyButton.style?.textColor || "#FFFFFF",
                  borderRadius: cardStyles?.buyButton?.borderRadius || buyButton.style?.borderRadius || "8px",
                  padding: cardStyles?.buyButton?.padding || buyButton.style?.padding || "12px 24px",
                  fontWeight: cardStyles?.buyButton?.fontWeight || buyButton.style?.fontWeight || "bold",
                  fontSize: cardStyles?.buyButton?.fontSize,
                  minHeight: cardStyles?.buyButton?.minHeight,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onClick) {
                    onClick(); // Вызываем переданный onClick обработчик
                  }
                }}
              >
                {isLoading ? (
                  <span className="inline-flex items-center justify-center min-h-[1.2em] animate-spin">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  </span>
                ) : (
                  buyButton.text || "BUY NOW"
                )}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
