export default function RewardsScenariosPage() {
  const list = [
    'Daily Rewards: claim flow',
    'Loyalty Program: tiers, points management'
  ];
  return (
    <div>
      <h3>Rewards — User Scenarios (Mock)</h3>
      <ul>{list.map((s, i) => (<li key={i}>{s}</li>))}</ul>
    </div>
  );
}
