import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { RightSidebar } from './RightSidebar';
import { StoreProvider, useAppStore } from '../store/AppStore';
import { ScenarioProvider } from '../store/ScenarioContext';

export function MainLayout() {
  const location = useLocation();
  const isModule = location.pathname.startsWith('/modules/');
  return (
    <StoreProvider>
      <ScenarioProvider>
        <div style={{ minHeight: '100vh', background: '#0a0f19', color: '#d7e3ff', display: 'flex', height: '100vh', overflow: 'hidden' }}>
          <Sidebar />
          {isModule && <RightSidebar />}
          <div style={{ flex: 1, padding: isModule ? '20px 0 20px 20px' : '20px', height: '100vh', overflow: 'hidden', position: 'relative' }}>
            <main style={{ height: '100%', overflow: 'auto', paddingTop: 16 }}>
              <ConsentBanner />
              <AgeGateModal />
              <Outlet />
            </main>
          </div>
        </div>
      </ScenarioProvider>
    </StoreProvider>
  );
}

function ConsentBanner() {
  const { state, dispatch } = useAppStore();
  const allAccepted = state.consent.marketing && state.consent.analytics && state.consent.personalization;
  if (allAccepted) return null;
  return (
    <div style={{ position: 'sticky', bottom: 0, zIndex: 50, background: '#0f1a2c', border: '1px solid #2b3952', borderRadius: 8, padding: 12, marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
        <div style={{ color: '#9fb3d9', fontSize: 12 }}>We use cookies for analytics, personalization and marketing.</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => dispatch({ type: 'SET_CONSENT', payload: { marketing: true, analytics: true, personalization: true } })} style={consentBtn('#10b981')}>Accept all</button>
          <button onClick={() => dispatch({ type: 'SET_CONSENT', payload: { marketing: false, analytics: true, personalization: false } })} style={consentBtn('#fbbf24', '#000')}>Basic only</button>
        </div>
      </div>
    </div>
  );
}

function AgeGateModal() {
  const { state, dispatch } = useAppStore();
  if (!state.ageGate.required || state.ageGate.verified) return null;
  return (
    <div style={{ position: 'fixed', inset: 0 as unknown as number, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div style={{ width: 360, background: '#0f1a2c', border: '1px solid #2b3952', borderRadius: 12, padding: 16 }}>
        <div style={{ fontWeight: 800, color: '#fff' }}>Age Verification</div>
        <div style={{ color: '#9fb3d9', marginTop: 6, fontSize: 12 }}>Please confirm you are over the required age to continue.</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button onClick={() => dispatch({ type: 'SET_AGEGATE', payload: { verified: true } })} style={consentBtn('#10b981')}>I am over 18</button>
          <button onClick={() => dispatch({ type: 'SET_AGEGATE', payload: { verified: false } })} style={consentBtn('#ef4444')}>I am under 18</button>
        </div>
      </div>
    </div>
  );
}

function consentBtn(bg: string, color: string = '#fff') {
  return { background: bg, color, border: 'none', borderRadius: 6, padding: '8px 12px', cursor: 'pointer', fontWeight: 700 } as React.CSSProperties;
}
