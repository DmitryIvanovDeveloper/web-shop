import ScenarioRunner from '../../shared/ui/ScenarioRunner';
import SpecLinkButton from '../../shared/ui/SpecLinkButton';
import { Input, Select, Button, DateRange as DateRangeCmp } from '../../shared/ui/universal';
import type { Step } from '../../shared/ui/ScenarioRunner';
import { useAppStore } from '../../app/store/AppStore';
import { useScenario } from '../../app/store/ScenarioContext';
import { useDocumentUpdateCheck } from '../../shared/hooks/useDocumentUpdateCheck';
import { useEffect, useState } from 'react';

export default function AnalyticsModulePage() {
  const { state } = useAppStore();
  const { selectedScenario, setSelectedScenario } = useScenario();
  const [showUpdateResult, setShowUpdateResult] = useState<{scenario: string, isOutdated: boolean, lastChecked: Date} | null>(null);

  const scenarios: { title: string; intro?: string; steps: Step[] }[] = [
    {
      title: 'Daily Analytics Overview',
      steps: [
        { kind: 'info', title: 'Real-time Dashboard', description: 'Live metrics: deliverability, engagement, conversions. Auto-refresh every 30s.' },
      ],
    },
    {
      title: 'Set up GA4 Integration',
      intro: 'Configure Google Analytics 4 integration: choose service, enter credentials (API Key, Property ID), set sync frequency/timezone, and confirm the connection. Demo uses mocked validation.',
      steps: [
        { kind: 'form', title: 'Add Integration', description: 'Choose service and set credentials', fields: [
          { name: 'service', label: 'Service', type: 'select', required: true, options: [
            { label: 'Google Analytics 4', value: 'ga4' },
            { label: 'AppsFlyer', value: 'appsflyer' },
            { label: 'Adjust', value: 'adjust' },
          ] },
          { name: 'apiKey', label: 'API Key', required: true },
          { name: 'propertyId', label: 'Property ID', required: true },
        ] },
        { kind: 'form', title: 'Sync Settings', description: 'Frequency and timezone', fields: [
          { name: 'freq', label: 'Frequency', type: 'select', options: [
            { label: 'Every 4 hours', value: '4h' },
            { label: 'Hourly', value: '1h' },
          ] },
          { name: 'tz', label: 'Timezone', required: true },
        ] },
        { kind: 'confirm', title: 'Connection Success', summary: { connected: true, recordsFound: 15234 } },
      ],
    },
    {
      title: 'Investigate Data Anomaly',
      intro: 'Analyze an anomaly alert (mock): review details, drill down by region/category/segment, and mark as resolved.',
      steps: [
        { kind: 'info', title: 'Revenue Spike Alert', description: 'Unusual spike detected. Drill-down by region, category, segment.' },
      ],
    },
    {
      title: 'Create Custom Report',
      intro: 'Build a custom analytics report: pick date range, choose metrics/visuals, generate and download (mock).',
      steps: [
        { kind: 'form', title: 'Report Parameters', description: 'Range, metrics, visuals', fields: [
          { name: 'range', label: 'Date Range', type: 'daterange', required: true },
          { name: 'metrics', label: 'Metrics (comma-separated)' },
          { name: 'format', label: 'Format', type: 'select', required: true, options: [
            { label: 'PDF', value: 'pdf' },
            { label: 'Excel', value: 'xlsx' },
            { label: 'CSV', value: 'csv' },
          ] },
        ] },
        { kind: 'confirm', title: 'Report Generated', summary: { file: 'monthly-performance.pdf (mock)' } },
      ],
    },
    {
      title: 'Analyze A/B Test Results',
      intro: 'Review A/B test outcome, compare key metrics, and decide on the winning variant (mock).',
      steps: [
        { kind: 'info', title: 'A/B Outcome', description: 'Variant B wins (95% conf). +28% conversion; +22% revenue/user.' },
      ],
    },
    {
      title: 'Mobile Performance Analysis',
      intro: 'Monitor mobile app metrics (sessions, duration, crash rate) and investigate performance issues (mock).',
      steps: [
        { kind: 'info', title: 'Mobile Metrics', description: 'Sessions, duration, crash rate, app rating; drill into performance issues.' },
      ],
    },
    {
      title: 'Data Pipeline Health',
      intro: 'Track real‑time pipeline health (EPS, latency, error rate, queue depth) and recovery (mock).',
      steps: [
        { kind: 'info', title: 'Pipeline Monitoring', description: 'EPS, latency, error rate, queue depth; detect and recover from degradation.' },
      ],
    },
    {
      title: 'Export Analytics Data',
      intro: 'Export analytics data by type/range/format and get a download link (mock).',
      steps: [
        { kind: 'form', title: 'Export Parameters', description: 'Type, range, format', fields: [
          { name: 'dtype', label: 'Data Type', type: 'select', required: true, options: [
            { label: 'Player behavior', value: 'behavior' },
            { label: 'Revenue', value: 'revenue' },
          ] },
          { name: 'range', label: 'Date Range', type: 'daterange', required: true },
          { name: 'format', label: 'Format', type: 'select', required: true, options: [
            { label: 'Excel', value: 'xlsx' },
            { label: 'CSV', value: 'csv' },
          ] },
        ] },
        { kind: 'confirm', title: 'Export Ready', summary: { link: 'download-link (mock)', size: '45MB' } },
      ],
    },
  ];

  // Check updates for all scenarios
  const scenarioUpdateChecks = scenarios.map(scenario => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useDocumentUpdateCheck('Analytics', scenario.title);
  });

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
      {/* Update check result */}
      {showUpdateResult && (
        <div style={{ 
          padding: 12, 
          border: '1px solid #2b3952', 
          borderRadius: 8, 
          background: '#0f1829',
          marginBottom: 16
        }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#fff' }}>Document Update Check</h4>
          <div style={{ color: '#9fb3d9', marginBottom: 4 }}>
            <strong>Scenario:</strong> {showUpdateResult.scenario}
          </div>
          <div style={{ color: '#9fb3d9', marginBottom: 4 }}>
            <strong>Status:</strong> 
            <span style={{ 
              color: showUpdateResult.isOutdated ? '#fca5a5' : '#4ade80',
              marginLeft: 8
            }}>
              {showUpdateResult.isOutdated ? 'Outdated' : 'Up to date'}
            </span>
          </div>
          <div style={{ color: '#9fb3d9', marginBottom: 8 }}>
            <strong>Checked:</strong> {showUpdateResult.lastChecked.toLocaleTimeString()}
          </div>
          <button 
            onClick={() => setShowUpdateResult(null)}
            style={{
              padding: '4px 8px',
              border: '1px solid #2b3952',
              background: 'transparent',
              color: '#9fb3d9',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 12
            }}
          >
            Close
          </button>
        </div>
      )}
      
        {displayScenarios.map((s, i) => {
          const realIndex = safeIndex !== null ? safeIndex : i;
          const updateCheck = scenarioUpdateChecks[realIndex];
          return (
            <div id={`sc-${realIndex + 1}`} key={realIndex} style={{ border: '1px solid #1b2536', borderRadius: 8, padding: 12, background: 'transparent' }}>
          {realIndex === 0 ? (
            <div>
              <h3 style={{ margin: '0 0 8px 0', display:'flex', alignItems:'center', gap:8 }}>
                <span>{s.title}</span>
                {updateCheck?.isChecking && (
                  <span style={{ color: '#fbbf24', fontSize: 12, border: '1px solid #92400e', background: '#451a03', padding: '2px 6px', borderRadius: 6 }}>
                    Checking…
                  </span>
                )}
                {updateCheck?.isOutdated && !updateCheck?.isChecking && (
                  <span style={{ color: '#fca5a5', fontSize: 12, border: '1px solid #7f1d1d', background: '#3f1d1d', padding: '2px 6px', borderRadius: 6 }}>
                    Outdated
                  </span>
                )}
                <span style={{ marginLeft:'auto' }} />
                <SpecLinkButton 
                  moduleName="Analytics" 
                  scenarioTitle={s.title} 
                  onUpdateCheck={setShowUpdateResult}
                />
              </h3>
              <p style={{ color: '#9fb3d9', marginTop: 0 }}>Live metrics with mock data. Auto-refresh disabled in demo.</p>
              <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                <MetricCard label="Active players" value="15,678" delta="↑12%" />
                <MetricCard label="Revenue / hour" value="$2,456" delta="↑8%" />
                <MetricCard label="Conversion rate" value="3.2%" delta="↑0.3%" />
                <MetricCard label="Uptime" value="98.5%" delta="healthy" />
              </div>
              <div style={{ marginTop: 16, display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
                <TrendCard title="Last 24h Revenue" points={[12,15,14,18,19,22,21,24,23,26,29,28,30,31,29,33]} />
                <TrendCard title="Active Players by Hour" points={[800,820,790,900,1020,1100,1200,1300,1500,1700,1600,1550,1800,1900,1750,1650]} />
              </div>
            </div>
          ) : realIndex === 2 ? (
            <div>
              <h3 style={{ margin: '0 0 8px 0', display:'flex', alignItems:'center', gap:8 }}>
                <span>{s.title}</span>
                <span style={{ marginLeft:'auto' }} />
                <SpecLinkButton 
                  moduleName="Analytics" 
                  scenarioTitle={s.title} 
                  onUpdateCheck={setShowUpdateResult}
                />
              </h3>
              <p style={{ color: '#9fb3d9', marginTop: 0 }}>{s.intro}</p>
              <AlertCard title="Unusual spike in purchases detected" time="16:45 UTC" delta="+524% last hour" />
              <div style={{ marginTop: 12, display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
                <BreakdownCard title="By Region" rows={[['US','+45%'],['EU','+32%'],['Asia','+23%']]} />
                <BreakdownCard title="By Category" rows={[['Skins','+67%'],['Weapons','+28%'],['Currency','+5%']]} />
                <BreakdownCard title="By Segment" rows={[['New players','+89%'],['VIP','+12%']]} />
              </div>
            </div>
          ) : realIndex === 1 ? (
            <div>
              <h3 style={{ margin: '0 0 8px 0', display:'flex', alignItems:'center', gap:8 }}>
                <span>{s.title}</span>
                <span style={{ marginLeft:'auto' }} />
                <SpecLinkButton 
                  moduleName="Analytics" 
                  scenarioTitle={s.title} 
                  onUpdateCheck={setShowUpdateResult}
                />
              </h3>
              <p style={{ color: '#9fb3d9', marginTop: 0 }}>{s.intro}</p>
              <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
                <div style={{ padding: 12, border: '1px solid #2b3952', background: '#0f1829', borderRadius: 8 }}>
                  <Select label="Service" defaultValue="ga4" options={[{label:'Google Analytics 4', value:'ga4'},{label:'AppsFlyer', value:'appsflyer'},{label:'Adjust', value:'adjust'}]} />
                  <div style={{ height: 8 }} />
                  <Input label="API Key *" placeholder="GA4-xxxxxxxx" />
                  <div style={{ height: 8 }} />
                  <Input label="Property ID *" placeholder="123456789" />
                </div>
                <div style={{ padding: 12, border: '1px solid #2b3952', background: '#0f1829', borderRadius: 8 }}>
                  <Select label="Frequency" defaultValue="4h" options={[{label:'Every 4 hours', value:'4h'},{label:'Hourly', value:'1h'}]} />
                  <div style={{ height: 8 }} />
                  <Input label="Timezone" placeholder="UTC+3" />
                  <div style={{ height: 12 }} />
                  <Button size="sm">Test Connection</Button>
                </div>
              </div>
            </div>
          ) : realIndex === 3 ? (
            <div>
              <h3 style={{ margin: '0 0 8px 0', display:'flex', alignItems:'center', gap:8 }}>
                <span>{s.title}</span>
                <span style={{ marginLeft:'auto' }} />
                <SpecLinkButton 
                  moduleName="Analytics" 
                  scenarioTitle={s.title} 
                  onUpdateCheck={setShowUpdateResult}
                />
              </h3>
              <p style={{ color: '#9fb3d9', marginTop: 0 }}>{s.intro}</p>
              <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
                <div style={{ padding: 12, border: '1px solid #2b3952', background: '#0f1829', borderRadius: 8 }}>
                  <DateRangeCmp label="Date Range *" />
                  <div style={{ height: 8 }} />
                  <Input label="Metrics" placeholder="Revenue, Players, Conversion" />
                  <div style={{ height: 8 }} />
                  <Select label="Format *" defaultValue="pdf" options={[{label:'PDF', value:'pdf'},{label:'Excel', value:'xlsx'},{label:'CSV', value:'csv'}]} />
                  <div style={{ height: 12 }} />
                  <Button size="sm">Generate Report</Button>
                </div>
                <div style={{ padding: 12, border: '1px solid #2b3952', background: '#0f1829', borderRadius: 8 }}>
                  <div style={{ color: '#9fb3d9', marginBottom: 8 }}>Preview (mock)</div>
                  <TrendCard title="Revenue Trend" points={[10,12,11,13,15,14,16,18,17,19,21,22]} />
                </div>
              </div>
            </div>
          ) : realIndex === 4 ? (
            <div>
              <h3 style={{ margin: '0 0 8px 0', display:'flex', alignItems:'center', gap:8 }}>
                <span>{s.title}</span>
                <span style={{ marginLeft:'auto' }} />
                <SpecLinkButton 
                  moduleName="Analytics" 
                  scenarioTitle={s.title} 
                  onUpdateCheck={setShowUpdateResult}
                />
              </h3>
              <p style={{ color: '#9fb3d9', marginTop: 0 }}>{s.intro}</p>
              <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
                <ABVariant title="Variant A (30% off)" conv="3.2%" rpu="$12.50" color="#9fb3d9" />
                <ABVariant title="Variant B (40% off)" conv="4.1%" rpu="$15.20" color="#4ade80" />
              </div>
              <div style={{ marginTop: 12 }}>
                <Button size="sm">Deploy Variant B</Button>
              </div>
            </div>
          ) : realIndex === 5 ? (
            <div>
              <h3 style={{ margin: '0 0 8px 0', display:'flex', alignItems:'center', gap:8 }}>
                <span>{s.title}</span>
                <span style={{ marginLeft:'auto' }} />
                <SpecLinkButton 
                  moduleName="Analytics" 
                  scenarioTitle={s.title} 
                  onUpdateCheck={setShowUpdateResult}
                />
              </h3>
              <p style={{ color: '#9fb3d9', marginTop: 0 }}>{s.intro}</p>
              <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                <MetricCard label="App sessions" value="45,230" delta="↑15%" />
                <MetricCard label="Avg. duration" value="12.5m" delta="" />
                <MetricCard label="Crash rate" value="0.8%" delta="↓0.2%" />
                <MetricCard label="Store rating" value="4.6/5.0" delta="" />
              </div>
              <div style={{ marginTop: 12, padding: 12, border: '1px solid #2b3952', background: '#0f1829', borderRadius: 8 }}>
                <div style={{ color: '#9fb3d9', marginBottom: 6 }}>Performance Issues (mock)</div>
                <ul style={{ margin: 0 }}>
                  <li>Slow loading screens: 15% users</li>
                  <li>Payment delays: 3% failure rate</li>
                  <li>Memory spikes during gameplay</li>
                </ul>
              </div>
            </div>
          ) : realIndex === 6 ? (
            <div>
              <h3 style={{ margin: '0 0 8px 0', display:'flex', alignItems:'center', gap:8 }}>
                <span>{s.title}</span>
                <span style={{ marginLeft:'auto' }} />
                <SpecLinkButton 
                  moduleName="Analytics" 
                  scenarioTitle={s.title} 
                  onUpdateCheck={setShowUpdateResult}
                />
              </h3>
              <p style={{ color: '#9fb3d9', marginTop: 0 }}>{s.intro}</p>
              <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                <MetricCard label="EPS" value="2,347" delta="normal" />
                <MetricCard label="Latency" value="12ms" delta="excellent" />
                <MetricCard label="Error rate" value="0.1%" delta="very low" />
                <MetricCard label="Queue depth" value="145" delta="normal" />
              </div>
              <div style={{ marginTop: 12, padding: 12, border: '1px solid #2b3952', background: '#0f1829', borderRadius: 8 }}>
                <div style={{ color: '#9fb3d9', marginBottom: 6 }}>Timeline (mock)</div>
                <div style={{ height: 10, background: '#0f1a2c', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ width: '65%', height: '100%', background: '#2e68ff' }} />
                </div>
              </div>
            </div>
          ) : realIndex === 7 ? (
            <div>
              <h3 style={{ margin: '0 0 8px 0', display:'flex', alignItems:'center', gap:8 }}>
                <span>{s.title}</span>
                <SpecLinkButton 
                  moduleName="Analytics" 
                  scenarioTitle={s.title} 
                  onUpdateCheck={setShowUpdateResult}
                />
              </h3>
              <p style={{ color: '#9fb3d9', marginTop: 0 }}>{s.intro}</p>
              <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
                <div style={{ padding: 12, border: '1px solid #2b3952', background: '#0f1829', borderRadius: 8 }}>
                  <Select label="Data Type *" defaultValue="behavior" options={[{label:'Player behavior', value:'behavior'},{label:'Revenue', value:'revenue'}]} />
                  <div style={{ height: 8 }} />
                  <DateRangeCmp label="Date Range *" />
                  <div style={{ height: 8 }} />
                  <Select label="Format *" defaultValue="xlsx" options={[{label:'Excel', value:'xlsx'},{label:'CSV', value:'csv'}]} />
                  <div style={{ height: 12 }} />
                  <Button size="sm">Generate Export</Button>
                </div>
                <div style={{ padding: 12, border: '1px solid #2b3952', background: '#0f1829', borderRadius: 8 }}>
                  <div style={{ color: '#9fb3d9', marginBottom: 8 }}>Result (mock)</div>
                  <div>Link: download-link (mock)</div>
                  <div>Size: 45MB</div>
                </div>
              </div>
            </div>
          ) : (
            <ScenarioRunner title={s.title} intro={s.intro} steps={s.steps} onStepNext={() => {}} onFinish={() => {}} />
          )}
            </div>
          );
        })}
        <div style={{ marginTop: 8, color: '#9fb3d9' }}>Active campaigns: {state.campaigns.length}</div>
    </div>
  );
}

function MetricCard({ label, value, delta }: { label: string; value: string; delta: string }) {
  return (
    <div style={{ padding: 12, border: '1px solid #2b3952', background: '#0f1829', borderRadius: 8 }}>
      <div style={{ color: '#9fb3d9', fontSize: 12 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700 }}>{value}</div>
      <div style={{ color: delta.includes('↓') ? '#ff7b7b' : '#4ade80', fontSize: 12 }}>{delta}</div>
    </div>
  );
}

function TrendCard({ title, points }: { title: string; points: number[] }) {
  const max = Math.max(...points);
  return (
    <div style={{ padding: 12, border: '1px solid #2b3952', background: '#0f1829', borderRadius: 8 }}>
      <div style={{ color: '#9fb3d9', marginBottom: 8 }}>{title}</div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 80 }}>
        {points.map((p, idx) => (
          <div key={idx} style={{ width: 8, height: Math.max(6, Math.round((p / max) * 80)), background: '#2e68ff', borderRadius: 4 }} />
        ))}
      </div>
    </div>
  );
}

function AlertCard({ title, time, delta }: { title: string; time: string; delta: string }) {
  return (
    <div style={{ padding: 12, border: '1px solid #3b2b2b', background: '#251a1a', borderRadius: 8 }}>
      <div style={{ fontWeight: 600 }}>{title}</div>
      <div style={{ color: '#9fb3d9', fontSize: 12 }}>Detected at {time}</div>
      <div style={{ color: '#ffb02e', marginTop: 6 }}>{delta}</div>
    </div>
  );
}

function BreakdownCard({ title, rows }: { title: string; rows: [string, string][] }) {
  return (
    <div style={{ padding: 12, border: '1px solid #2b3952', background: '#0f1829', borderRadius: 8 }}>
      <div style={{ color: '#9fb3d9', marginBottom: 8 }}>{title}</div>
      <div style={{ display: 'grid', gap: 6 }}>
        {rows.map(([l, r]) => (
          <div key={l} style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>{l}</span>
            <span style={{ color: r.includes('-') ? '#ff7b7b' : '#4ade80' }}>{r}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ABVariant({ title, conv, rpu, color }: { title: string; conv: string; rpu: string; color: string }) {
  return (
    <div style={{ padding: 12, border: '1px solid #2b3952', background: '#0f1829', borderRadius: 8 }}>
      <div style={{ fontWeight: 600, color }}>{title}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
        <span style={{ color: '#9fb3d9' }}>Conversion</span>
        <span>{conv}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        <span style={{ color: '#9fb3d9' }}>Revenue/User</span>
        <span>{rpu}</span>
      </div>
    </div>
  );
}



