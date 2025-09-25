export const mockCampaigns = [
  { id: 'cmp-1', name: 'Fall Sale', status: 'active', discount: 20 },
  { id: 'cmp-2', name: 'Welcome Back', status: 'scheduled', discount: 15 }
];

export const mockSkus = [
  { id: 'sku-1', title: 'Gem Pack Small', price: 4.99, inventory: 999 },
  { id: 'sku-2', title: 'Gem Pack Large', price: 19.99, inventory: 250 }
];

export const mockRewards = {
  daily: { available: true, reward: { type: 'coins', amount: 100 } },
  loyalty: { tier: 'Gold', points: 1250 }
};

export const mockSegments = [
  { id: 'seg-1', name: 'High Spenders', size: 1240 },
  { id: 'seg-2', name: 'New Users', size: 8420 }
];

export const mockPatchNotes = [
  { version: '1.2.0', date: '2025-09-01', changes: ['New shop layout', 'Performance improvements'] },
  { version: '1.1.0', date: '2025-08-15', changes: ['Added loyalty tiers', 'Bug fixes'] }
];
