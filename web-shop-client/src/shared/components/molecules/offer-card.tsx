"use client";

import { useState, useEffect } from "react";
import type { CSSProperties } from "react";
import { Badge } from "../atoms/badge";

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
  
  useEffect(() => {
    if (!timer) return;
    
    const updateCountdown = () => {
      setCountdown(formatCountdown(timer));
    };
    
    updateCountdown(); // Сразу обновляем
    const interval = setInterval(updateCountdown, 1000); // Обновляем каждую секунду
    
    return () => clearInterval(interval);
  }, [timer]);
  
  return (
    <div
      className={`relative bg-gray-800 rounded-lg overflow-hidden shadow-lg w-full ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        containerType: 'inline-size',
        ...style
      }}
      onClick={onClick}
    >
      {/* Main wrapper - как у конкурентов */}
      <div className="!flex !size-full !flex-col">
        {/* Image + Items wrapper */}
        <div>
      {/* Main Image Section */}
      <div
            className="relative w-full bg-gray-700 !flex !items-center !justify-center"
        style={{
              aspectRatio: '1.5 / 1',
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
                className="cursor-pointer object-contain"
                style={{
                  position: 'absolute',
                  height: '100%',
                  width: '100%',
                  inset: '0px'
                }}
              />
            )}
            
            {/* Badges Container - absolute внутри Image как у Pixel Gun */}
            {/* Left side badges - top-1 на mobile, top-3 на desktop (@2xs:top-3) */}
            <div className="absolute pointer-events-none z-10 max-w-full" style={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
              top: '4px',
              left: '-4px',
              fontSize: 'clamp(8px, 2.5cqw, 12px)' 
            }}>
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

            {/* Right side badges - -right-1 чтобы выходили за границу как у Pixel Gun */}
            <div className="absolute pointer-events-none z-10" style={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
              top: '4px',
              right: '-4px',
              fontSize: 'clamp(6px, 2cqw, 10px)' 
            }}>
              {playerLimit && (
                <Badge
                  text={playerLimit}
                  variant="limit"
                  withSkew={true}
                  style={{ padding: '1.5cqw 2cqw', fontSize: 'clamp(6px, 2cqw, 10px)' }}
                />
              )}
              {!isPurchased && timer && countdown && (
                <Badge
                  text={countdown}
                  variant="timer"
                  withSkew={true}
                  style={{ padding: '1.5cqw 2cqw', fontSize: 'clamp(6px, 2cqw, 10px)' }}
                />
              )}
            </div>
          </div>
          
          {/* Included Items Section */}
      {includedItems && includedItems.length > 0 && (
            <div className="@container min-h-10 cursor-pointer content-center bg-gray-700 bg-cover bg-center">
              <div className="!grid !gap-2 p-2" style={{ gridTemplateColumns: 'repeat(4, 1fr)', justifyItems: 'center', alignSelf: 'center' }}>
            {includedItems.slice(0, 3).map((item, index) => (
              <div key={index} className="relative overflow-hidden w-full">
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
              <div className="!flex !items-center !justify-center w-full aspect-3/2">
                    <div className="!flex !size-full !place-content-center !items-center rounded bg-gray-600 px-2 text-center text-xs font-semibold whitespace-pre-line uppercase text-gray-300">
                  <span className="hidden sm:block">And more</span>
                  <span className="sm:hidden">...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
        </div>

      {/* Content Section - Grid с фиксированными строками как у конкурентов */}
      <div 
        className="!grid !size-full p-2 sm:p-3 md:p-4" 
        style={{ 
          display: 'grid', 
          gridTemplateRows: 'auto auto 1fr auto', 
          gap: '8px',
          alignContent: 'start'
        }}
      >
          {/* Row 1: Title */}
          <div className="!flex !flex-col" style={{ display: 'flex', flexDirection: 'column', gap: '2px', minHeight: '44px' }}>
            <div className="w-full" style={{ containerType: 'inline-size' }}>
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
            </div>
          </div>
          
          {/* Row 2: Rarity badges */}
          <div className="!flex !flex-wrap !justify-center" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', minHeight: '36px' }}>
            {rarity && (
          <Badge
            text={rarity ?? ""}
            variant="rarity"
                style={{ backgroundColor: "#8A2BE2", color: "white", padding: '1cqw 2cqw' }}
          />
        )}
      </div>

          {/* Row 3: Spacer - растягивается для выравнивания кнопки внизу */}
          <div></div>

          {/* Row 4: Buy Button + RP/LP - всегда внизу карточки */}
          <div className="!flex !flex-col landscape-max-lg:py-1">
          {/* Buy Button или Purchased Badge */}
          {isPurchased ? (
            <div
              style={{
                width: '100%',
                backgroundColor: "#10B981",
                color: "#FFFFFF",
                borderRadius: "8px",
                fontWeight: "bold",
                fontSize: 'clamp(12px, 4cqw, 18px)',
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
          
          {/* RP/LP Bonuses - разведены по углам */}
          {(rpBonus || lpBonus) && (
            <div className="text-gray-400 !flex !justify-between !w-full" style={{ display: 'flex', flexDirection: 'row', fontSize: '12px', justifyContent: 'space-between', width: '100%' }}>
              <span className="text-yellow-400">{rpBonus ? `+${rpBonus} RP` : ''}</span>
              <span className="text-blue-400">{lpBonus ? `+${lpBonus} LP` : ''}</span>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}

