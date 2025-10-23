'use client';

import { Grid } from '../../src/shared/components/molecules/grid';
import { OfferCard } from '../../src/shared/components/molecules/offer-card';

const mockOffers = [
  {
    id: 'dragon-slayer',
    title: 'Dragon Slayer Sword',
    currentPrice: '$23.99',
    originalPrice: '$59.99',
    rarity: 'LEGENDARY WEAPON',
    discount: '-60% OFF',
    timer: '1D 12:30:45'
  },
  {
    id: 'tank-turret',
    title: 'Tank Turret',
    currentPrice: '$20.00',
    originalPrice: '$39.99',
    rarity: 'MYTHICAL WEAPON',
    discount: '-50% OFF',
    timer: '2D 06:48:36'
  },
  {
    id: 'plasma-rifle',
    title: 'Plasma Rifle',
    currentPrice: '$15.99',
    originalPrice: '$31.99',
    rarity: 'RARE WEAPON',
    discount: '-50% OFF',
    timer: '3D 14:22:10'
  }
];

export default function TestGridPage(): JSX.Element {
  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-white text-3xl font-bold mb-8">Test Dynamic Grid</h1>

        <div className="space-y-8">
          {/* Adaptive Grid (default behavior) */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-white text-xl font-semibold mb-4">Adaptive Grid (2 items)</h2>
            <Grid>
              {mockOffers.slice(0, 2).map((offer) => (
                <OfferCard key={offer.id} {...offer} />
              ))}
            </Grid>
          </div>

          {/* Adaptive Grid with 3 items */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-white text-xl font-semibold mb-4">Adaptive Grid (3 items)</h2>
            <Grid>
              {mockOffers.map((offer) => (
                <OfferCard key={offer.id} {...offer} />
              ))}
            </Grid>
          </div>

          {/* Non-adaptive Grid */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-white text-xl font-semibold mb-4">Non-adaptive Grid (fixed auto-fill)</h2>
            <Grid adaptive={false}>
              {mockOffers.map((offer) => (
                <OfferCard key={offer.id} {...offer} />
              ))}
            </Grid>
          </div>

          {/* Custom min width */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-white text-xl font-semibold mb-4">Custom Min Width (200px)</h2>
            <Grid minItemWidth="200px">
              {mockOffers.map((offer) => (
                <OfferCard key={offer.id} {...offer} />
              ))}
            </Grid>
          </div>

          {/* Flex layout */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-white text-xl font-semibold mb-4">Flex Layout</h2>
            <Grid className="flex flex-col gap-4">
              {mockOffers.map((offer) => (
                <OfferCard key={offer.id} {...offer} />
              ))}
            </Grid>
          </div>
        </div>

        <div className="mt-8 bg-gray-800 p-6 rounded-lg">
          <h2 className="text-white text-xl font-semibold mb-4">Grid Behavior Explanation</h2>
          <div className="text-gray-300 space-y-2">
            <p><strong>1-2 items:</strong> Uses 1-2 columns (1fr each) - cards centered in cells</p>
            <p><strong>3-4 items:</strong> Uses up to 3 columns (1fr each) - cards centered in cells</p>
            <p><strong>5+ items:</strong> Uses auto-fill with minmax(minItemWidth, 1fr) - cards centered in cells</p>
            <p><strong>adaptive=false:</strong> Always uses auto-fill with fixed minItemWidth - cards centered in cells</p>
            <p><strong>Flex className:</strong> Switches to flexbox layout - full width</p>
            <p><strong>Gap:</strong> All grids now use gap-2 spacing</p>
            <p><strong>Alignment:</strong> Cards are now centered within their grid cells</p>
          </div>
        </div>
      </div>
    </div>
  );
}
