import { mockRewards } from '../../shared/mocks/data';

export default function DailyRewardsPage() {
  return (
    <div>
      <h2>Daily Rewards (Mock)</h2>
      <div>Available: {mockRewards.daily.available ? 'Yes' : 'No'}</div>
      <div>Reward: {mockRewards.daily.reward.type} +{mockRewards.daily.reward.amount}</div>
    </div>
  );
}
