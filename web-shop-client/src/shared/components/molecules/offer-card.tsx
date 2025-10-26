"use client";

import type { CSSProperties } from "react";
import { Badge } from "../atoms/badge";

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
  return (
    <div
      className={`relative bg-gray-800 rounded-lg overflow-hidden shadow-lg w-full ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '400px',
        height: '100%',
        containerType: 'size',
        ...style
      }}
      onClick={onClick}
    >
      {/* Badges Container - пропорциональные размеры */}
      <div className="absolute top-0 left-0 right-0 flex justify-between items-start pointer-events-none z-10 w-full" style={{ fontSize: 'clamp(8px, 2.5cqw, 12px)' }}>
        {/* Left side badges */}
        <div className="flex">
          {/* Discount Badge - only show if not purchased */}
          {!isPurchased && discount && (
            <Badge
              text={discount}
              variant="discount"
              withSkew={true}
              style={{ padding: '1.5cqw 2cqw', fontSize: 'clamp(8px, 2.5cqw, 12px)' }}
            />
          )}

        </div>

        {/* Right side badges */}
        <div className="!flex gap-2" style={{ gap: '2cqw' }}>
          {playerLimit && (
            <Badge
              text={playerLimit}
              variant="limit"
              withSkew={true}
              style={{ padding: '1.5cqw 2cqw', fontSize: 'clamp(6px, 2cqw, 10px)' }}
            />
          )}
          {!isPurchased && timer && (
            <Badge
              text={timer.toLocaleString()}
              variant="timer"
              withSkew={true}
              style={{ padding: '1.5cqw 2cqw', fontSize: 'clamp(6px, 2cqw, 10px)' }}

            />
          )}
        </div>
      </div>

      {/* Main Image Section */}
      <div
        className="relative w-full bg-gray-700 !flex items-center justify-center"
        style={{
          flex: '0 0 200px',
          minHeight: '200px',
          backgroundImage: backgroundImage
            ? `url('${backgroundImage}')`
            : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {mainImage && (
          <img
            src={mainImage}
            alt={mainImageAlt}
            style={{
              objectFit: 'contain',
              width: '100%',
              height: '100%',
              maxWidth: '100%',
              maxHeight: '100%'
            }}
          />
        )}
      </div>
      {/* Included Items Section - styled like the HTML */}
      {includedItems && includedItems.length > 0 && (
        <div className="min-h-10 cursor-pointer content-center bg-gray-700 bg-cover bg-center">
          <div className="flex justify-center gap-2 self-center p-2">
            {includedItems.slice(0, 3).map((item, index) => (
              <div key={index} className="relative basis-1/5 overflow-hidden">
                <div
                  className="relative h-full max-w-full rounded bg-gray-600 bg-cover bg-center aspect-3/2"
                  style={{ backgroundImage: backgroundImage ? `url('${backgroundImage}')` : undefined }}
                >
                  <img
                    alt={`Item ${index + 1}`}
                    className="rounded object-contain"
                    src={item}
                    style={{ position: "absolute", height: "100%", width: "100%", inset: "0px" }}
                  />
                </div>
              </div>
            ))}
            {includedItems.length > 3 && (
              <div className="flex items-center justify-center basis-1/5 aspect-3/2">
                <div className="flex size-full place-content-center items-center rounded bg-gray-600 px-2 text-center text-xs font-semibold whitespace-pre-line uppercase text-gray-300">
                  <span className="hidden sm:block">And more</span>
                  <span className="sm:hidden">...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content Section - CSS Grid с auto + 1fr прижимает Buy Button вниз! */}
      <div style={{ flex: 1, padding: '3cqw 4cqw 4cqw 4cqw', display: 'grid', gridTemplateRows: 'auto 1fr', gap: '0' }} className="">
        {/* Блок 1: Title + Rarity - Grid с фиксированной высотой Title */}
        <div style={{ display: 'grid', gridTemplateRows: '50px auto', gap: '8px' }}>
          {/* Title */}
          {title && (
            <h3 
              className="text-white font-bold text-center w-full" 
              style={{ 
                fontSize: titleStyle?.fontSize || 'clamp(10px, 4cqw, 18px)', 
                fontWeight: titleStyle?.fontWeight || 'bold',
                color: titleStyle?.color || 'white',
                lineHeight: '1.2' 
              }}
            >
              {title}
            </h3>
          )}
          
          {/* Rarity */}
          {rarity && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'clamp(8px, 3cqw, 14px)', padding: '0 24px' }}>
              <Badge
                text={rarity ?? ""}
                variant="rarity"
                style={{ backgroundColor: "#8A2BE2", color: "white", padding: '1cqw 2cqw' }}
              />
            </div>
          )}
        </div>

        {/* Блок 2: Buy Button + RP/LP отдельно (в footer, прижат к низу через Grid!) */}
        <div className="!flex !flex-col gap-2" style={{ alignSelf: 'end' }}>
          {/* Buy Button или Purchased Badge */}
          {isPurchased ? (
            <div
              className="w-full text-white font-bold rounded-lg !flex items-center justify-center"
              style={{
                backgroundColor: "#10B981",
                color: "#FFFFFF",
                borderRadius: "8px",
                fontWeight: "bold",
                fontSize: 'clamp(12px, 4cqw, 18px)',
                padding: '12px 8px',
                minHeight: '48px',
              }}
            >
              PURCHASED
            </div>
          ) : (
            buyButton && buyButton.enabled && (
              <button
                className="w-full text-white font-bold rounded-lg transition-colors hover:opacity-90 !flex items-center justify-center"
                style={{
                  backgroundColor: buyButton.style?.backgroundColor || "#FF6B35",
                  color: buyButton.style?.textColor || "#FFFFFF",
                  borderRadius: buyButton.style?.borderRadius || "8px",
                  fontWeight: buyButton.style?.fontWeight || "bold",
                  fontSize: buyButton.style?.fontSize || 'clamp(12px, 4cqw, 18px)',
                  padding: '12px 8px',
                  minHeight: '48px',
                }}
                onClick={(e) => {
                  e.stopPropagation();

                  // Don't handle click if loading
                  if (isLoading) {
                    return;
                  }

                  // Call the parent onClick handler
                  if (onClick) {
                    onClick();
                  }
                }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'spin 1s linear infinite' }}>
                    <svg style={{ width: '20px', height: '20px' }} viewBox="0 0 24 24" fill="none">
                      <circle 
                        style={{ opacity: 0.25 }}
                        cx="12" 
                        cy="12" 
                        r="10" 
                        stroke="white" 
                        strokeWidth="4"
                      />
                      <path 
                        style={{ opacity: 0.75 }}
                        fill="white" 
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  </span>
                ) : (
                  buyButton.text || currentPrice || "BUY NOW"
                )}
              </button>
            )
          )}
          
          {/* RP/LP Bonuses - отдельно под кнопкой */}
          {(rpBonus || lpBonus) && (
            <div className="text-gray-400" style={{ display: 'flex', flexDirection: 'row', fontSize: '12px', justifyContent: 'space-between', width: '100%', padding: '0 8px' }}>
              {rpBonus && <span>+{rpBonus} RP</span>}
              {lpBonus && <span>+{lpBonus} LP</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

