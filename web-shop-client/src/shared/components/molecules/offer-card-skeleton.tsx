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
        minHeight: '400px',
        height: '100%',
        containerType: 'size',
        ...style
      }}
    >
      {/* Badges Container - Skeleton badges */}
      <div className="absolute top-0 left-0 right-0 flex justify-between items-start pointer-events-none z-10 w-full" style={{ fontSize: 'clamp(8px, 2.5cqw, 12px)' }}>
        {/* Left side badges */}
        <div className="flex">
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
        <div className="!flex gap-2" style={{ gap: '2cqw' }}>
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

      {/* Main Image Section - Skeleton */}
      <div
        className="relative w-full bg-gray-700 !flex items-center justify-center"
        style={{
          flex: '0 0 200px',
          minHeight: '200px',
        }}
      >
        <div
          className="bg-gray-600 rounded"
          style={{
            width: '80%',
            height: '80%',
            maxWidth: '160px',
            maxHeight: '160px'
          }}
        />
      </div>

      {/* Included Items Section - Skeleton */}
      <div className="min-h-10 bg-gray-700">
        <div className="flex justify-center gap-2 self-center p-2">
          {[1, 2, 3].map((index) => (
            <div key={index} className="relative basis-1/5 overflow-hidden">
              <div
                className="relative h-full max-w-full rounded bg-gray-600 aspect-3/2"
                style={{ width: '100%', height: '40px' }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Content Section - Skeleton */}
      <div style={{ flex: 1, padding: '3cqw 4cqw 4cqw 4cqw', display: 'grid', gridTemplateRows: 'auto 1fr', gap: '0' }} className="">
        {/* Блок 1: Title + Rarity - Skeleton */}
        <div style={{ display: 'grid', gridTemplateRows: '50px auto', gap: '8px' }}>
          {/* Title Skeleton */}
          <div
            className="bg-gray-600 rounded mx-auto"
            style={{ 
              width: '80%',
              height: '24px',
              maxWidth: '200px'
            }}
          />
          
          {/* Rarity Skeleton */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
            <div
              className="bg-gray-600 rounded"
              style={{ 
                width: '60px',
                height: '20px',
                padding: '1cqw 2cqw'
              }}
            />
          </div>
        </div>

        {/* Блок 2: Buy Button + RP/LP - Skeleton */}
        <div className="!flex !flex-col gap-2" style={{ alignSelf: 'end' }}>
          {/* Buy Button Skeleton */}
          <div
            className="bg-gray-600 rounded-lg"
            style={{
              width: '100%',
              height: '48px',
              padding: '12px 8px',
            }}
          />
          
          {/* RP/LP Bonuses Skeleton */}
          <div className="text-gray-400" style={{ display: 'flex', flexDirection: 'row', fontSize: '12px', justifyContent: 'space-between', width: '100%', padding: '0 8px' }}>
            <div className="bg-gray-600 rounded" style={{ width: '40px', height: '12px' }} />
            <div className="bg-gray-600 rounded" style={{ width: '40px', height: '12px' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
