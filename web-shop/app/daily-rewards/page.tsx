import { DailyRewardsCardsGrid, DailyRewardCard } from '../../src/modules/daily-rewards/interface-adapters/ui';

export default function DailyRewardsPage() {
  // Demo data for daily rewards
  const demoRewards = [
    { day: 1, multiplier: 1 },
    { day: 2, multiplier: 2 },
    { day: 3, multiplier: 3 },
    { day: 4, multiplier: 5 },
    { day: 5, multiplier: 8 },
    { day: 6, multiplier: 13 },
    { day: 7, multiplier: 21 },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0F172A', color: '#F8FAFC', padding: '24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, textAlign: 'center', marginBottom: '24px' }}>
          🎯 Daily Rewards
        </h1>

        <p style={{ textAlign: 'center', color: '#94A3B8', marginBottom: '40px' }}>
          Collect daily rewards to enhance your gaming experience!
        </p>

        {/* Grid of reward cards */}
        <DailyRewardsCardsGrid rewards={demoRewards} />

        {/* Individual card examples */}
        <div style={{ marginTop: '40px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 600, textAlign: 'center', marginBottom: '20px' }}>
            Individual Cards
          </h2>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '20px',
            justifyContent: 'center'
          }}>
            <DailyRewardCard day={1} multiplier={1} />
            <DailyRewardCard day={2} multiplier={10} />
            <DailyRewardCard day={3} multiplier={50} />
            <DailyRewardCard day={7} multiplier={100} />
          </div>
        </div>
      </div>
    </div>
  );
}
