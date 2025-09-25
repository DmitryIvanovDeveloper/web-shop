import type { Step } from '../../shared/ui/ScenarioRunner';
import { useAppStore } from '../../app/store/AppStore';
import { useScenario } from '../../app/store/ScenarioContext';
import { useState } from 'react';

const steps: Step[] = [
  { kind: 'info', title: 'Detect Language', description: 'Auto-detect player language' },
  { kind: 'form', title: 'Translate Content', fields: [
    { name: 'key', label: 'Translation Key', required: true },
    { name: 'value', label: 'Value', required: true }
  ] },
  { kind: 'form', title: 'Update Locale', fields: [
    { name: 'locale', label: 'Locale', type: 'select', required: true, options: [
      { label: 'English', value: 'en' },
      { label: 'Deutsch', value: 'de' },
      { label: 'Russian', value: 'ru' }
    ] }
  ] },
  { kind: 'confirm', title: 'Validation', summary: { result: 'Translations applied (mock)' } }
];

export default function LocalizationModulePage() {
  const { state, dispatch } = useAppStore();
  const { selectedScenario } = useScenario();
  const [detected, setDetected] = useState<string>('en');
  const [tKey, setTKey] = useState<string>('ui.title');
  const [tVal, setTVal] = useState<string>('Welcome to WebShopX');
  const [translations, setTranslations] = useState<Array<{ key: string; value: string }>>([
    { key: 'ui.buy', value: 'Buy now' },
  ]);
  const [newLocale, setNewLocale] = useState<string>('en');
  const scenarios = [
    { title: 'Detect Language', steps: [steps[0]] },
    { title: 'Translate Content', steps: [steps[1]] },
    { title: 'Update Locale', steps: [steps[2]] },
    { title: 'Validation', steps: [steps[3]] },
  ];

  // Filter scenarios based on selection
  const displayScenarios = selectedScenario !== null ? [scenarios[selectedScenario]] : scenarios;

  return (
    <div style={{ display: 'grid', gap: 16, maxWidth: '100%', overflow: 'hidden' }}>
      {displayScenarios.map((_, i) => {
        const realIndex = selectedScenario !== null ? selectedScenario : i;
        return (
          <div id={`sc-${realIndex + 1}`} key={realIndex} style={{ border: '1px solid #1b2536', borderRadius: 8, padding: 12 }}>
            {realIndex === 0 ? (
              <div>
                <h3 style={{ margin: 0, marginBottom: 8 }}>Detect Language</h3>
                <p style={{ color: '#9fb3d9', marginTop: 0 }}>Mock detection based on browser settings and geo.</p>
                <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                  <Info label="Browser Accept-Language" value={navigator.language || 'en-US'} />
                  <Info label="Geo (mock)" value="EU" />
                  <Info label="Detected locale" value={detected} />
                </div>
                <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => setDetected('en')}
                    style={{ background: detected==='en' ? '#2e68ff' : '#11253f', color: '#fff', border: '1px solid #2b3952', borderRadius: 6, padding: '8px 12px', fontWeight: 700, cursor: 'pointer' }}
                  >English</button>
                  <button
                    onClick={() => setDetected('de')}
                    style={{ background: detected==='de' ? '#2e68ff' : '#11253f', color: '#fff', border: '1px solid #2b3952', borderRadius: 6, padding: '8px 12px', fontWeight: 700, cursor: 'pointer' }}
                  >Deutsch</button>
                  <button
                    onClick={() => setDetected('ru')}
                    style={{ background: detected==='ru' ? '#2e68ff' : '#11253f', color: '#fff', border: '1px solid #2b3952', borderRadius: 6, padding: '8px 12px', fontWeight: 700, cursor: 'pointer' }}
                  >Русский</button>
                  <button
                    onClick={() => dispatch({ type: 'SET_LOCALE', locale: detected })}
                    style={{ marginLeft: 'auto', background: '#22c55e', color: '#0a0f19', border: 'none', borderRadius: 6, padding: '8px 12px', fontWeight: 700, cursor: 'pointer' }}
                  >Apply to UI</button>
                </div>
              </div>
            ) : realIndex === 1 ? (
              <div>
                <h3 style={{ margin: 0, marginBottom: 8 }}>Translate Content</h3>
                <p style={{ color: '#9fb3d9', marginTop: 0 }}>Add key-value translations (mock). No backend calls.</p>
                <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
                  <div style={{ padding: 12, border: '1px solid #2b3952', borderRadius: 8 }}>
                    <label style={{ display: 'block', color: '#9fb3d9', fontSize: 12, marginBottom: 6 }}>Key *</label>
                    <input value={tKey} onChange={(e)=>setTKey(e.target.value)} placeholder="ui.title" style={{ width: '100%', padding: 10, background:'#11253f', color:'#e7f0ff', border:'1px solid #2b3952', borderRadius: 8 }} />
                    <div style={{ height: 8 }} />
                    <label style={{ display: 'block', color: '#9fb3d9', fontSize: 12, marginBottom: 6 }}>Value *</label>
                    <input value={tVal} onChange={(e)=>setTVal(e.target.value)} placeholder="Welcome to WebShopX" style={{ width: '100%', padding: 10, background:'#11253f', color:'#e7f0ff', border:'1px solid #2b3952', borderRadius: 8 }} />
                    <div style={{ height: 10 }} />
                    <button
                      disabled={!tKey || !tVal}
                      onClick={()=> setTranslations(list => [{ key: tKey, value: tVal }, ...list])}
                      style={{ background: (!tKey||!tVal)?'#374151':'#2e68ff', color:'#fff', border:'none', borderRadius:6, padding:'8px 12px', fontWeight:700, cursor:(!tKey||!tVal)?'not-allowed':'pointer' }}
                    >Add Translation</button>
                  </div>
                  <div style={{ padding: 12, border: '1px solid #2b3952', borderRadius: 8 }}>
                    <div style={{ color:'#9fb3d9', marginBottom: 8 }}>Dictionary (mock)</div>
                    <div style={{ display:'grid', gap:8 }}>
                      {translations.map(t => (
                        <div key={t.key} style={{ display:'flex', justifyContent:'space-between', gap:8, padding:'8px 10px', background:'#0f1a2c', border:'1px solid #2b3952', borderRadius:6 }}>
                          <span style={{ color:'#fff' }}>{t.key}</span>
                          <span style={{ color:'#9fb3d9' }}>{t.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : realIndex === 2 ? (
              <div>
                <h3 style={{ margin: 0, marginBottom: 8 }}>Update Locale</h3>
                <p style={{ color: '#9fb3d9', marginTop: 0 }}>Switch application locale (mock state update).</p>
                <div style={{ display:'grid', gap:12, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                  <div style={{ padding: 12, border: '1px solid #2b3952', borderRadius: 8 }}>
                    <label style={{ display: 'block', color:'#9fb3d9', fontSize:12, marginBottom:6 }}>Locale *</label>
                    <select value={newLocale} onChange={(e)=>setNewLocale(e.target.value)} style={{ width:'100%', padding:10, background:'#11253f', color:'#e7f0ff', border:'1px solid #2b3952', borderRadius:8 }}>
                      <option value="en">English</option>
                      <option value="de">Deutsch</option>
                      <option value="ru">Русский</option>
                    </select>
                    <div style={{ height:10 }} />
                    <button onClick={()=>dispatch({ type:'SET_LOCALE', locale:newLocale })} style={{ background:'#2e68ff', color:'#fff', border:'none', borderRadius:6, padding:'8px 12px', fontWeight:700, cursor:'pointer' }}>Apply Locale</button>
                  </div>
                  <Info label="Current locale" value={state.locale} />
                </div>
              </div>
            ) : (
              <div>
                <h3 style={{ margin: 0, marginBottom: 8 }}>Validation</h3>
                <div style={{ padding: 12, border: '1px solid #2b3952', background:'#0f1829', borderRadius: 8 }}>
                  <div style={{ color:'#9fb3d9', marginBottom: 8 }}>Summary (mock)</div>
                  <ul style={{ margin:0 }}>
                    <li>Strings loaded: 152</li>
                    <li>Missing keys: 0</li>
                    <li>Current locale: {state.locale}</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ padding: 12, border: '1px solid #2b3952', background: '#0f1829', borderRadius: 8 }}>
      <div style={{ color: '#9fb3d9', fontSize: 12 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700 }}>{value}</div>
    </div>
  );
}
