

import { useState, useCallback } from 'react';

export interface UseAuthPopupReturn {
  
  isOpen: boolean;
  
  openPopup: () => void;
  
  closePopup: () => void;
  
  togglePopup: () => void;
}

export function useAuthPopup(): UseAuthPopupReturn {
  const [isOpen, setIsOpen] = useState(false);

  const openPopup = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closePopup = useCallback(() => {
    setIsOpen(false);
  }, []);

  const togglePopup = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return {
    isOpen,
    openPopup,
    closePopup,
    togglePopup
  };
}
