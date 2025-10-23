'use client';

import { OffersList } from '../../src/modules/offers/interface-adapters/ui/components/offers-list';

export default function TestOffersPage(): JSX.Element {
  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-white text-3xl font-bold mb-8">Test Offers Popup</h1>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-white text-xl font-semibold mb-4">Offers List (with popup on first load)</h2>
          <p className="text-gray-300 mb-4">
            This page tests the offers popup functionality. When offers are loaded and conditions are met,
            a popup should appear on first load.
          </p>

          <div className="bg-gray-700 p-4 rounded border border-yellow-400/30">
            <OffersList showPopupOnFirstLoad={true} />
          </div>
        </div>

        <div className="mt-8 bg-gray-800 p-6 rounded-lg">
          <h2 className="text-white text-xl font-semibold mb-4">Expected Behavior</h2>
          <ul className="text-gray-300 space-y-2">
            <li>• Page loads and checks offers rules</li>
            <li>• If user has enough purchases (≥1), offers are loaded</li>
            <li>• Popup appears automatically on first load with available offers</li>
            <li>• User can close popup by clicking the close button</li>
            <li>• Offers are displayed in a grid within the popup</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
