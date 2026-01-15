import { DailyRewardCard, DailyRewardsCardsGrid } from '../../src/modules/daily-rewards';

export default function DailyRewardsDemo() {
  // Demo data for different reward scenarios
  const demoRewards = [
    { id: '1', title: 'Day 1', description: 'Daily login reward', points: 100, type: 'points' as const, isActive: true },
    { id: '2', title: 'Day 2', description: 'Double points reward', points: 200, type: 'points' as const, isActive: false },
    { id: '3', title: 'Day 3', description: 'Triple points reward', points: 300, type: 'points' as const, isActive: false },
    { id: '4', title: 'Day 4', description: 'Bonus currency', points: 50, type: 'currency' as const, isActive: false },
    { id: '5', title: 'Day 5', description: 'Special item', points: 1, type: 'item' as const, isActive: false },
    { id: '6', title: 'Day 6', description: 'Mega points', points: 500, type: 'points' as const, isActive: false },
    { id: '7', title: 'Day 7', description: 'Weekly bonus', points: 1000, type: 'points' as const, isActive: false },
  ];

  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    backgroundColor: '#0F172A',
    color: '#F8FAFC',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '32px',
    fontWeight: 700,
    marginBottom: '16px',
    background: 'linear-gradient(135deg, #60A5FA, #A855F7)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    textAlign: 'center',
  };

  const subtitleStyle: React.CSSProperties = {
    color: '#94A3B8',
    fontSize: '16px',
    marginBottom: '40px',
    textAlign: 'center',
    maxWidth: '600px',
  };

  const sectionStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '1200px',
    marginBottom: '40px',
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 600,
    marginBottom: '20px',
    color: '#F8FAFC',
    textAlign: 'center',
  };

  const individualCardsStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '20px',
    justifyContent: 'center',
    marginBottom: '40px',
  };

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>🎯 Daily Rewards Demo</h1>
      <p style={subtitleStyle}>
        Demonstration of DailyRewardCard and DailyRewardsCardsGrid components
      </p>

      {/* Individual Cards Section */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Individual Cards</h2>
        <div style={individualCardsStyle}>
          {demoRewards.slice(0, 4).map((reward) => (
            <DailyRewardCard
              key={reward.id}
              title={reward.title}
              description={reward.description}
              points={reward.points}
              type={reward.type}
              isActive={reward.isActive}
            />
          ))}
        </div>
      </div>

      {/* Grid Layout Section */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Grid Layout (7 Days)</h2>
        <DailyRewardsCardsGrid rewards={demoRewards} />
      </div>

      {/* Different Multipliers Section */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Different Multipliers</h2>
        <div style={individualCardsStyle}>
          <DailyRewardCard title="Day 1" description="Basic reward" points={100} type="points" isActive={true} />
          <DailyRewardCard title="Day 2" description="Double reward" points={200} type="points" isActive={false} />
          <DailyRewardCard title="Day 3" description="Triple reward" points={300} type="points" isActive={false} />
          <DailyRewardCard title="Day 7" description="Weekly bonus" points={1000} type="points" isActive={false} />
        </div>
      </div>
    </div>
  );
}