"use client";

import type { CSSProperties } from "react";
import { Badge } from "../atoms/badge";

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
  readonly redirectUrl?: string;
}

export interface OfferCardProps {
  readonly mainImage?: string;
  readonly mainImageAlt?: string;
  readonly sideImage?: string;
  readonly backgroundImage?: string;
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
  readonly buyButton?: BuyButton;
  readonly className?: string;
  readonly style?: CSSProperties;
  readonly onClick?: () => void;
}

export function OfferCard({
  mainImage = "",
  mainImageAlt = "Product",
  sideImage,
  backgroundImage,
  includedItems = [],
  discount,
  playerLimit,
  timer,
  title = "",
  rarity,
  originalPrice,
  currentPrice = "",
  rpBonus,
  lpBonus,
  buyButton,
  className = "",
  style,
  onClick,
}: OfferCardProps): JSX.Element {
  return (
    <div
      className={`relative grid bg-gray-800 rounded-lg overflow-hidden shadow-lg ${className}`}
      style={{
        width: '270px',
        height: '400px',
        maxWidth: '270px',
        maxHeight: '400px',
        ...style
      }}
      onClick={onClick}
    >
      {/* Badges Container - all at top */}
      <div className="absolute top-0 left-0 right-0 flex justify-between items-start  pointer-events-none z-10 w-full">
        {/* Left side badges */}
        <div className="flex">
          {/* Discount Badge */}
          {discount && (
            <Badge
              text={discount}
              variant="discount"
              withSkew={true}
              style={{ padding: '8px' }}
            />
          )}

        </div>

        {/* Right side badges */}
        <div className="!flex  gap-12">
          {playerLimit && (
            <Badge
              text={playerLimit}
              variant="limit"
              withSkew={true}
              style={{ padding: '8px' }}
            />
          )}
          {timer && (
            <Badge
              text={timer}
              variant="timer"
              withSkew={true}
              style={{ padding: '8px' }}

            />
          )}
        </div>
      </div>

      {/* Main Image Section */}
      <div
        className="relative w-full bg-gray-700 flex items-center justify-center"
        style={{
          height: '200px',
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
            className="object-contain w-full h-full"
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

      {/* Content Section - CSS Grid для фиксированных позиций */}
      <div className="p-4 grid grid-rows-[24px_32px_48px_32px_1fr_auto] gap-2" style={{ height: '200px' }}>
        {/* Row 1: Rarity - всегда 24px */}
        <div className="flex items-center" style={{ minHeight: '24px', height: '24px' }}>
          {rarity ? (
            <Badge
              text={rarity ?? ""}
              variant="rarity"
              style={{ backgroundColor: "#8A2BE2", color: "white" }}
            />
          ) : (
            <div style={{ width: '100%', height: '24px', minHeight: '24px' }}></div>
          )}
        </div>

        {/* Row 2: Title - всегда 32px */}
        <div className="flex items-center justify-center" style={{ minHeight: '32px', height: '32px' }}>
          {title ? (
            <h3 className="text-white text-lg font-bold text-center w-full">{title}</h3>
          ) : (
            <div style={{ width: '100%', height: '32px', minHeight: '32px' }}></div>
          )}
        </div>
          
        {/* Row 4: Bonuses - всегда 32px */}
        <div className="flex items-center" style={{ minHeight: '32px', height: '32px' }}>
          {rpBonus || lpBonus ? (
            <div className="flex flex-row text-sm text-gray-400 justify-between w-full">
              {rpBonus && <span className="truncate">+{rpBonus} RP</span>}
              {lpBonus && <span className="truncate">+{lpBonus} LP</span>}
            </div>
          ) : (
            <div style={{ width: '100%', height: '32px', minHeight: '32px' }}></div>
          )}
        </div>

        {/* Row 6: Buy Button - всегда внизу */}
        <div>
          {buyButton && buyButton.enabled && (
            <button
              className="w-full text-white font-bold rounded-lg transition-colors hover:opacity-90 flex items-center justify-center"
              style={{
                backgroundColor: buyButton.style?.backgroundColor || "#FF6B35",
                color: buyButton.style?.textColor || "#FFFFFF",
                borderRadius: buyButton.style?.borderRadius || "8px",
                padding: buyButton.style?.padding || "12px 24px",
                fontWeight: buyButton.style?.fontWeight || "bold",
                fontSize: "16px",
                minHeight: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onClick={(e) => {
                e.stopPropagation();

                if (buyButton.redirectUrl) {
                  window.open(
                    buyButton.redirectUrl,
                    "_blank",
                    "noopener,noreferrer"
                  );
                }
              }}
            >
              {buyButton.text || currentPrice || "BUY NOW"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

