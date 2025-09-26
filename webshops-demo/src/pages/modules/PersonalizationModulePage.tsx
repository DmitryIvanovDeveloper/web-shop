import type { Step } from '../../shared/ui/ScenarioRunner';
import SpecLinkButton from '../../shared/ui/SpecLinkButton';
import { useScenario } from '../../app/store/ScenarioContext';
import { useEffect } from 'react';
import { useState } from 'react';

const steps: Step[] = [
  { kind: 'form', title: 'Create Rule', description: 'Define rule', fields: [
    { name: 'trigger', label: 'Trigger', type: 'select', required: true, options: [
      { label: 'On Login', value: 'login' },
      { label: 'On Purchase', value: 'purchase' },
      { label: 'On Abandoned Cart', value: 'abandoned-cart' }
    ] },
    { name: 'condition', label: 'Condition', required: true },
    { name: 'action', label: 'Action', required: true }
  ] },
  { kind: 'form', title: 'Segment Users', description: 'Build segment', fields: [
    { name: 'criteria', label: 'Criteria', required: true },
    { name: 'minValue', label: 'Min Value', type: 'number' }
  ] },
  { kind: 'form', title: 'Generate Offer', description: 'Craft AI offer', fields: [
    { name: 'offerType', label: 'Offer Type', type: 'select', options: [
      { label: 'Discount', value: 'discount' },
      { label: 'Bundle', value: 'bundle' }
    ] },
    { name: 'value', label: 'Value', type: 'number' }
  ] },
  { kind: 'confirm', title: 'Execute Automation', summary: { result: 'Workflow scheduled (mock)' } }
];

export default function PersonalizationModulePage() {
  const { selectedScenario, setSelectedScenario } = useScenario();
  const [rule, setRule] = useState<{ trigger: string; condition: string; action: string }>({ trigger: 'login', condition: '', action: '' });
  const [segment, setSegment] = useState<{ criteria: string; minValue?: string }>({ criteria: '' });
  const [offer, setOffer] = useState<{ type?: 'discount'|'bundle'; value?: string }>({});
  const [log, setLog] = useState<string[]>([]);
  // Decision Simulator state (mock Feature Store)
  const [user, setUser] = useState<{ country: string; rfm: number; arpu: 'low'|'mid'|'high'; churn: 'low'|'mid'|'high'; timeSinceAbandonH: number; basketValue: number; hasEmail: boolean; hasPush: boolean; stockOK: boolean }>({ country: 'US', rfm: 55, arpu: 'mid', churn: 'mid', timeSinceAbandonH: 0, basketValue: 0, hasEmail: true, hasPush: true, stockOK: true });
  type Rule = { id: string; name: string; priority: number; condition: (u: typeof user) => boolean; offer: { type: 'discount'|'bundle'|'reminder'; value: number; code?: string; channel?: 'push'|'email'|'inapp' }; expectedLift: number };
  const [rules] = useState<Rule[]>([
    { id: 'r1', name: 'Win-back High Churn', priority: 100, condition: (u)=> u.churn==='high' && u.rfm<40, offer: { type: 'discount', value: 20, code: 'WIN20' }, expectedLift: 0.25 },
    { id: 'r2', name: 'Upsell High ARPU', priority: 80, condition: (u)=> u.arpu==='high' && u.rfm>70, offer: { type: 'bundle', value: 0 }, expectedLift: 0.18 },
    { id: 'r3', name: 'Geo DE', priority: 60, condition: (u)=> u.country==='DE', offer: { type: 'discount', value: 10, code: 'EU10' }, expectedLift: 0.07 },
    { id: 'r4', name: 'New/Low Activity', priority: 50, condition: (u)=> u.rfm<30, offer: { type: 'discount', value: 15, code: 'START15' }, expectedLift: 0.12 },
    // Abandoned cart rules
    { id: 'ac1', name: 'Soft Remind 1h', priority: 70, condition: (u)=> u.timeSinceAbandonH>=1 && u.timeSinceAbandonH<24 && u.stockOK, offer: { type: 'reminder', value: 0, channel: 'push' }, expectedLift: 0.06 },
    { id: 'ac2', name: 'Incentive 24h High Churn', priority: 85, condition: (u)=> u.timeSinceAbandonH>=24 && u.timeSinceAbandonH<72 && u.churn==='high' && u.stockOK, offer: { type: 'discount', value: 10, code: 'BACK10' }, expectedLift: 0.18 },
    { id: 'ac3', name: 'Final Ping 72h', priority: 65, condition: (u)=> u.timeSinceAbandonH>=72 && u.stockOK, offer: { type: 'reminder', value: 0, channel: 'email' }, expectedLift: 0.04 },
  ]);
  const [decision, setDecision] = useState<{ winner?: Rule; eligible: Rule[]; reason?: string }>({ eligible: [] });
  const evaluate = () => {
    const eligible = rules.filter(r => r.condition(user));
    const winner = eligible.sort((a,b)=> b.priority - a.priority || b.expectedLift - a.expectedLift)[0];
    setDecision({ winner, eligible, reason: winner ? `Chosen by priority ${winner.priority}, expected lift ${Math.round(winner.expectedLift*100)}%` : 'No matching rules' });
  };
  const scenarios = [
    { title: 'Decision Simulator', steps: [] as unknown as Step[] },
    { title: 'Create Rule', steps: [steps[0]] },
    { title: 'Segment Users', steps: [steps[1]] },
    { title: 'Generate Offer', steps: [steps[2]] },
    { title: 'Execute Automation', steps: [steps[3]] },
  ];

  // Filter scenarios based on selection
  const safeIndex = selectedScenario !== null && (selectedScenario < 0 || selectedScenario >= scenarios.length)
    ? 0
    : selectedScenario;
  useEffect(() => {
    if (selectedScenario !== null && (selectedScenario < 0 || selectedScenario >= scenarios.length)) {
      setSelectedScenario(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedScenario, scenarios.length]);
  const displayScenarios = safeIndex !== null ? [scenarios[safeIndex]] : scenarios;

  return (
    <div style={{ display: 'grid', gap: 16, maxWidth: '100%', overflow: 'hidden' }}>
      {displayScenarios.map((_, i) => {
        const realIndex = selectedScenario !== null ? selectedScenario : i;
        return (
          <div id={`sc-${realIndex + 1}`} key={realIndex} style={{ border: '1px solid #1b2536', borderRadius: 8, padding: 12 }}>
            {realIndex === 0 ? (
              <div>
                <h3 style={{ margin: 0, marginBottom: 8, display:'flex', alignItems:'center', gap:8 }}>
                  <span>Decision Simulator</span>
                  <span style={{ marginLeft:'auto' }} />
                  <SpecLinkButton moduleName="Personalization" scenarioTitle="Decision Simulator" />
                </h3>
                <p style={{ color:'#9fb3d9', marginTop:0 }}>Simulate user features and see selected offer with explainability.</p>
                <div style={{ display:'grid', gap:12, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
                  <div style={{ padding:12, border:'1px solid #2b3952', borderRadius:8 }}>
                    <label style={{ display:'block', color:'#9fb3d9', fontSize:12, marginBottom:6 }}>Country</label>
                    <select value={user.country} onChange={(e)=>setUser({...user, country:e.target.value})} style={{ width:'100%', padding:10, background:'#11253f', color:'#e7f0ff', border:'1px solid #2b3952', borderRadius:8 }}>
                      <option value="US">US</option>
                      <option value="DE">DE</option>
                      <option value="BR">BR</option>
                      <option value="RU">RU</option>
                    </select>
                    <div style={{ height:8 }} />
                    <label style={{ display:'block', color:'#9fb3d9', fontSize:12, marginBottom:6 }}>RFM Score (0–100)</label>
                    <input type="number" min={0} max={100} value={user.rfm} onChange={(e)=>setUser({...user, rfm: Math.max(0, Math.min(100, Number(e.target.value)||0))})} style={{ width:'100%', padding:10, background:'#11253f', color:'#e7f0ff', border:'1px solid #2b3952', borderRadius:8 }} />
                    <div style={{ height:8 }} />
                    <label style={{ display:'block', color:'#9fb3d9', fontSize:12, marginBottom:6 }}>ARPU Tier</label>
                    <select value={user.arpu} onChange={(e)=>setUser({...user, arpu: e.target.value as any})} style={{ width:'100%', padding:10, background:'#11253f', color:'#e7f0ff', border:'1px solid #2b3952', borderRadius:8 }}>
                      <option value="low">low</option>
                      <option value="mid">mid</option>
                      <option value="high">high</option>
                    </select>
                    <div style={{ height:8 }} />
                    <label style={{ display:'block', color:'#9fb3d9', fontSize:12, marginBottom:6 }}>Churn Risk</label>
                    <select value={user.churn} onChange={(e)=>setUser({...user, churn: e.target.value as any})} style={{ width:'100%', padding:10, background:'#11253f', color:'#e7f0ff', border:'1px solid #2b3952', borderRadius:8 }}>
                      <option value="low">low</option>
                      <option value="mid">mid</option>
                      <option value="high">high</option>
                    </select>
                    <div style={{ height:10 }} />
                    <button onClick={evaluate} style={{ background:'#2e68ff', color:'#fff', border:'none', borderRadius:6, padding:'8px 12px', fontWeight:700, cursor:'pointer' }}>Evaluate</button>
                  </div>
                  <div style={{ padding:12, border:'1px solid #2b3952', borderRadius:8 }}>
                    <div style={{ color:'#9fb3d9', marginBottom:8 }}>Eligible Rules</div>
                    {decision.eligible.length === 0 ? (
                      <div style={{ color:'#9fb3d9', fontSize:12 }}>No matches</div>
                    ) : (
                      <div style={{ display:'grid', gap:6 }}>
                        {decision.eligible.map(r => (
                          <div key={r.id} style={{ padding:'8px 10px', background:'#0f1a2c', border:'1px solid #2b3952', borderRadius:6 }}>
                            <div style={{ display:'flex', justifyContent:'space-between' }}>
                              <strong>{r.name}</strong>
                              <span style={{ color:'#9fb3d9', fontSize:12 }}>prio {r.priority} · lift {Math.round(r.expectedLift*100)}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div style={{ height:12 }} />
                    <div style={{ color:'#9fb3d9', marginBottom:6 }}>Decision</div>
                    {decision.winner ? (
                      <div style={{ padding:12, border:'1px solid #2b3952', borderRadius:8, background:'#0f1829' }}>
                        <div><strong>Offer:</strong> {decision.winner.offer.type} {decision.winner.offer.value}{decision.winner.offer.type==='discount' ? '%' : ''}</div>
                        {decision.winner.offer.code && (<div><strong>Code:</strong> {decision.winner.offer.code}</div>)}
                        <div style={{ color:'#9fb3d9', fontSize:12, marginTop:6 }}>{decision.reason}</div>
                      </div>
                    ) : (
                      <div style={{ color:'#9fb3d9', fontSize:12 }}>—</div>
                    )}
                  </div>
                </div>
                {/* Abandoned cart inputs */}
                <div style={{ marginTop: 12, display:'grid', gap:12, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
                  <div style={{ padding:12, border:'1px solid #2b3952', borderRadius:8 }}>
                    <label style={{ display:'block', color:'#9fb3d9', fontSize:12, marginBottom:6 }}>Time Since Abandon (hours)</label>
                    <input type="number" min={0} value={user.timeSinceAbandonH} onChange={(e)=>setUser({...user, timeSinceAbandonH: Math.max(0, Number(e.target.value)||0)})} style={{ width:'100%', padding:10, background:'#11253f', color:'#e7f0ff', border:'1px solid #2b3952', borderRadius:8 }} />
                    <div style={{ height:8 }} />
                    <label style={{ display:'block', color:'#9fb3d9', fontSize:12, marginBottom:6 }}>Basket Value ($)</label>
                    <input type="number" min={0} value={user.basketValue} onChange={(e)=>setUser({...user, basketValue: Math.max(0, Number(e.target.value)||0)})} style={{ width:'100%', padding:10, background:'#11253f', color:'#e7f0ff', border:'1px solid #2b3952', borderRadius:8 }} />
                  </div>
                  <div style={{ padding:12, border:'1px solid #2b3952', borderRadius:8 }}>
                    <div style={{ color:'#9fb3d9', marginBottom:6 }}>Channels & Stock</div>
                    <label style={{ display:'flex', gap:8, alignItems:'center', marginBottom:6 }}>
                      <input type="checkbox" checked={user.hasEmail} onChange={(e)=>setUser({...user, hasEmail: e.target.checked})} />
                      <span style={{ color:'#d1d5db', fontSize:12 }}>Has Email</span>
                    </label>
                    <label style={{ display:'flex', gap:8, alignItems:'center', marginBottom:6 }}>
                      <input type="checkbox" checked={user.hasPush} onChange={(e)=>setUser({...user, hasPush: e.target.checked})} />
                      <span style={{ color:'#d1d5db', fontSize:12 }}>Has Push</span>
                    </label>
                    <label style={{ display:'flex', gap:8, alignItems:'center' }}>
                      <input type="checkbox" checked={user.stockOK} onChange={(e)=>setUser({...user, stockOK: e.target.checked})} />
                      <span style={{ color:'#d1d5db', fontSize:12 }}>Stock OK</span>
                    </label>
                  </div>
                </div>
              </div>
            ) : realIndex === 1 ? (
              <div>
              <h3 style={{ margin: 0, marginBottom: 8, display:'flex', alignItems:'center', gap:8 }}>
                <span>Create Rule</span>
                <span style={{ marginLeft:'auto' }} />
                <SpecLinkButton moduleName="Personalization" scenarioTitle="Create Rule" />
              </h3>
                <div style={{ display:'grid', gap:12, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                  <div style={{ padding:12, border:'1px solid #2b3952', borderRadius:8 }}>
                    <label style={{ display:'block', color:'#9fb3d9', fontSize:12, marginBottom:6 }}>Trigger *</label>
                    <select value={rule.trigger} onChange={(e)=>setRule({...rule, trigger:e.target.value})} style={{ width:'100%', padding:10, background:'#11253f', color:'#e7f0ff', border:'1px solid #2b3952', borderRadius:8 }}>
                      <option value="login">On Login</option>
                      <option value="purchase">On Purchase</option>
                      <option value="abandoned-cart">On Abandoned Cart</option>
                    </select>
                    <div style={{ height:8 }} />
                    <label style={{ display:'block', color:'#9fb3d9', fontSize:12, marginBottom:6 }}>Condition *</label>
                    <input value={rule.condition} onChange={(e)=>setRule({...rule, condition:e.target.value})} placeholder="level > 5 AND country = US" style={{ width:'100%', padding:10, background:'#11253f', color:'#e7f0ff', border:'1px solid #2b3952', borderRadius:8 }} />
                    <div style={{ height:8 }} />
                    <label style={{ display:'block', color:'#9fb3d9', fontSize:12, marginBottom:6 }}>Action *</label>
                    <input value={rule.action} onChange={(e)=>setRule({...rule, action:e.target.value})} placeholder="show_popup('welcome-back')" style={{ width:'100%', padding:10, background:'#11253f', color:'#e7f0ff', border:'1px solid #2b3952', borderRadius:8 }} />
                    <div style={{ height:10 }} />
                    <button disabled={!rule.condition||!rule.action} onClick={()=>setLog(l=>[`Rule saved: ${rule.trigger}`, ...l])} style={{ background: (!rule.condition||!rule.action)?'#374151':'#2e68ff', color:'#fff', border:'none', borderRadius:6, padding:'8px 12px', fontWeight:700, cursor:(!rule.condition||!rule.action)?'not-allowed':'pointer' }}>Save Rule</button>
                  </div>
                  <div style={{ padding:12, border:'1px solid #2b3952', borderRadius:8 }}>
                    <div style={{ color:'#9fb3d9', marginBottom:8 }}>Activity Log (mock)</div>
                    <div style={{ display:'grid', gap:6 }}>
                      {log.map((l,idx)=>(<div key={idx} style={{ padding:'6px 8px', background:'#0f1a2c', border:'1px solid #2b3952', borderRadius:6 }}>{l}</div>))}
                    </div>
                  </div>
                </div>
              </div>
            ) : realIndex === 2 ? (
              <div>
              <h3 style={{ margin: 0, marginBottom: 8, display:'flex', alignItems:'center', gap:8 }}>
                <span>Segment Users</span>
                <span style={{ marginLeft:'auto' }} />
                <SpecLinkButton moduleName="Personalization" scenarioTitle="Segment Users" />
              </h3>
                <div style={{ display:'grid', gap:12, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
                  <div style={{ padding:12, border:'1px solid #2b3952', borderRadius:8 }}>
                    <label style={{ display:'block', color:'#9fb3d9', fontSize:12, marginBottom:6 }}>Criteria *</label>
                    <input value={segment.criteria} onChange={(e)=>setSegment({...segment, criteria:e.target.value})} placeholder="spend > 100 OR last_seen < 7d" style={{ width:'100%', padding:10, background:'#11253f', color:'#e7f0ff', border:'1px solid #2b3952', borderRadius:8 }} />
                    <div style={{ height:8 }} />
                    <label style={{ display:'block', color:'#9fb3d9', fontSize:12, marginBottom:6 }}>Min Value</label>
                    <input type="number" value={segment.minValue||''} onChange={(e)=>setSegment({...segment, minValue:e.target.value})} placeholder="10" style={{ width:'100%', padding:10, background:'#11253f', color:'#e7f0ff', border:'1px solid #2b3952', borderRadius:8 }} />
                    <div style={{ height:10 }} />
                    <button disabled={!segment.criteria} onClick={()=>setLog(l=>[`Segment saved: ${segment.criteria}`, ...l])} style={{ background: (!segment.criteria)?'#374151':'#2e68ff', color:'#fff', border:'none', borderRadius:6, padding:'8px 12px', fontWeight:700, cursor:(!segment.criteria)?'not-allowed':'pointer' }}>Save Segment</button>
                  </div>
                  <div style={{ padding:12, border:'1px solid #2b3952', borderRadius:8 }}>
                    <div style={{ color:'#9fb3d9', marginBottom:8 }}>Preview (mock)</div>
                    <ul style={{ margin:0 }}>
                      <li>Estimated users: 1,240</li>
                      <li>VIP share: 12%</li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : realIndex === 3 ? (
              <div>
              <h3 style={{ margin: 0, marginBottom: 8, display:'flex', alignItems:'center', gap:8 }}>
                <span>Generate Offer</span>
                <span style={{ marginLeft:'auto' }} />
                <SpecLinkButton moduleName="Personalization" scenarioTitle="Generate Offer" />
              </h3>
                <div style={{ display:'grid', gap:12, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
                  <div style={{ padding:12, border:'1px solid #2b3952', borderRadius:8 }}>
                    <label style={{ display:'block', color:'#9fb3d9', fontSize:12, marginBottom:6 }}>Offer Type</label>
                    <select value={offer.type||'discount'} onChange={(e)=>setOffer({...offer, type:e.target.value as any})} style={{ width:'100%', padding:10, background:'#11253f', color:'#e7f0ff', border:'1px solid #2b3952', borderRadius:8 }}>
                      <option value="discount">Discount</option>
                      <option value="bundle">Bundle</option>
                    </select>
                    <div style={{ height:8 }} />
                    <label style={{ display:'block', color:'#9fb3d9', fontSize:12, marginBottom:6 }}>Value</label>
                    <input type="number" value={offer.value||''} onChange={(e)=>setOffer({...offer, value:e.target.value})} placeholder="e.g. 20 (%)" style={{ width:'100%', padding:10, background:'#11253f', color:'#e7f0ff', border:'1px solid #2b3952', borderRadius:8 }} />
                    <div style={{ height:10 }} />
                    <button onClick={()=>setLog(l=>[`Offer generated: ${offer.type||'discount'} ${offer.value||'0'}`, ...l])} style={{ background:'#2e68ff', color:'#fff', border:'none', borderRadius:6, padding:'8px 12px', fontWeight:700, cursor:'pointer' }}>Generate</button>
                  </div>
                  <div style={{ padding:12, border:'1px solid #2b3952', borderRadius:8 }}>
                    <div style={{ color:'#9fb3d9', marginBottom:8 }}>Result (mock)</div>
                    <div>Code: <strong>WELCOME20</strong></div>
                    <div>Expires: 2025‑12‑31</div>
                  </div>
                </div>
              </div>
            ) : (
              <div>
              <h3 style={{ margin: 0, marginBottom: 8, display:'flex', alignItems:'center', gap:8 }}>
                <span>Execute Automation</span>
                <span style={{ marginLeft:'auto' }} />
                <SpecLinkButton moduleName="Personalization" scenarioTitle="Execute Automation" />
              </h3>
                <div style={{ padding:12, border:'1px solid #2b3952', borderRadius:8, background:'#0f1829' }}>
                  <div style={{ color:'#9fb3d9', marginBottom:6 }}>Summary (mock)</div>
                  <ul style={{ margin:0 }}>
                    <li>Rules: 12 active</li>
                    <li>Segments: 5 configured</li>
                    <li>Next run: in 10 minutes</li>
                  </ul>
                  <div style={{ height:10 }} />
                  <button onClick={()=>setLog(l=>['LiveOps run scheduled', ...l])} style={{ background:'#22c55e', color:'#0a0f19', border:'none', borderRadius:6, padding:'8px 12px', fontWeight:700, cursor:'pointer' }}>Schedule Run</button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
