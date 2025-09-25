import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';

import HomePage from '../../pages/HomePage';
import MerchantModulePage from '../../pages/modules/MerchantModulePage';
import PersonalizationModulePage from '../../pages/modules/PersonalizationModulePage';
import RewardsModulePage from '../../pages/modules/RewardsModulePage';
import ContentModulePage from '../../pages/modules/ContentModulePage';
import LocalizationModulePage from '../../pages/modules/LocalizationModulePage';
import WebshopModulePage from '../../pages/modules/WebshopModulePage';
import SDKModulePage from '../../pages/modules/SDKModulePage';
import AnalyticsModulePage from '../../pages/modules/AnalyticsModulePage';
import UIBuilderModulePage from '../../pages/modules/UIBuilderModulePage';
import AchievementsPage from '../../pages/AchievementsPage';
import LoyaltyModulePage from '../../pages/modules/LoyaltyModulePage';
import LiveOpsModulePage from '../../pages/modules/LiveOpsModulePage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'modules/merchant', element: <MerchantModulePage /> },

      { path: 'modules/personalization', element: <PersonalizationModulePage /> },

      { path: 'modules/rewards', element: <RewardsModulePage /> },

      { path: 'modules/content', element: <ContentModulePage /> },

      { path: 'modules/localization', element: <LocalizationModulePage /> },

      { path: 'modules/webshop', element: <WebshopModulePage /> },

      { path: 'modules/sdk', element: <SDKModulePage /> },
      { path: 'modules/analytics', element: <AnalyticsModulePage /> },
      { path: 'modules/uibuilder', element: <UIBuilderModulePage /> },
      { path: 'modules/loyalty', element: <LoyaltyModulePage /> },
      { path: 'modules/liveops', element: <LiveOpsModulePage /> },
      { path: 'achievements', element: <AchievementsPage /> },
      { path: 'events', element: <div>Events (Mock)</div> },
    ],
  },
]);
