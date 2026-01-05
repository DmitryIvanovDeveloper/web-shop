import { useState, useEffect, useRef, useCallback } from 'react';
import { container } from '../../../../infrastructure/bootstrap/container';
import { LOCALIZATION_TYPES } from '../../infrastructure/bootstrap/types';
import type { LocalizationPresenter } from '../presenters/localization.presenter';
import type { LocalizationViewModel } from '../view-models/localization.view-model';

export function useLocalization(): {
  viewModel: LocalizationViewModel;
  changeLanguage: (languageCode: string) => Promise<void>;
  clearError: () => void;
} {
  const [viewModel, setViewModel] = useState<LocalizationViewModel>({
    isLoading: true,
    error: null,
    currentLanguage: null,
    translations: {},
    direction: 'ltr'
  });

  const presenterRef = useRef<LocalizationPresenter | null>(null);

  // Initialize presenter only once
  if (presenterRef.current === null) {
    presenterRef.current = container.get<LocalizationPresenter>(LOCALIZATION_TYPES.LocalizationPresenter);
  }

  useEffect(() => {
    const presenter = presenterRef.current!;
    // Subscribe to view model changes
    const unsubscribe = presenter.subscribe(setViewModel);

    // Initialize localization on first use
    presenter.initialize();

    return unsubscribe;
  }, []); // Empty dependency array since presenter is stable

  const changeLanguage = useCallback(async (languageCode: string) => {
    const presenter = presenterRef.current!;
    await presenter.changeLanguage(languageCode);
  }, []);

  const clearError = useCallback(() => {
    const presenter = presenterRef.current!;
    presenter.clearError();
  }, []);

  return {
    viewModel,
    changeLanguage,
    clearError
  };
}

// Utility function to get translated text
export function useTranslation() {
  const { viewModel } = useLocalization();

  const t = (key: string, fallback?: string): string => {
    return viewModel.translations[key] || fallback || key;
  };

  const tExists = (key: string): boolean => {
    return key in viewModel.translations;
  };

  return {
    t,
    tExists,
    translations: viewModel.translations,
    currentLanguage: viewModel.currentLanguage,
    direction: viewModel.direction,
    isLoading: viewModel.isLoading
  };
}
