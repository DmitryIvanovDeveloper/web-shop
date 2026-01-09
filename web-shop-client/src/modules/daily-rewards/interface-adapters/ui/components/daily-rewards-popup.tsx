'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { DailyRewards } from './daily-rewards';

export interface DailyRewardsPopupProps {
  userId: string;
  // appId теперь получается автоматически через useAppId()
  isOpen: boolean;
  onClose: () => void;
  autoShow?: boolean;
  showDelay?: number; // milliseconds
}

export function DailyRewardsPopup({
  userId,
  isOpen,
  onClose,
  autoShow = false,
  showDelay = 2000
}: DailyRewardsPopupProps): JSX.Element | null {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  console.log('[DailyRewardsPopup] Rendered', { userId, isOpen, internalIsOpen, actualIsOpen: isOpen || internalIsOpen });

  // Auto-show logic
  useEffect(() => {
    if (autoShow && !hasShown && !isOpen) {
      const timer = setTimeout(() => {
        setInternalIsOpen(true);
        setHasShown(true);
      }, showDelay);

      return () => clearTimeout(timer);
    }
  }, [autoShow, hasShown, isOpen, showDelay]);

  const handleClose = useCallback(() => {
    setInternalIsOpen(false);
    onClose();
  }, [onClose]);

  const actualIsOpen = isOpen || internalIsOpen;

  if (!actualIsOpen) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(4px)',
      }}
      onClick={handleClose}
    >
      <div
        style={{
          position: 'relative',
          maxWidth: '500px',
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto',
          animation: 'popupSlideIn 0.3s ease-out',
        }}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            border: 'none',
            background: 'rgba(255, 255, 255, 0.2)',
            color: '#FFFFFF',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            fontWeight: 'bold',
            zIndex: 10,
            transition: 'background-color 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
          }}
        >
          ×
        </button>

        {/* Daily Rewards Content */}
        <div style={{
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
        }}>
          <DailyRewards userId={userId} />
        </div>
      </div>

      <style jsx>{`
        @keyframes popupSlideIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
