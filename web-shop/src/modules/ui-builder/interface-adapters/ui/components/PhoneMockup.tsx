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

            {/* Iframe positioned below status bar */}
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

/**
 * iOS Status Bar Component
 * Displays time, signal, battery, and other iOS status indicators
 */
interface StatusBarProps {
  device: DeviceType;
  orientation: Orientation;
  screenWidth: number;
  screenHeight: number;
}

function StatusBar({ device, orientation, screenWidth, screenHeight }: StatusBarProps): JSX.Element {
  const [currentTime, setCurrentTime] = useState<string>('9:41');
  const isLandscape = orientation === 'landscape';
  const isIPad = device === 'ipad';

  useEffect(() => {
    // Update time every minute
    const updateTime = (): void => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      setCurrentTime(`${hours}:${minutes.toString().padStart(2, '0')}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Status bar height varies by device
  const statusBarHeight = isIPad ? 24 : 44; // iPad has smaller status bar
  const statusBarPadding = isIPad ? '4px 16px' : '4px 20px';

  // For landscape orientation on iPhone, status bar is on the left
  if (isLandscape && !isIPad) {
    return (
      <div
        className="absolute left-0 top-0 z-20 flex items-center justify-between"
        style={{
          width: `${statusBarHeight}px`,
          height: `${screenWidth}px`,
          padding: statusBarPadding,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(20px)',
          writingMode: 'vertical-rl',
          textOrientation: 'mixed',
          transform: 'rotate(180deg)',
          transformOrigin: 'center',
        }}
      >
        <div className="flex flex-col items-center justify-between h-full text-white text-[10px] font-medium">
          <div className="flex flex-col items-center gap-1">
            <span>{currentTime}</span>
            <div className="flex items-center gap-0.5">
              <SignalIcon />
              <BatteryIcon />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Portrait orientation (default)
  return (
    <div
      className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between"
      style={{
        height: `${statusBarHeight}px`,
        padding: statusBarPadding,
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(20px)',
        color: '#ffffff',
        fontSize: isIPad ? '12px' : '14px',
        fontWeight: '600',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif',
      }}
    >
      {/* Left side - Time */}
      <div className="flex items-center">
        <span>{currentTime}</span>
      </div>

      {/* Right side - Signal, Battery, etc. */}
      <div className="flex items-center gap-1">
        <SignalIcon />
        <WifiIcon />
        <BatteryIcon />
      </div>
    </div>
  );
}

/**
 * Signal strength icon (4 bars)
 */
function SignalIcon(): JSX.Element {
  return (
    <div className="flex items-end gap-[2px]" style={{ width: '17px', height: '10px' }}>
      <div style={{ width: '3px', height: '4px', background: '#ffffff', borderRadius: '1px', opacity: 0.4 }} />
      <div style={{ width: '3px', height: '6px', background: '#ffffff', borderRadius: '1px', opacity: 0.6 }} />
      <div style={{ width: '3px', height: '8px', background: '#ffffff', borderRadius: '1px', opacity: 0.8 }} />
      <div style={{ width: '3px', height: '10px', background: '#ffffff', borderRadius: '1px' }} />
    </div>
  );
}

/**
 * WiFi icon
 */
function WifiIcon(): JSX.Element {
  return (
    <svg width="15" height="11" viewBox="0 0 15 11" fill="none" style={{ opacity: 0.9 }}>
      <path
        d="M7.5 0C3.36 0 0 3.36 0 7.5c0 1.5.5 2.9 1.3 4L7.5 2l6.2 9.5c.8-1.1 1.3-2.5 1.3-4C15 3.36 11.64 0 7.5 0z"
        fill="#ffffff"
        opacity="0.9"
      />
    </svg>
  );
}

/**
 * Battery icon with percentage
 */
function BatteryIcon(): JSX.Element {
  const batteryLevel = 100; // Static for mockup

  return (
    <div className="flex items-center gap-1">
      <div
        style={{
          width: '24px',
          height: '12px',
          border: '1.5px solid #ffffff',
          borderRadius: '2px',
          position: 'relative',
          background: 'rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Battery level fill */}
        <div
          style={{
            width: `${batteryLevel}%`,
            height: '100%',
            background: '#34C759',
            borderRadius: '1px',
            transition: 'width 0.3s ease',
          }}
        />
        {/* Battery terminal */}
        <div
          style={{
            position: 'absolute',
            right: '-3px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '2px',
            height: '6px',
            background: '#ffffff',
            borderRadius: '0 1px 1px 0',
          }}
        />
      </div>
    </div>
  );
}

