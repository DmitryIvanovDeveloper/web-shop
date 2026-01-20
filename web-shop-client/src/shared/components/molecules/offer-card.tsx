"use client";

import { useState, useEffect } from "react";
import type { CSSProperties } from "react";
import { Badge } from "../atoms/badge";
import { ClipLoader } from "react-spinners";

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
  readonly description?: string;
  readonly topLabel?: string;
  readonly rarity?: string;
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
  description,
  topLabel,
  rarity,
  rpBonus,
  lpBonus,
  isPurchased = false,
  isLoading = false,
  buyButton,
  className = "",
  style,
  onClick
}: OfferCardProps): JSX.Element {

    const [cardStyles, setCardStyles] = useState<any>(null);
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
    const updateStyles = () => {
      if (typeof window !== 'undefined' && (window as any).__offerCardStyles?.styles) {
        setCardStyles((window as any).__offerCardStyles.styles);
      }
    };

        updateStyles();

        window.addEventListener('appConfigLoaded', updateStyles);
    return () => window.removeEventListener('appConfigLoaded', updateStyles);
  }, []);

    useEffect(() => {
    setImageError(false);
  }, [mainImage]);

  return (
    <div
      className={`relative bg-gray-800 rounded-lg overflow-hidden shadow-lg w-full ${className}`}
      dir="ltr"
      style={{
        backgroundColor: cardStyles?.container?.backgroundColor,
        borderRadius: cardStyles?.container?.borderRadius,
        height: '100%',         display: 'flex',
        flexDirection: 'column',
        containerType: 'inline-size',         ...style
      }}
      onClick={onClick}
    >
      {}
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

      {}
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

      {}
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

      {}
      <div
        className="relative w-full h-48 bg-gray-700 flex items-center justify-center"
        style={{
          backgroundColor: cardStyles?.image?.backgroundColor,
          aspectRatio: cardStyles?.image?.aspectRatio
        }}
      >
        {mainImage && !imageError ? (
          <img
            src={mainImage}
            alt={mainImageAlt}
            className="object-cover w-full h-full"
            onLoad={() => {
            }}
            onError={() => {
              setImageError(true);
            }}
          />
        ) : mainImage && imageError ? (
          <div className="flex items-center justify-center w-full h-full text-gray-400">
            <svg
              className="w-16 h-16"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        ) : null}
      </div>

      {}
      <div
        className="p-2 sm:p-3 md:p-4 grid w-full"
        style={{
          display: 'grid',
          gridTemplateRows: 'auto auto 1fr auto',           gap: '8px',
          height: '100%',           alignContent: 'start'
        }}
      >
        {}
        <div className="flex flex-col" style={{
          minHeight: '44px',
          maxHeight: '44px',           overflow: 'hidden'         }}>
          {topLabel && (
            <div className="text-white text-xs font-medium mb-1 opacity-90">
              {topLabel}
            </div>
          )}
          {title && (
            <h3
              className="text-white text-lg font-bold truncate"
              style={{
                fontSize: cardStyles?.title?.fontSize,
                fontWeight: cardStyles?.title?.fontWeight,
                color: cardStyles?.title?.color,
                lineHeight: '1.2',                 display: '-webkit-box',
                WebkitLineClamp: 2,                 WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {title}
            </h3>
          )}
          {description && (
            <p className="text-white text-sm opacity-80 mt-1 line-clamp-2">
              {description}
            </p>
          )}
        </div>

        {}
        <div className="flex flex-col" style={{
          minHeight: '36px'         }}>
          {}
        </div>

        {}
        <div></div>

        {}
        <div>
          {isPurchased ? (
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
              {cardStyles?.purchasedBadge?.text || 'PURCHASED'}
            </div>
          ) : (
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
                    onClick();                   }
                }}
              >
                {isLoading ? (
                  <ClipLoader
                    size={16}
                    color={cardStyles?.buyButton?.color || buyButton.style?.textColor || "#FFFFFF"}
                    loading={true}
                  />
                ) : (
                  buyButton.text || 'Buy Now'
                )}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
