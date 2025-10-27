"use client";

import type { CSSProperties } from "react";

export interface OfferCardSkeletonProps {
  readonly className?: string;
  readonly style?: CSSProperties;
}

export function OfferCardSkeleton({
  className = "",
  style,
}: OfferCardSkeletonProps): JSX.Element {
  return (
    <div
      className={`relative bg-gray-800 rounded-lg overflow-hidden shadow-lg w-full animate-pulse ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        containerType: 'inline-size',
        ...style
      }}
    >
      {/* Main wrapper - как у конкурентов */}
      <div className="!flex !size-full !flex-col">
        {/* Image + Items wrapper */}
        <div>
          {/* Main Image Section - Skeleton */}
          <div
            className="relative w-full bg-gray-700 !flex !items-center !justify-center"
            style={{
              aspectRatio: '1.5 / 1',
            }}
          >
            <div
              className="bg-gray-600 rounded object-contain"
              style={{
                position: 'absolute',
                width: '80%',
                height: '80%',
                inset: '10%'
              }}
            />
            
            {/* Badges Container - Skeleton badges absolute внутри Image */}
            <div className="absolute top-0 left-0 right-0 !flex !justify-between !items-start pointer-events-none z-10 w-full" style={{ fontSize: 'clamp(8px, 2.5cqw, 12px)' }}>
              {/* Left side badges */}
              <div className="!flex">
                <div
                  className="bg-gray-600 rounded"
                  style={{ 
                    padding: '1.5cqw 2cqw', 
                    fontSize: 'clamp(8px, 2.5cqw, 12px)',
                    width: '60px',
                    height: '20px'
                  }}
                />
              </div>

              {/* Right side badges */}
              <div className="!flex !gap-2" style={{ gap: '2cqw' }}>
                <div
                  className="bg-gray-600 rounded"
                  style={{ 
                    padding: '1.5cqw 2cqw', 
                    fontSize: 'clamp(6px, 2cqw, 10px)',
                    width: '40px',
                    height: '16px'
                  }}
                />
                <div
                  className="bg-gray-600 rounded"
                  style={{ 
                    padding: '1.5cqw 2cqw', 
                    fontSize: 'clamp(6px, 2cqw, 10px)',
                    width: '50px',
                    height: '16px'
                  }}
                />
              </div>
            </div>
          </div>
        </div>

      {/* Content Section - Skeleton Grid с фиксированными строками как у конкурентов */}
      <div 
        className="!grid !size-full p-2 sm:p-3 md:p-4" 
        style={{ 
          display: 'grid', 
          gridTemplateRows: 'auto auto 1fr auto', 
          gap: '8px',
          alignContent: 'start'
        }}
      >
          {/* Row 1: Title - Skeleton */}
          <div className="!flex !flex-col" style={{ display: 'flex', flexDirection: 'column', gap: '2px', minHeight: '44px' }}>
            <div className="w-full" style={{ containerType: 'inline-size' }}>
              {/* Title Skeleton */}
              <div
                className="bg-gray-600 rounded mx-auto"
                style={{ 
                  width: '80%',
                  height: '24px',
                  maxWidth: '200px'
                }}
              />
            </div>
          </div>
          
          {/* Row 2: Rarity badges - Skeleton */}
          <div className="!flex !flex-wrap !justify-center" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', minHeight: '36px' }}>
            {/* Rarity Skeleton */}
            <div
              className="bg-gray-600 rounded"
              style={{ 
                width: '120px',
                height: '24px'
              }}
            />
          </div>

          {/* Row 3: Spacer - растягивается для выравнивания кнопки внизу */}
          <div></div>

          {/* Row 4: Button + RP/LP - Skeleton - всегда внизу карточки */}
          <div className="!flex !flex-col landscape-max-lg:py-1">
            {/* Buy Button Skeleton */}
            <div
              className="bg-gray-600 rounded-lg"
              style={{
                width: '100%',
                height: '48px',
                padding: '12px 8px',
              }}
            />
            
            {/* RP/LP Bonuses Skeleton - разведены по углам */}
            <div className="text-gray-400 !flex !justify-between !w-full" style={{ display: 'flex', flexDirection: 'row', fontSize: '12px', justifyContent: 'space-between', width: '100%' }}>
              <div className="bg-gray-600 rounded" style={{ width: '40px', height: '12px' }} />
              <div className="bg-gray-600 rounded" style={{ width: '40px', height: '12px' }} />
            </div>
          </div>
      </div>
      </div>
    </div>
  );
}
