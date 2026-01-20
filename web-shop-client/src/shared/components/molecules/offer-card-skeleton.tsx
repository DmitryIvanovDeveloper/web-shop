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
      className={`relative bg-gray-800 rounded-lg overflow-hidden shadow-lg w-full ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        containerType: 'inline-size',
        ...style
      }}
    >
      {}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%)',
          animation: 'shimmer 2s infinite',
          zIndex: 1
        }}
      />
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
      {}
      <div className="!flex !size-full !flex-col">
        {}
        <div>
          {}
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
            
            {}
            {}
            <div className="absolute pointer-events-none z-10 max-w-full" style={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
              top: '4px',
              left: '-4px',
              fontSize: 'clamp(8px, 2.5cqw, 12px)' 
            }}>
              {}
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

            {}
            <div className="absolute pointer-events-none z-10" style={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
              top: '4px',
              right: '-4px',
              fontSize: 'clamp(6px, 2cqw, 10px)' 
            }}>
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

      {}
      <div 
        className="!grid !size-full p-2 sm:p-3 md:p-4" 
        style={{ 
          display: 'grid', 
          gridTemplateRows: 'auto auto 1fr auto', 
          gap: '8px',
          alignContent: 'start'
        }}
      >
          {}
          <div className="!flex !flex-col" style={{ display: 'flex', flexDirection: 'column', gap: '2px', minHeight: '44px' }}>
            <div className="w-full" style={{ containerType: 'inline-size' }}>
              {}
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
          
          {}
          <div className="!flex !flex-wrap !justify-center" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', minHeight: '36px' }}>
            {}
            <div
              className="bg-gray-600 rounded"
              style={{ 
                width: '120px',
                height: '24px'
              }}
            />
          </div>

          {}
          <div></div>

          {}
          <div className="!flex !flex-col landscape-max-lg:py-1">
            {}
            <div
              className="bg-gray-600 rounded-lg"
              style={{
                width: '100%',
                height: '48px',
                padding: '12px 8px',
              }}
            />
            
            {}
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
