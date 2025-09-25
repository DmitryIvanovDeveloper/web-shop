// import ScenarioRunner from '../../shared/ui/ScenarioRunner';
import type { Step } from '../../shared/ui/ScenarioRunner';
import { useScenario } from '../../app/store/ScenarioContext';
import { useEffect } from 'react';
import { useState } from 'react';

const steps: Step[] = [
  { kind: 'form', title: 'Configure Payments', fields: [
    { name: 'provider', label: 'Provider', type: 'select', required: true, options: [
      { label: 'Stripe', value: 'stripe' },
      { label: 'PayPal', value: 'paypal' }
    ] },
    { name: 'apiKey', label: 'API Key', required: true }
  ] },
  { kind: 'form', title: 'Setup Analytics (GA4)', fields: [
    { name: 'trackingId', label: 'Tracking ID', required: true }
  ] },
  { kind: 'form', title: 'Initialize Overlay', fields: [
    { name: 'engine', label: 'Engine', type: 'select', required: true, options: [
      { label: 'Unity', value: 'unity' },
      { label: 'Unreal', value: 'unreal' }
    ] }
  ] },
  { kind: 'confirm', title: 'Handle Deep Link', summary: { deeplink: 'app://open/shop (mock)' } }
];

export default function SDKModulePage() {
  const { selectedScenario, setSelectedScenario } = useScenario();
  const [provider, setProvider] = useState<'stripe'|'paypal'>('stripe');
  const [apiKey, setApiKey] = useState<string>('');
  const [trackingId, setTrackingId] = useState<string>('');
  const [engine, setEngine] = useState<'unity'|'unreal'>('unity');
  const [deep, setDeep] = useState<string>('app://open/shop');
  const scenarios = [
    { title: 'Configure Payments', steps: [steps[0]] },
    { title: 'Setup Analytics (GA4)', steps: [steps[1]] },
    { title: 'Initialize Overlay', steps: [steps[2]] },
    { title: 'Handle Deep Link', steps: [steps[3]] },
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
                <h3 style={{ margin: 0, marginBottom: 8 }}>Configure Payments</h3>
                <div style={{ display:'grid', gap:12, gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))' }}>
                  <div style={{ padding:12, border:'1px solid #2b3952', borderRadius:8 }}>
                    <label style={{ display:'block', color:'#9fb3d9', fontSize:12, marginBottom:6 }}>Provider *</label>
                    <select value={provider} onChange={(e)=>setProvider(e.target.value as any)} style={{ width:'100%', padding:10, background:'#11253f', color:'#e7f0ff', border:'1px solid #2b3952', borderRadius:8 }}>
                      <option value="stripe">Stripe</option>
                      <option value="paypal">PayPal</option>
                    </select>
                    <div style={{ height:8 }} />
                    <label style={{ display:'block', color:'#9fb3d9', fontSize:12, marginBottom:6 }}>API Key *</label>
                    <input value={apiKey} onChange={(e)=>setApiKey(e.target.value)} placeholder="sk_live_****" style={{ width:'100%', padding:10, background:'#11253f', color:'#e7f0ff', border:'1px solid #2b3952', borderRadius:8 }} />
                    <div style={{ height:10 }} />
                    <button disabled={!apiKey} style={{ background:(!apiKey)?'#374151':'#2e68ff', color:'#fff', border:'none', borderRadius:6, padding:'8px 12px', fontWeight:700, cursor:(!apiKey)?'not-allowed':'pointer' }}>Save</button>
                  </div>
                  <div style={{ padding:12, border:'1px solid #2b3952', borderRadius:8 }}>
                    <div style={{ color:'#9fb3d9', marginBottom:8 }}>Webhooks (mock)</div>
                    <ul style={{ margin:0 }}>
                      <li>payment_intent.succeeded</li>
                      <li>payment_intent.payment_failed</li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : realIndex === 1 ? (
              <div>
                <h3 style={{ margin: 0, marginBottom: 8 }}>Setup Analytics (GA4)</h3>
                <div style={{ display:'grid', gap:12, gridTemplateColumns:'repeat(auto-fit, minmax(260px, 1fr))' }}>
                  <div style={{ padding:12, border:'1px solid #2b3952', borderRadius:8 }}>
                    <label style={{ display:'block', color:'#9fb3d9', fontSize:12, marginBottom:6 }}>Tracking ID *</label>
                    <input value={trackingId} onChange={(e)=>setTrackingId(e.target.value)} placeholder="G-XXXXXXX" style={{ width:'100%', padding:10, background:'#11253f', color:'#e7f0ff', border:'1px solid #2b3952', borderRadius:8 }} />
                    <div style={{ height:10 }} />
                    <button disabled={!trackingId} style={{ background:(!trackingId)?'#374151':'#2e68ff', color:'#fff', border:'none', borderRadius:6, padding:'8px 12px', fontWeight:700, cursor:(!trackingId)?'not-allowed':'pointer' }}>Connect</button>
                  </div>
                  <div style={{ padding:12, border:'1px solid #2b3952', borderRadius:8 }}>
                    <div style={{ color:'#9fb3d9', marginBottom:8 }}>Events (mock)</div>
                    <ul style={{ margin:0 }}>
                      <li>session_start</li>
                      <li>purchase</li>
                      <li>view_item</li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : realIndex === 2 ? (
              <div>
                <h3 style={{ margin: 0, marginBottom: 8 }}>Initialize Overlay</h3>
                <div style={{ display:'grid', gap:12, gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))' }}>
                  <div style={{ padding:12, border:'1px solid #2b3952', borderRadius:8 }}>
                    <label style={{ display:'block', color:'#9fb3d9', fontSize:12, marginBottom:6 }}>Engine *</label>
                    <select value={engine} onChange={(e)=>setEngine(e.target.value as any)} style={{ width:'100%', padding:10, background:'#11253f', color:'#e7f0ff', border:'1px solid #2b3952', borderRadius:8 }}>
                      <option value="unity">Unity</option>
                      <option value="unreal">Unreal</option>
                    </select>
                    <div style={{ height:10 }} />
                    <button style={{ background:'#2e68ff', color:'#fff', border:'none', borderRadius:6, padding:'8px 12px', fontWeight:700, cursor:'pointer' }}>Initialize</button>
                  </div>
                  <div style={{ padding:12, border:'1px solid #2b3952', borderRadius:8 }}>
                    <div style={{ color:'#9fb3d9', marginBottom:8 }}>Preview (mock)</div>
                    <div style={{ height:80, background:'#11253f', border:'1px dashed #2b3952', borderRadius:8 }} />
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h3 style={{ margin: 0, marginBottom: 8 }}>Handle Deep Link</h3>
                <div style={{ display:'grid', gap:12, gridTemplateColumns:'repeat(auto-fit, minmax(260px, 1fr))' }}>
                  <div style={{ padding:12, border:'1px solid #2b3952', borderRadius:8 }}>
                    <label style={{ display:'block', color:'#9fb3d9', fontSize:12, marginBottom:6 }}>Deep Link</label>
                    <input value={deep} onChange={(e)=>setDeep(e.target.value)} placeholder="app://open/shop" style={{ width:'100%', padding:10, background:'#11253f', color:'#e7f0ff', border:'1px solid #2b3952', borderRadius:8 }} />
                    <div style={{ height:10 }} />
                    <button style={{ background:'#2e68ff', color:'#fff', border:'none', borderRadius:6, padding:'8px 12px', fontWeight:700, cursor:'pointer' }}>Simulate</button>
                  </div>
                  <div style={{ padding:12, border:'1px solid #2b3952', borderRadius:8 }}>
                    <div style={{ color:'#9fb3d9', marginBottom:8 }}>Route (mock)</div>
                    <div>Screen: Shop</div>
                    <div>Params: {deep.includes('product')? 'productId=xyz' : 'none'}</div>
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
