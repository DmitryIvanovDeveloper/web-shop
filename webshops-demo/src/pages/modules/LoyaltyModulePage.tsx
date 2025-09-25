import { useScenario } from '../../app/store/ScenarioContext';
import { useAppStore } from '../../app/store/AppStore';
import { useState } from 'react';

export default function LoyaltyModulePage() {
  const { state, dispatch } = useAppStore();
  const { selectedScenario } = useScenario();

  const [earn, setEarn] = useState<string>('');
  const [redeem, setRedeem] = useState<string>('');

  const scenarios = [
    { title: 'Earn Points' },
    { title: 'Tiers Overview' },
    { title: 'Rules Explainer' },
    { title: 'Redeem Options' },
  ];

  const displayScenarios = selectedScenario !== null ? [scenarios[selectedScenario]] : scenarios;

  const tiers = [
    { name: 'Bronze', min: 0, max: 999, color: '#9ca3af' },
    { name: 'Silver', min: 1000, max: 2999, color: '#c0c7d1' },
    { name: 'Gold', min: 3000, max: 5999, color: '#fbbf24' },
    { name: 'Platinum', min: 6000, max: 9999, color: '#93c5fd' },
    { name: 'Diamond', min: 10000, max: 999999, color: '#67e8f9' },
  ];

  const currentPts = Number(state.rewards.points) || 0;
  const currentTier = tiers.find(t => currentPts >= t.min && currentPts <= t.max) || tiers[0];
  const span = Math.max(1, currentTier.max - currentTier.min);
  const pct = Math.min(100, Math.round(((currentPts - currentTier.min) / span) * 100));

  return (
    <div style={{ display: 'grid', gap: 16, maxWidth: '100%', overflow: 'hidden' }}>
      {displayScenarios.map((_, i) => {
        const realIndex = selectedScenario !== null ? selectedScenario : i;
        return (
          <div id={`sc-${realIndex + 1}`} key={realIndex} style={{ border: '1px solid #1b2536', borderRadius: 8, padding: 12 }}>
            {realIndex === 0 ? (
              <div>
                <h3 style={{ margin: 0, marginBottom: 8 }}>Earn Points</h3>
                <p style={{ color:'#9fb3d9', marginTop:0 }}>Visual progress to next tier and quick earn actions.</p>
                <div style={{ display:'grid', gap:12, gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))' }}>
                  <div style={{ padding:12, border:'1px solid #2b3952', borderRadius:8 }}>
                    <div style={{ color:'#9fb3d9', fontSize:12 }}>Current Points</div>
                    <div style={{ fontSize:26, fontWeight:800 }}>{currentPts}</div>
                    <div style={{ color:'#9fb3d9', fontSize:12, marginTop:8 }}>Tier</div>
                    <div style={{ fontSize:20, fontWeight:700, color: currentTier.color }}>{currentTier.name}</div>
                    <div style={{ marginTop:12 }}>
                      <div style={{ color:'#9fb3d9', fontSize:12, marginBottom:6 }}>Progress to next tier</div>
                      <div style={{ height:10, background:'#0f1a2c', borderRadius:999, overflow:'hidden', border:'1px solid #2b3952' }}>
                        <div style={{ width: pct + '%', height:'100%', background:'#2e68ff' }} />
                      </div>
                      <div style={{ color:'#9fb3d9', fontSize:12, marginTop:6 }}>{pct}%</div>
                    </div>
                  </div>
                  <div style={{ padding:12, border:'1px solid #2b3952', borderRadius:8 }}>
                    <div style={{ color:'#9fb3d9', marginBottom:8 }}>Quick Earn (mock)</div>
                    <button onClick={()=>dispatch({ type:'ADD_LOYALTY_POINTS', points: 50 })} style={{ background:'#2e68ff', color:'#fff', border:'none', borderRadius:6, padding:'8px 12px', fontWeight:700, cursor:'pointer' }}>Complete Tutorial +50</button>
                    <div style={{ height:8 }} />
                    <button onClick={()=>dispatch({ type:'ADD_LOYALTY_POINTS', points: 100 })} style={{ background:'#22c55e', color:'#0a0f19', border:'none', borderRadius:6, padding:'8px 12px', fontWeight:700, cursor:'pointer' }}>Purchase Pack +100</button>
                    <div style={{ height:8 }} />
                    <label style={{ display:'block', color:'#9fb3d9', fontSize:12, marginBottom:6 }}>Custom Earn *</label>
                    <input value={earn} onChange={(e)=>setEarn(e.target.value)} type="number" placeholder="e.g. 25" style={{ width:'100%', padding:10, background:'#11253f', color:'#e7f0ff', border:'1px solid #2b3952', borderRadius:8 }} />
                    <div style={{ height:8 }} />
                    <button disabled={!(Number(earn) > 0)} onClick={()=>{ const v=Number(earn); if(!isNaN(v)&&v>0) dispatch({ type:'ADD_LOYALTY_POINTS', points: v }); }} style={{ background:(Number(earn)>0)?'#fbbf24':'#374151', color:(Number(earn)>0)?'#000':'#9ca3af', border:'none', borderRadius:6, padding:'8px 12px', fontWeight:700, cursor:(Number(earn)>0)?'pointer':'not-allowed' }}>Add Custom</button>
                  </div>
                </div>
              </div>
            ) : realIndex === 1 ? (
              <div>
                <h3 style={{ margin: 0, marginBottom: 8 }}>Tiers Overview</h3>
                <div style={{ display:'grid', gap:12, gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))' }}>
                  {tiers.map(t => (
                    <div key={t.name} style={{ padding:12, border:'1px solid #2b3952', borderRadius:8, background:'#0f1829' }}>
                      <div style={{ fontWeight:800, color:t.color }}>{t.name}</div>
                      <div style={{ color:'#9fb3d9', fontSize:12, marginTop:4 }}>Threshold: {t.min}‑{t.max === 999999 ? '∞' : t.max}</div>
                      <ul style={{ margin: '8px 0 0 16px', color:'#d1d5db', fontSize:12 }}>
                        <li>Bonus rewards</li>
                        <li>Exclusive offers</li>
                        <li>Priority support</li>
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ) : realIndex === 2 ? (
              <div>
                <h3 style={{ margin: 0, marginBottom: 8 }}>Rules Explainer</h3>
                <div style={{ padding:12, border:'1px solid #2b3952', borderRadius:8, background:'#0f1829' }}>
                  <div style={{ color:'#9fb3d9', marginBottom:8 }}>How you earn points</div>
                  <ul style={{ margin:0 }}>
                    <li>Daily login: +10</li>
                    <li>Complete tutorial: +50</li>
                    <li>Purchase items: +1 per $1</li>
                  </ul>
                  <div style={{ height:10 }} />
                  <div style={{ color:'#9fb3d9', marginBottom:8 }}>Spending & expiration</div>
                  <ul style={{ margin:0 }}>
                    <li>Redeem for rewards anytime</li>
                    <li>Points never reduce your tier</li>
                    <li>Points expire after 12 months of inactivity</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div>
                <h3 style={{ margin: 0, marginBottom: 8 }}>Redeem Options</h3>
                <div style={{ display:'grid', gap:12, gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))' }}>
                  <div style={{ padding:12, border:'1px solid #2b3952', borderRadius:8 }}>
                    <div style={{ color:'#9fb3d9', marginBottom:8 }}>Choose reward</div>
                    <select value={redeem} onChange={(e)=>setRedeem(e.target.value)} style={{ width:'100%', padding:10, background:'#11253f', color:'#e7f0ff', border:'1px solid #2b3952', borderRadius:8 }}>
                      <option value="">Select</option>
                      <option value="coins100">100 Coins (100 pts)</option>
                      <option value="skin">Exclusive Skin (1200 pts)</option>
                      <option value="vip">VIP Pass 7d (2000 pts)</option>
                    </select>
                    <div style={{ height:8 }} />
                    <button disabled={!redeem} style={{ background:(!redeem)?'#374151':'#2e68ff', color:'#fff', border:'none', borderRadius:6, padding:'8px 12px', fontWeight:700, cursor:(!redeem)?'not-allowed':'pointer' }}>Redeem</button>
                  </div>
                  <div style={{ padding:12, border:'1px solid #2b3952', borderRadius:8 }}>
                    <div style={{ color:'#9fb3d9', marginBottom:8 }}>Impact (mock)</div>
                    <div>Current points: {currentPts}</div>
                    <div>Tier remains: {currentTier.name}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}


