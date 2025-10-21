/**
 * Хук для управления состоянием popup авторизации
 */

import { useState, useCallback } from 'react';

export interface UseAuthPopupReturn {
  /** Показан ли popup */
  isOpen: boolean;
  /** Открыть popup */
  openPopup: () => void;
  /** Закрыть popup */
  closePopup: () => void;
  /** Переключить состояние popup */
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
