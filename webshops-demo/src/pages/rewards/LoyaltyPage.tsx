import { mockRewards } from '../../shared/mocks/data';

export default function LoyaltyPage() {
  return (
    <div>
      <h2>Loyalty Program (Mock)</h2>
      <div>Tier: {mockRewards.loyalty.tier}</div>
      <div>Points: {mockRewards.loyalty.points}</div>
    </div>
  );
}
