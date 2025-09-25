import ScenarioRunner from '../../shared/ui/ScenarioRunner';
import type { Step } from '../../shared/ui/ScenarioRunner';
import { useAppStore } from '../../app/store/AppStore';
import { useScenario } from '../../app/store/ScenarioContext';
import { useEffect } from 'react';
import { useState } from 'react';

const steps: Step[] = [
  // Scenario 1: Creating New Marketing Campaign
  { kind: 'info', title: 'Campaign Dashboard', description: 'Active campaigns overview and metrics' },
  { kind: 'form', title: 'Create New Campaign', description: 'Type & template', fields: [
    { name: 'type', label: 'Type', type: 'select', required: true, options: [
      { label: 'Email', value: 'email' },
      { label: 'Push', value: 'push' },
      { label: 'In-app', value: 'inapp' }
    ] },
    { name: 'template', label: 'Template', type: 'select', required: true, options: [
      { label: 'New Player Welcome', value: 'welcome' },
      { label: 'Seasonal Sale', value: 'seasonal' }
    ] }
  ] },
  { kind: 'form', title: 'Campaign Details', description: 'Name, description, dates', fields: [
    { name: 'name', label: 'Name', required: true },
    { name: 'description', label: 'Description' },
    { name: 'start', label: 'Start (ISO)', required: true },
    { name: 'end', label: 'End (ISO)', required: true }
  ] },

  // Scenario 2: Audience Targeting and Segmentation
  { kind: 'form', title: 'Audience Targeting', description: 'Segments & rules', fields: [
    { name: 'segment', label: 'Segment', type: 'select', required: true, options: [
      { label: 'New Players', value: 'new' },
      { label: 'VIP', value: 'vip' },
      { label: 'Inactive', value: 'inactive' },
      { label: 'Geographic', value: 'geo' }
    ] },
    { name: 'geo', label: 'Region', },
    { name: 'criteria', label: 'Additional Criteria' },
    { name: 'minLevel', label: 'Min Level', type: 'number' },
  ] },

  // Scenario 3: Content Creation and Personalization
  { kind: 'form', title: 'Content: Email', description: 'Subject, body, CTA', fields: [
    { name: 'subject', label: 'Subject', required: true },
    { name: 'cta', label: 'CTA Text' },
  ] },
  { kind: 'form', title: 'Content: Media', description: 'Banner/video (mock refs)', fields: [
    { name: 'banner', label: 'Banner URL' },
    { name: 'video', label: 'Video URL' }
  ] },
  { kind: 'form', title: 'Personalization', description: 'Discount codes, A/B', fields: [
    { name: 'discountCode', label: 'Discount Code' },
    { name: 'abVariants', label: 'A/B Variants', type: 'number' }
  ] },

  // Scenario 4: Scheduling and Automation
  { kind: 'form', title: 'Scheduling', description: 'Launch time and duration', fields: [
    { name: 'launch', label: 'Launch (ISO)', required: true },
    { name: 'durationDays', label: 'Duration (days)', type: 'number', required: true }
  ] },
  { kind: 'form', title: 'Automation Rules', description: 'Follow-ups and pause conditions', fields: [
    { name: 'followup', label: 'Follow-up (yes/no)' },
    { name: 'pause', label: 'Pause condition' }
  ] },

  // Scenario 5: Monitoring (mock snapshot)
  { kind: 'info', title: 'Performance Dashboard', description: 'Opens 23.5%, CTR 4.2%, Conv 2.8%, Revenue $12,450' },

  // Scenario 6: A/B Testing
  { kind: 'form', title: 'A/B Test Setup', description: 'Variants and split', fields: [
    { name: 'subjectA', label: 'Subject A', required: true },
    { name: 'subjectB', label: 'Subject B', required: true },
    { name: 'split', label: 'Split % (A)', type: 'number', required: true }
  ] },
  { kind: 'info', title: 'A/B Results (mock)', description: 'A: OR 25.3% / B: OR 28.7% — Winner: B (95% conf.)' },

  // Scenario 7: Campaign Rules & Triggers
  { kind: 'form', title: 'Automated Rule', description: 'Trigger and action', fields: [
    { name: 'trigger', label: 'Trigger', required: true },
    { name: 'action', label: 'Action', required: true },
    { name: 'delay', label: 'Delay', }
  ] },

  // Scenario 8: Reporting
  { kind: 'form', title: 'Generate Report', description: 'Params', fields: [
    { name: 'range', label: 'Date Range', required: true },
    { name: 'metrics', label: 'Metrics' }
  ] },
  { kind: 'confirm', title: 'Summary', summary: { result: 'Campaign configured and scheduled (mock). Report generated.' }, actionLabel: 'Finish' }
  ,
  // Scenario 9: Export tools (CSV / Excel)
  { kind: 'info', title: 'Export Tools', description: 'Export campaigns and users to CSV/Excel (CSV-based)' },
  // Scenario 10: User Management
  { kind: 'form', title: 'User Management', description: 'Change roles and permissions', fields: [
    { name: 'userId', label: 'User', required: true },
    { name: 'role', label: 'Role (admin/viewer)', required: true }
  ] },
  // Scenario 11: Activity Tracker
  { kind: 'info', title: 'Activity Tracker', description: 'Recent logins, config changes, usage' },
  // Scenario 12: Ticketing / Support Log
  { kind: 'form', title: 'Create Ticket', description: 'Support ticket', fields: [
    { name: 'subject', label: 'Subject', required: true },
    { name: 'priority', label: 'Priority (low/medium/high)', required: true }
  ] },
  // Scenario 13: Consent Management
  { kind: 'form', title: 'Consent Management', description: 'Cookie banners, tracking opt-in/out', fields: [
    { name: 'marketing', label: 'Marketing (true/false)', required: true },
    { name: 'analytics', label: 'Analytics (true/false)', required: true },
    { name: 'personalization', label: 'Personalization (true/false)', required: true }
  ] },
  // Scenario 14: Age Verification
  { kind: 'form', title: 'Age Verification', description: 'Enable/verify age gate', fields: [
    { name: 'required', label: 'Required (true/false)', required: true },
    { name: 'dob', label: 'Date of Birth (YYYY-MM-DD)' }
  ] }
];

export default function MerchantModulePage() {
  const { dispatch, state } = useAppStore();
  const { selectedScenario, setSelectedScenario } = useScenario();
  const scenarios = steps.map((st) => ({ title: st.title, step: st }));
  const [exportStatus, setExportStatus] = useState<string>('');

  // Guard index
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
      {displayScenarios.map(({ title, step }, idx) => {
        const realIndex = safeIndex !== null ? safeIndex : idx;
        return (
        <div id={`sc-${realIndex + 1}`} key={realIndex} style={{ border: '1px solid #1b2536', borderRadius: 8, padding: 12 }}>
          {realIndex === 0 ? (
            <div>
              <h3 style={{ margin: 0, marginBottom: 8 }}>{title}</h3>
              <p style={{ color: '#9fb3d9', marginTop: 0 }}>Overview of campaign performance (mock): active/scheduled, avg. discount, CTR trend.</p>
              <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                <Metric label="Active campaigns" value={String(state.campaigns.filter(c => c.status === 'active').length)} />
                <Metric label="Scheduled" value={String(state.campaigns.filter(c => c.status === 'scheduled').length)} />
                <Metric label="Avg. discount" value={state.campaigns.length ? `${Math.round((state.campaigns.reduce((a, c) => a + (c.discount || 0), 0) / state.campaigns.length) || 0)}%` : '0%'} />
              </div>
              <div style={{ marginTop: 12, display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
                <TrendMini title="CTR by day (mock)" points={[2.1,2.4,2.6,2.5,2.9,3.1,3.0]} />
                <TrendMini title="Revenue (k$)" points={[8,9,10,11,10,12,13]} />
              </div>
            </div>
          ) : title === 'Export Tools' ? (
            <div>
              <h3 style={{ margin: 0, marginBottom: 8 }}>{title}</h3>
              <p style={{ color: '#9fb3d9', marginTop: 0 }}>Download CSV snapshots of campaigns and users. Excel opens CSV.</p>
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => { downloadCsv('campaigns.csv', toCsv(state.campaigns)); setExportStatus('Campaigns exported'); }} style={btn()}>Export Campaigns (CSV)</button>
                <button onClick={() => { downloadCsv('users.csv', toCsv(state.users)); setExportStatus('Users exported'); }} style={btn()}>Export Users (CSV)</button>
              </div>
              {exportStatus && <div style={{ marginTop: 8, color: '#4ade80', fontSize: 12 }}>{exportStatus}</div>}
            </div>
          ) : title === 'User Management' ? (
            <div>
              <h3 style={{ margin: 0, marginBottom: 8 }}>{title}</h3>
              <p style={{ color: '#9fb3d9', marginTop: 0 }}>Switch user roles between admin and viewer.</p>
              <div style={{ display: 'grid', gap: 8 }}>
                {state.users.map(u => (
                  <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #2b3952', borderRadius: 8, padding: 10 }}>
                    <div style={{ color: '#e7f0ff' }}>{u.name}</div>
                    <div style={{ color: '#9fb3d9', fontSize: 12 }}>Role: <strong style={{ color: '#fff' }}>{u.role}</strong></div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => dispatch({ type: 'SET_USER_ROLE', userId: u.id, role: 'admin' })} style={btn(u.role==='admin')}>Admin</button>
                      <button onClick={() => dispatch({ type: 'SET_USER_ROLE', userId: u.id, role: 'viewer' })} style={btn(u.role==='viewer')}>Viewer</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : title === 'Activity Tracker' ? (
            <div>
              <h3 style={{ margin: 0, marginBottom: 8 }}>{title}</h3>
              <p style={{ color: '#9fb3d9', marginTop: 0 }}>Recent actions:</p>
              <div style={{ display: 'grid', gap: 8 }}>
                {state.activity.slice(0, 12).map(a => (
                  <div key={a.id} style={{ border: '1px solid #2b3952', borderRadius: 8, padding: 10 }}>
                    <div style={{ color: '#e7f0ff' }}>{a.message}</div>
                    <div style={{ color: '#9fb3d9', fontSize: 11 }}>{a.type} · {new Date(a.at).toLocaleString()}</div>
                  </div>
                ))}
              </div>
              <button onClick={() => dispatch({ type: 'LOG_ACTIVITY', payload: { type: 'config', message: 'Changed campaign settings' } })} style={{ ...btn(), marginTop: 10 }}>Add mock activity</button>
            </div>
          ) : title === 'Create Ticket' ? (
            <div>
              <h3 style={{ margin: 0, marginBottom: 8 }}>{title}</h3>
              <TicketForm onCreate={(subject, priority) => dispatch({ type: 'CREATE_TICKET', payload: { subject, priority } })} />
              <div style={{ marginTop: 12, color: '#9fb3d9' }}>Latest tickets:</div>
              <div style={{ display: 'grid', gap: 8, marginTop: 6 }}>
                {state.tickets.slice(0, 8).map(t => (
                  <div key={t.id} style={{ border: '1px solid #2b3952', borderRadius: 8, padding: 10, display: 'grid', gap: 6 }}>
                    <div style={{ color: '#e7f0ff' }}>{t.subject}</div>
                    <div style={{ color: '#9fb3d9', fontSize: 12 }}>Priority: {t.priority} · Status: {t.status}</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => dispatch({ type: 'UPDATE_TICKET_STATUS', ticketId: t.id, status: 'in_progress' })} style={btn(t.status==='in_progress')}>In Progress</button>
                      <button onClick={() => dispatch({ type: 'UPDATE_TICKET_STATUS', ticketId: t.id, status: 'closed' })} style={btn(t.status==='closed')}>Close</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : title === 'Consent Management' ? (
            <div>
              <h3 style={{ margin: 0, marginBottom: 8 }}>{title}</h3>
              <div style={{ display: 'grid', gap: 10 }}>
                {(['marketing','analytics','personalization'] as const).map(key => (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #2b3952', borderRadius: 8, padding: 10 }}>
                    <div style={{ color: '#e7f0ff' }}>{key}</div>
                    <button onClick={() => dispatch({ type: 'SET_CONSENT', payload: { [key]: !state.consent[key] } as any })} style={btn(state.consent[key])}>{state.consent[key] ? 'Opt-out' : 'Opt-in'}</button>
                  </div>
                ))}
              </div>
            </div>
          ) : title === 'Age Verification' ? (
            <div>
              <h3 style={{ margin: 0, marginBottom: 8 }}>{title}</h3>
              <div style={{ display: 'grid', gap: 10 }}>
                <div style={{ color: '#9fb3d9' }}>Required: <strong style={{ color: '#fff' }}>{String(state.ageGate.required)}</strong> · Verified: <strong style={{ color: '#fff' }}>{String(state.ageGate.verified)}</strong></div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => dispatch({ type: 'SET_AGEGATE', payload: { required: !state.ageGate.required } })} style={btn(state.ageGate.required)}>Toggle Required</button>
                  <button onClick={() => dispatch({ type: 'SET_AGEGATE', payload: { verified: !state.ageGate.verified } })} style={btn(state.ageGate.verified)}>Toggle Verified</button>
                </div>
              </div>
            </div>
          ) : (
            <ScenarioRunner
              title={title}
              intro={undefined}
              steps={[step]}
              onStepNext={(_, data) => {
                if (step.kind === 'form' && step.title === 'Campaign Details') {
                  const name = String((data as any).name || '');
                  if (name) dispatch({ type: 'CREATE_CAMPAIGN', payload: { name, discount: 0 } as any });
                }
                if (step.kind === 'form' && step.title === 'User Management') {
                  const d = data as any; if (d.userId && d.role) dispatch({ type: 'SET_USER_ROLE', userId: d.userId, role: d.role === 'admin' ? 'admin' : 'viewer' });
                }
                if (step.kind === 'form' && step.title === 'Create Ticket') {
                  const d = data as any; if (d.subject && d.priority) dispatch({ type: 'CREATE_TICKET', payload: { subject: d.subject, priority: d.priority } });
                }
                if (step.kind === 'form' && step.title === 'Consent Management') {
                  const d = data as any; dispatch({ type: 'SET_CONSENT', payload: {
                    marketing: d.marketing === 'true' || d.marketing === true,
                    analytics: d.analytics === 'true' || d.analytics === true,
                    personalization: d.personalization === 'true' || d.personalization === true,
                  } });
                }
                if (step.kind === 'form' && step.title === 'Age Verification') {
                  const d = data as any; dispatch({ type: 'SET_AGEGATE', payload: { required: d.required === 'true' || d.required === true, dob: d.dob } });
                }
              }}
              onFinish={() => {}}
            />
          )}
        </div>
        );
      })}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ padding: 12, border: '1px solid #2b3952', background: '#0f1829', borderRadius: 8 }}>
      <div style={{ color: '#9fb3d9', fontSize: 12 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

function TrendMini({ title, points }: { title: string; points: number[] }) {
  const max = Math.max(...points);
  return (
    <div style={{ padding: 12, border: '1px solid #2b3952', background: '#0f1829', borderRadius: 8 }}>
      <div style={{ color: '#9fb3d9', marginBottom: 8 }}>{title}</div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 70 }}>
        {points.map((p, i) => (
          <div key={i} style={{ width: 8, height: Math.max(6, Math.round((p / max) * 70)), background: '#2e68ff', borderRadius: 4 }} />
        ))}
      </div>
    </div>
  );
}

function btn(active?: boolean) {
  return {
    background: active ? '#10b981' : '#2e68ff',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    padding: '8px 12px',
    cursor: 'pointer',
    fontWeight: 600
  } as React.CSSProperties;
}

function toCsv(rows: any[]): string {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(',')].concat(rows.map(r => headers.map(h => JSON.stringify((r as any)[h] ?? '')).join(',')));
  return lines.join('\n');
}

function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function TicketForm({ onCreate }: { onCreate: (subject: string, priority: 'low' | 'medium' | 'high') => void }) {
  const [subject, setSubject] = useState('');
  const [priority, setPriority] = useState<'low'|'medium'|'high'>('low');
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" style={{ padding: 10, borderRadius: 8, border: '1px solid #2b3952', background: '#0f1829', color: '#e7f0ff' }} />
      <div style={{ display: 'flex', gap: 8 }}>
        {(['low','medium','high'] as const).map(p => (
          <button key={p} onClick={() => setPriority(p)} style={btn(priority===p)}>{p}</button>
        ))}
      </div>
      <button onClick={() => subject && onCreate(subject, priority)} style={{ ...btn(), background: subject ? '#fbbf24' : '#374151', color: subject ? '#000' : '#9ca3af' }}>Create Ticket</button>
    </div>
  );
}
