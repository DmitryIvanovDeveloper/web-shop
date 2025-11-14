'use client';

import { useEffect, useState } from 'react';
import { container } from '../../../../../infrastructure/bootstrap/container';
import { PERSONAL_OFFERS_TYPES } from '../../../infrastructure/bootstrap/types';
import { PersonalOffersPresenter } from '../../presenters/personal-offers.presenter';
import { OffersPopup } from '../../../../offers/interface-adapters/ui/components/offers-popup';

export function PersonalOffersWidget(): JSX.Element | null {
  const [, forceUpdate] = useState<Record<string, never>>({});
  const presenter = container.get<PersonalOffersPresenter>(PERSONAL_OFFERS_TYPES.Presenter);

  useEffect(() => {
    presenter.setOnViewModelChanged(() => {
      forceUpdate({});
    });

    // Don't call showOffers here - let PersonalOffersUserAuthenticatedHandler
    // handle it via UserAuthenticatedEvent with proper scenarioSlugs for new users
    // This ensures welcome-offer is shown for new users via the event handler
  }, [presenter]);

  const viewModel = presenter.getViewModel();

  if (!viewModel.isVisible) {
    return null;
  }

  if (viewModel.status !== 'success' || viewModel.offers.length === 0) {
    return null;
  }

  return (
    <OffersPopup
      offers={viewModel.offers}
      isOpen={viewModel.isVisible}
      onClose={() => presenter.hideOffers()}
    />
  );
}


