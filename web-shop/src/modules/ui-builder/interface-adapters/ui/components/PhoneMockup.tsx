'use client';

import React, { useRef, useEffect, useState } from 'react';

export type DeviceType = 'iphone-15-pro' | 'iphone-14-pro' | 'iphone-se' | 'ipad';
export type Orientation = 'portrait' | 'landscape';

interface DeviceSpec {
  width: number;
  height: number;
  notch: boolean;
  frameWidth: number;
  frameColor: string;
  borderRadius: number;
}

const deviceSpecs: Record<DeviceType, DeviceSpec> = {
  'iphone-15-pro': {
    width: 393,
    height: 852,
    notch: true,
    frameWidth: 8,
    frameColor: '#1d1d1f',
    borderRadius: 55,
  },
  'iphone-14-pro': {
    width: 390,
    height: 844,
    notch: true,
    frameWidth: 8,
    frameColor: '#1d1d1f',
    borderRadius: 55,
  },
  'iphone-se': {
    width: 375,
    height: 667,
    notch: false,
    frameWidth: 6,
    frameColor: '#1d1d1f',
    borderRadius: 40,
  },
  'ipad': {
    width: 768,
    height: 1024,
    notch: false,
    frameWidth: 12,
    frameColor: '#1d1d1f',
    borderRadius: 20,
  },
};

interface StatusBarProps {
  readonly device: DeviceType;
  readonly orientation: Orientation;
  readonly screenWidth: number;
  readonly screenHeight: number;
}

const StatusBar: React.FC<StatusBarProps> = ({
  device,
  orientation,
  screenWidth,
  screenHeight,
}: StatusBarProps) => {
  const isLandscape = orientation === 'landscape';

  // Simple height model: iPad ниже, iPhone выше, в landscape почти нет высоты
  const baseHeight = device === 'ipad' ? 24 : 44;
  const height = isLandscape ? 0 : baseHeight;

  if (height <= 0) {
    return null;
  }

  return (
    <div
      className="absolute top-0 left-0 z-10 flex items-center justify-between px-4 text-[10px] text-white"
      style={{
        width: `${screenWidth}px`,
        height: `${height}px`,
        background:
          'linear-gradient(180deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.3) 100%)',
      }}
    >
      <span>9:41</span>
      <span className="flex gap-1 items-center">
        <span>📶</span>
        <span>Wi-Fi</span>
        <span>🔋</span>
      </span>
    </div>
  );
};

interface PhoneMockupProps {
  iframeSrc: string;
  device: DeviceType;
  orientation: Orientation;
  onIframeRef?: (ref: HTMLIFrameElement | null) => void;
}

export function PhoneMockup({
  iframeSrc,
  device,
  orientation,
  onIframeRef,
}: PhoneMockupProps): JSX.Element {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const spec = deviceSpecs[device];

  useEffect(() => {
    if (onIframeRef) {
      onIframeRef(iframeRef.current);
    }
  }, [onIframeRef]);

  // Calculate dimensions based on orientation
  const isLandscape = orientation === 'landscape';
  const screenWidth = isLandscape ? spec.height : spec.width;
  const screenHeight = isLandscape ? spec.width : spec.height;
  const frameWidth = spec.frameWidth;
  const totalWidth = screenWidth + frameWidth * 2;
  const totalHeight = screenHeight + frameWidth * 2;

  // Calculate scale to fit viewport (only scale down, never up)
  const maxViewportHeight = typeof window !== 'undefined' ? window.innerHeight - 250 : 800;
  const maxViewportWidth = typeof window !== 'undefined' ? window.innerWidth - 100 : 1200;
  const scaleX = maxViewportWidth / totalWidth;
  const scaleY = maxViewportHeight / totalHeight;
  const scale = Math.min(scaleX, scaleY, 1); // Don't scale up, only down

  return (
    <div
      className="flex items-center justify-center w-full h-full"
      style={{
        minHeight: '600px',
      }}
    >
      <div
        className="relative transition-transform duration-300"
        style={{
          width: `${totalWidth}px`,
          height: `${totalHeight}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
        }}
      >
        {/* Phone Frame */}
        <div
          className="relative"
          style={{
            width: `${totalWidth}px`,
            height: `${totalHeight}px`,
            background: `linear-gradient(135deg, ${spec.frameColor} 0%, #000000 100%)`,
            borderRadius: `${spec.borderRadius}px`,
            padding: `${frameWidth}px`,
            boxShadow: `
              0 20px 60px rgba(0, 0, 0, 0.4),
              0 0 0 1px rgba(255, 255, 255, 0.1) inset,
              0 2px 10px rgba(0, 0, 0, 0.5)
            `,
            position: 'relative',
            border: `1px solid rgba(255, 255, 255, 0.05)`,
          }}
        >
          {/* Notch for iPhone models - Portrait */}
          {spec.notch && !isLandscape && (
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 z-10"
              style={{
                width: '126px',
                height: '30px',
                background: `linear-gradient(135deg, ${spec.frameColor} 0%, #000000 100%)`,
                borderRadius: '0 0 20px 20px',
                marginTop: `${frameWidth}px`,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                border: `1px solid rgba(255, 255, 255, 0.05)`,
                borderTop: 'none',
              }}
            />
          )}

          {/* Notch for iPhone models - Landscape (on the left side) */}
          {spec.notch && isLandscape && (
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10"
              style={{
                width: '30px',
                height: '126px',
                background: `linear-gradient(135deg, ${spec.frameColor} 0%, #000000 100%)`,
                borderRadius: '0 20px 20px 0',
                marginLeft: `${frameWidth}px`,
                boxShadow: '2px 0 8px rgba(0, 0, 0, 0.3)',
                border: `1px solid rgba(255, 255, 255, 0.05)`,
                borderLeft: 'none',
              }}
            />
          )}

          {/* Screen Container */}
          <div
            className="relative overflow-hidden bg-black"
            style={{
              width: `${screenWidth}px`,
              height: `${screenHeight}px`,
              borderRadius: `${spec.borderRadius - frameWidth}px`,
              boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.5)',
            }}
          >
            {/* Status Bar for iPhone and iPad */}
            {(device === 'iphone-15-pro' || device === 'iphone-14-pro' || device === 'iphone-se' || device === 'ipad') && (
              <StatusBar device={device} orientation={orientation} screenWidth={screenWidth} screenHeight={screenHeight} />
            )}

            {/* Iframe positioned below status bar area */}
            {(() => {
              const hasStatusBar = device === 'iphone-15-pro' || device === 'iphone-14-pro' || device === 'iphone-se' || device === 'ipad';
              const statusBarHeight = hasStatusBar 
                ? (device === 'ipad' ? 24 : orientation === 'landscape' ? 0 : 44)
                : 0;
              const isLandscape = orientation === 'landscape' && !(device === 'ipad');
              
              return (
                <iframe
                  ref={iframeRef}
                  src={iframeSrc}
                  className="border-0"
                  style={{
                    position: 'absolute',
                    top: isLandscape ? '0px' : `${statusBarHeight}px`,
                    left: isLandscape ? `${statusBarHeight}px` : '0px',
                    width: isLandscape ? `calc(100% - ${statusBarHeight}px)` : `${screenWidth}px`,
                    height: isLandscape ? `${screenHeight}px` : `calc(100% - ${statusBarHeight}px)`,
                    border: 'none',
                    display: 'block',
                  }}
                  title="Live Preview"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                />
              );
            })()}
          </div>

          {/* Home Indicator for iPhone - Portrait (bottom) */}
          {spec.notch && !isLandscape && (
            <div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10"
              style={{
                width: '134px',
                height: '5px',
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                borderRadius: '3px',
                marginBottom: `${frameWidth + 8}px`,
              }}
            />
          )}

          {/* Home Indicator for iPhone - Landscape (right side) */}
          {spec.notch && isLandscape && (
            <div
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10"
              style={{
                width: '5px',
                height: '134px',
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                borderRadius: '3px',
                marginRight: `${frameWidth + 8}px`,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
