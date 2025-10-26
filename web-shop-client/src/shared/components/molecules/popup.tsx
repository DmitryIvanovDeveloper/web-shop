'use client';

import { useEffect, useState, type ReactNode, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';

export interface PopupProps {
  readonly isOpen?: boolean;
  readonly onClose?: () => void;
  readonly className?: string;
  readonly style?: CSSProperties;
  readonly children?: ReactNode;
  readonly showCloseButton?: boolean;
  readonly overlayClassName?: string;
  readonly overlayStyle?: CSSProperties;
  readonly onClick?: () => void; // Для закрытия через actionContext
}

export function Popup({
  isOpen = true,
  onClose,
  className = '',
  style,
  children,
  showCloseButton = true,
  overlayClassName = '',
  overlayStyle,
  onClick,
}: PopupProps): JSX.Element | null {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) {
    return null;
  }

  // Если в style есть position: fixed, используем его напрямую без overlay
  const useDirectPositioning = style?.position === 'fixed';

  const defaultOverlayStyle: CSSProperties = useDirectPositioning ? {} : {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
    padding: '16px',
    ...overlayStyle,
  };

  const defaultPopupStyle: CSSProperties = useDirectPositioning ? {
    backgroundColor: '#1F2937',
    border: '2px solid #FBBF24',
    borderRadius: '8px',
    padding: '12px',
    width: '320px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    ...style,
  } : {
    position: 'relative',
    backgroundColor: '#1F2937',
    border: '2px solid #FBBF24',
    borderRadius: '8px',
    padding: '12px',
    width: '320px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    ...style,
  };

  // Используем onClose если есть, иначе onClick (из actionContext)
  const handleClose = onClose || onClick;

  const popupContent = useDirectPositioning ? (
    <>
      {/* Backdrop для fixed positioning */}
      <div 
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: (style?.zIndex as number) ? (style.zIndex as number) - 1 : 9999,
        }}
        onClick={handleClose}
      />
      
      {/* Popup с fixed positioning */}
      <div className={className} style={defaultPopupStyle}>
        {/* Close Button */}
        {showCloseButton && handleClose && (
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 w-6 h-6 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center text-white text-sm font-bold transition-colors"
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              width: '24px',
              height: '24px',
              backgroundColor: '#374151',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              border: 'none',
            }}
          >
            ×
          </button>
        )}
        
        {children}
      </div>
    </>
  ) : (
    <div className={overlayClassName} style={defaultOverlayStyle}>
      <div className={className} style={defaultPopupStyle}>
        {/* Close Button */}
        {showCloseButton && handleClose && (
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 w-6 h-6 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center text-white text-sm font-bold transition-colors"
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              width: '24px',
              height: '24px',
              backgroundColor: '#374151',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              border: 'none',
            }}
          >
            ×
          </button>
        )}
        
        {children}
      </div>
    </div>
  );

  // Рендерим popup через портал, чтобы он был поверх всего
  return createPortal(popupContent, document.body);
}

