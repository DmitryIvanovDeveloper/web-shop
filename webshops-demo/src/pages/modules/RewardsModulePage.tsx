import ScenarioRunner from '../../shared/ui/ScenarioRunner';
import SpecLinkButton from '../../shared/ui/SpecLinkButton';
import { useEffect, useState } from 'react';
import type { Step } from '../../shared/ui/ScenarioRunner';
import { useAppStore } from '../../app/store/AppStore';
import { useScenario } from '../../app/store/ScenarioContext';

const steps: Step[] = [
  { kind: 'info', title: 'Daily Reward Available', description: 'Player can claim today reward' },
  { kind: 'form', title: 'Claim Daily Reward', fields: [
    { name: 'playerId', label: 'Player ID', required: true }
  ], actionLabel: 'Claim' }
];

export default function RewardsModulePage() {
  const { state, dispatch } = useAppStore();
  const { selectedScenario, setSelectedScenario } = useScenario();
  const [claim, setClaim] = useState({ playerId: '', agree: false, success: false });
  const [showPopup, setShowPopup] = useState(false);
  const triggerRewardPopup = (): void => {
    setShowPopup(true);
    window.setTimeout(() => setShowPopup(false), 1600);
  };
  const scenarios = [
    { title: 'Daily Reward Available', steps: [steps[0]] },
    { title: 'Claim Daily Reward', steps: [steps[1]] },
  ];

  // Guard selectedScenario to avoid out-of-range access when switching modules
  const safeIndex = selectedScenario !== null && (selectedScenario < 0 || selectedScenario >= scenarios.length)
    ? 0
    : selectedScenario;

  useEffect(() => {
    if (selectedScenario !== null && (selectedScenario < 0 || selectedScenario >= scenarios.length)) {
      setSelectedScenario(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedScenario, scenarios.length]);

  // Filter scenarios based on selection
  const displayScenarios = safeIndex !== null ? [scenarios[safeIndex]] : scenarios;

  return (
    <div style={{ display: 'grid', gap: 16, maxWidth: '100%', overflow: 'hidden' }}>
      {displayScenarios.map((sc, i) => {
        const realIndex = safeIndex !== null ? safeIndex : i;
        return (
        <div id={`sc-${realIndex + 1}`} key={realIndex} style={{ border: '1px solid #1b2536', borderRadius: 8, padding: 12 }}>
          {realIndex === 0 ? (
            <div>
              <h3 style={{ margin: 0, marginBottom: 8, display:'flex', alignItems:'center', gap:8 }}>
                <span>{sc.title}</span>
                <SpecLinkButton moduleName="Rewards" scenarioTitle={sc.title} />
              </h3>
              <p style={{ color: '#9fb3d9', marginTop: 0 }}>Daily rewards calendar showing available rewards for each day of the month.</p>
              
              <h4 style={{ color: '#fff', margin: '16px 0 12px 0' }}>Daily Rewards Calendar</h4>
              <div style={{ 
                display: 'grid', 
                gap: 12, 
                gridTemplateColumns: 'repeat(6, 1fr)',
                padding: 16,
                background: '#0f1a2c',
                borderRadius: 8,
                border: '1px solid #2b3952'
              }}>
                <DailyRewardCard day={1} reward="Coins" icon="🪙" quantity="x10" claimed={true} />
                <DailyRewardCard day={2} reward="XP Booster 100%" icon="🎖️" quantity="x3" claimed={true} />
                <DailyRewardCard day={3} reward="Keys" icon="🗝️" quantity="x10" claimed={true} />
                <DailyRewardCard day={4} reward="Coins" icon="🪙" quantity="x10" claimed={false} />
                <DailyRewardCard day={5} reward="Coupons" icon="🎫" quantity="x10" claimed={false} />
                <DailyRewardCard day={6} reward="Pass Tickets" icon="🎟️" quantity="x10" claimed={false} />
                
                <DailyRewardCard day={7} reward="Diamonds" icon="💎" quantity="x7" claimed={false} />
                <DailyRewardCard day={8} reward="Hub Chest" icon="📦" quantity="x1" claimed={false} />
                <DailyRewardCard day={9} reward="Coins" icon="🪙" quantity="x15" claimed={false} />
                <DailyRewardCard day={10} reward="XP Booster 200%" icon="🎖️" quantity="x3" claimed={false} special={true} />
                <DailyRewardCard day={11} reward="Keys" icon="🗝️" quantity="x15" claimed={false} />
                <DailyRewardCard day={12} reward="Diamonds" icon="💎" quantity="x7" claimed={false} />
                
                <DailyRewardCard day={13} reward="Coupons" icon="🎫" quantity="x10" claimed={false} />
                <DailyRewardCard day={14} reward="Pass Tickets" icon="🎟️" quantity="x10" claimed={false} />
                <DailyRewardCard day={15} reward="Diamonds" icon="💎" quantity="x15" claimed={false} />
                <DailyRewardCard day={16} reward="Hub Chest" icon="📦" quantity="x1" claimed={false} />
                <DailyRewardCard day={17} reward="Coins" icon="🪙" quantity="x15" claimed={false} />
                <DailyRewardCard day={18} reward="XP Booster 100%" icon="🎖️" quantity="x3" claimed={false} special={true} />
              </div>

              <div style={{ marginTop: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
                <button
                  onClick={() => {
                    if (!state.rewards.dailyAvailable) return;
                    dispatch({ type: 'CLAIM_DAILY_REWARD' });
                    triggerRewardPopup();
                  }}
                  disabled={!state.rewards.dailyAvailable}
                  style={{
                    background: state.rewards.dailyAvailable ? '#fbbf24' : '#374151',
                    color: state.rewards.dailyAvailable ? '#000' : '#9ca3af',
                    border: 'none',
                    borderRadius: 6,
                    padding: '10px 20px',
                    cursor: state.rewards.dailyAvailable ? 'pointer' : 'not-allowed',
                    fontWeight: 600
                  }}
                >
                  {state.rewards.dailyAvailable ? 'Claim Day 4 Reward' : 'Already Claimed Today'}
                </button>
                <div style={{ color: '#9fb3d9', fontSize: '14px' }}>
                  Next reward in: <strong style={{ color: '#fff' }}>08:42:15</strong>
                </div>
              </div>
            </div>
          ) : realIndex === 1 ? (
            <div>
              <h3 style={{ margin: 0, marginBottom: 8, display:'flex', alignItems:'center', gap:8 }}>
                <span>{sc.title}</span>
                <SpecLinkButton moduleName="Rewards" scenarioTitle={sc.title} />
              </h3>
              <p style={{ color: '#9fb3d9', marginTop: 0 }}>Confirm your Player ID and claim today’s reward.</p>
              <div style={{ display: 'grid', gap: 16, gridTemplateColumns: '1fr 1fr' }}>
                {/* Left: Today reward preview */}
                <div style={{ padding: 16, background: '#0f1a2c', borderRadius: 8, border: '1px solid #2b3952' }}>
                  <div style={{ color: '#9fb3d9', marginBottom: 8 }}>Today’s Reward</div>
                  <div style={{ 
                    padding: 16,
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    <div style={{ fontSize: 24, textAlign: 'center' }}>🪙</div>
                    <div style={{ color: '#fff', fontWeight: 700, textAlign: 'center', marginTop: 8 }}>Coins</div>
                    <div style={{ color: '#fbbf24', fontWeight: 800, textAlign: 'center', marginTop: 4 }}>x100</div>
                  </div>
                  <div style={{ marginTop: 12, color: '#9fb3d9', fontSize: 12 }}>
                    Status: {state.rewards.dailyAvailable ? <span style={{ color: '#4ade80' }}>Available</span> : <span style={{ color: '#9ca3af' }}>Claimed</span>}
                  </div>
                </div>

                {/* Right: Claim form */}
                <div style={{ padding: 16, background: '#0f1a2c', borderRadius: 8, border: '1px solid #2b3952' }}>
                  <div style={{ color: '#9fb3d9', marginBottom: 8 }}>Confirm Identity</div>
                  <div>
                    <label style={{ display: 'block', color: '#9fb3d9', fontSize: 12, marginBottom: 6 }}>Player ID *</label>
                    <input
                      value={claim.playerId}
                      onChange={(e) => setClaim({ ...claim, playerId: e.target.value })}
                      placeholder="e.g. PG-12345"
                      style={{
                        width: '100%', boxSizing: 'border-box', padding: 12,
                        background: '#11253f', color: '#e7f0ff',
                        border: '1px solid #2b3952', borderRadius: 8, outlineColor: '#2e68ff'
                      }}
                    />
                  </div>
                  <div style={{ marginTop: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input type="checkbox" checked={claim.agree} onChange={(e) => setClaim({ ...claim, agree: e.target.checked })} />
                    <span style={{ color: '#9fb3d9', fontSize: 12 }}>I agree with Privacy Policy and Terms</span>
                  </div>

                  {claim.success && (
                    <div style={{ marginTop: 10, color: '#4ade80', fontSize: 13 }}>Reward claimed! +100 Coins added.</div>
                  )}

                  <button
                  onClick={() => {
                      if (!state.rewards.dailyAvailable) return;
                      dispatch({ type: 'CLAIM_DAILY_REWARD' });
                      setClaim((c) => ({ ...c, success: true }));
                      triggerRewardPopup();
                    }}
                    disabled={!state.rewards.dailyAvailable || !claim.playerId || !claim.agree}
                    style={{
                      marginTop: 12,
                      background: (!state.rewards.dailyAvailable || !claim.playerId || !claim.agree) ? '#374151' : '#fbbf24',
                      color: (!state.rewards.dailyAvailable || !claim.playerId || !claim.agree) ? '#9ca3af' : '#000',
                      border: 'none', borderRadius: 6, padding: '10px 16px', fontWeight: 700, cursor: (!state.rewards.dailyAvailable || !claim.playerId || !claim.agree) ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {state.rewards.dailyAvailable ? 'Claim Now' : 'Already Claimed'}
                  </button>
                </div>
              </div>
            </div>
          ) : realIndex === 1 ? (
            <div>
              <h3 style={{ margin: 0, marginBottom: 8 }}>{sc.title}</h3>
              <p style={{ color: '#9fb3d9', marginTop: 0 }}>Confirm your Player ID and claim today’s reward.</p>
              <div style={{ display: 'grid', gap: 16, gridTemplateColumns: '1fr 1fr' }}>
                {/* Left: Today reward preview */}
                <div style={{ padding: 16, background: '#0f1a2c', borderRadius: 8, border: '1px solid #2b3952' }}>
                  <div style={{ color: '#9fb3d9', marginBottom: 8 }}>Today’s Reward</div>
                  <div style={{ 
                    padding: 16,
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    <div style={{ fontSize: 24, textAlign: 'center' }}>🪙</div>
                    <div style={{ color: '#fff', fontWeight: 700, textAlign: 'center', marginTop: 8 }}>Coins</div>
                    <div style={{ color: '#fbbf24', fontWeight: 800, textAlign: 'center', marginTop: 4 }}>x100</div>
                  </div>
                  <div style={{ marginTop: 12, color: '#9fb3d9', fontSize: 12 }}>
                    Status: {state.rewards.dailyAvailable ? <span style={{ color: '#4ade80' }}>Available</span> : <span style={{ color: '#9ca3af' }}>Claimed</span>}
                  </div>
                </div>

                {/* Right: Claim form */}
                <div style={{ padding: 16, background: '#0f1a2c', borderRadius: 8, border: '1px solid #2b3952' }}>
                  <div style={{ color: '#9fb3d9', marginBottom: 8 }}>Confirm Identity</div>
                  <div>
                    <label style={{ display: 'block', color: '#9fb3d9', fontSize: 12, marginBottom: 6 }}>Player ID *</label>
                    <input
                      value={claim.playerId}
                      onChange={(e) => setClaim({ ...claim, playerId: e.target.value })}
                      placeholder="e.g. PG-12345"
                      style={{
                        width: '100%', boxSizing: 'border-box', padding: 12,
                        background: '#11253f', color: '#e7f0ff',
                        border: '1px solid #2b3952', borderRadius: 8, outlineColor: '#2e68ff'
                      }}
                    />
                  </div>
                  <div style={{ marginTop: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input type="checkbox" checked={claim.agree} onChange={(e) => setClaim({ ...claim, agree: e.target.checked })} />
                    <span style={{ color: '#9fb3d9', fontSize: 12 }}>I agree with Privacy Policy and Terms</span>
                  </div>

                  {claim.success && (
                    <div style={{ marginTop: 10, color: '#4ade80', fontSize: 13 }}>Reward claimed! +100 Coins added.</div>
                  )}

                  <button
                    onClick={() => {
                      if (!state.rewards.dailyAvailable) return;
                      dispatch({ type: 'CLAIM_DAILY_REWARD' });
                      setClaim((c) => ({ ...c, success: true }));
                    }}
                    disabled={!state.rewards.dailyAvailable || !claim.playerId || !claim.agree}
                    style={{
                      marginTop: 12,
                      background: (!state.rewards.dailyAvailable || !claim.playerId || !claim.agree) ? '#374151' : '#fbbf24',
                      color: (!state.rewards.dailyAvailable || !claim.playerId || !claim.agree) ? '#9ca3af' : '#000',
                      border: 'none', borderRadius: 6, padding: '10px 16px', fontWeight: 700, cursor: (!state.rewards.dailyAvailable || !claim.playerId || !claim.agree) ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {state.rewards.dailyAvailable ? 'Claim Now' : 'Already Claimed'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <ScenarioRunner
              title={sc.title}
              intro={undefined}
              steps={sc.steps}
              onStepNext={() => {
                if (realIndex === 1) dispatch({ type: 'CLAIM_DAILY_REWARD' });
              }}
              onFinish={() => {}}
            />
          )}
        </div>
        );
      })}
      {showPopup && (
        <div style={{
          position: 'fixed', inset: 0 as unknown as number, // TS-friendly inline for all sides
          background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#0f1a2c',
            border: '1px solid #2b3952',
            borderRadius: 12,
            padding: 24,
            width: 320,
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
            transform: 'scale(1)',
            transition: 'transform 150ms ease-out'
          }}>
            <div style={{ fontSize: 36 }}>🎉</div>
            <div style={{ color: '#fff', fontWeight: 800, marginTop: 8 }}>Reward Claimed!</div>
            <div style={{ color: '#fbbf24', fontWeight: 800, marginTop: 4 }}>+100 Coins</div>
            <div style={{ color: '#9fb3d9', fontSize: 12, marginTop: 8 }}>Added to your account</div>
          </div>
        </div>
      )}
      <div style={{ marginTop: 16, color: '#9fb3d9' }}>Daily Available: {state.rewards.dailyAvailable ? 'Yes' : 'No'}</div>
    </div>
  );
}

function DailyRewardCard({ 
  day, 
  reward, 
  icon, 
  quantity, 
  claimed, 
  special = false 
}: {
  day: number;
  reward: string;
  icon: string;
  quantity: string;
  claimed: boolean;
  special?: boolean;
}) {
  return (
    <div style={{ 
      background: claimed 
        ? 'linear-gradient(135deg, #374151 0%, #1f2937 100%)'
        : special 
        ? 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)'
        : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
      borderRadius: 8,
      padding: 12,
      position: 'relative',
      minHeight: 120,
      border: claimed ? '1px solid #4b5563' : '1px solid rgba(255,255,255,0.1)',
      opacity: claimed ? 0.6 : 1,
      textAlign: 'center'
    }}>
      {/* Day Number */}
      <div style={{
        position: 'absolute',
        top: 4,
        left: 8,
        color: '#fff',
        fontSize: '10px',
        fontWeight: 700
      }}>
        DAY {day}
      </div>

      {/* Lock Icon */}
      {claimed && (
        <div style={{
          position: 'absolute',
          bottom: 8,
          right: 8,
          color: '#9ca3af',
          fontSize: '12px'
        }}>
          🔒
        </div>
      )}

      {/* Reward Content */}
      <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <div style={{ fontSize: '24px', marginBottom: 4 }}>
          {icon}
        </div>
        <div style={{ 
          color: '#fff', 
          fontSize: '11px', 
          fontWeight: 600,
          textAlign: 'center',
          lineHeight: 1.2
        }}>
          {reward}
        </div>
        <div style={{
          color: special ? '#fbbf24' : '#fff',
          fontSize: '12px',
          fontWeight: 700,
          marginTop: 4
        }}>
          {quantity}
        </div>
      </div>
    </div>
  );
}
