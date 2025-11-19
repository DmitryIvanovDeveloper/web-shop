'use client';

import React, { useEffect } from 'react';
import { PhoneMockup, type DeviceType, type Orientation } from './PhoneMockup';

interface FullscreenPreviewProps {
  iframeSrc: string;
  device: DeviceType;
  orientation: Orientation;
  onClose: () => void;
  onIframeRef?: (ref: HTMLIFrameElement | null) => void;
}

export function FullscreenPreview({
  iframeSrc,
  device,
  orientation,
  onClose,
  onIframeRef,
}: FullscreenPreviewProps): JSX.Element {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="relative"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '95vw', maxHeight: '95vh' }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white hover:text-gray-300 text-2xl font-bold z-10 transition-colors"
          title="Close (ESC)"
        >
          ×
        </button>

        {/* Phone Mockup */}
        <div className="w-full h-full flex items-center justify-center">
          <PhoneMockup
            iframeSrc={iframeSrc}
            device={device}
            orientation={orientation}
            onIframeRef={onIframeRef}
          />
        </div>
      </div>
    </div>
  );
}

