import React from 'react';
import { useDocumentUpdateCheck } from '../hooks/useDocumentUpdateCheck';

export type ScenarioInfo = {
  id: string;
  title: string;
  preconditions: string[];
  context: string;
  goal: string;
};

export function ScenariosSidebar({ items, moduleName }: { items: ScenarioInfo[], moduleName: string }) {
  const [selected, setSelected] = React.useState<string | null>(null);
  const [outdatedScenarios, setOutdatedScenarios] = React.useState<{title: string, isOutdated: boolean}[]>([]);
  const current = items.find((i) => i.id === selected);
  
  // Check document updates for all scenarios
  const scenarioUpdateChecks = items.map(item => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useDocumentUpdateCheck(moduleName, item.title);
  });

  // Check document updates for the selected scenario
  const { isChecking, isOutdated, lastChecked } = useDocumentUpdateCheck(
    moduleName, 
    current?.title || ''
  );

  // Collect outdated scenarios
  React.useEffect(() => {
    const outdated = items.map((item, index) => ({
      title: item.title,
      isOutdated: scenarioUpdateChecks[index]?.isOutdated || false
    })).filter(s => s.isOutdated);
    
    setOutdatedScenarios(outdated);
  }, [items, scenarioUpdateChecks]);

  return (
    <aside style={{ position: 'sticky', top: 12, height: 'fit-content', border: '1px solid #1b2536', borderRadius: 8, padding: 12, minWidth: 320, maxWidth: 320, textAlign: 'left' }}>
      <div style={{ fontWeight: 700, marginBottom: 8, textAlign: 'left' }}>Scenarios</div>
      
      {/* Outdated scenarios table */}
      {outdatedScenarios.length > 0 && (
        <div style={{ 
          marginBottom: 12, 
          padding: 8, 
          border: '1px solid #7f1d1d', 
          borderRadius: 6, 
          background: '#3f1d1d' 
        }}>
          <div style={{ color: '#fca5a5', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
            ⚠️ Outdated Scenarios ({outdatedScenarios.length})
          </div>
          <div style={{ fontSize: 11, color: '#9fb3d9' }}>
            {outdatedScenarios.map((scenario, idx) => (
              <div key={idx} style={{ marginBottom: 2 }}>
                • {scenario.title}
              </div>
            ))}
          </div>
        </div>
      )}
      
      <ul style={{ paddingLeft: 0, marginTop: 0, listStyle: 'none' }}>
        {items.map((s) => (
          <li key={s.id} style={{ marginBottom: 6 }}>
            <a
              href={`#${s.id}`}
              onClick={(e) => {
                e.preventDefault();
                setSelected(s.id);
                document.querySelector(`#${s.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              style={{ color: '#9fb3d9', textDecoration: 'none', display: 'block', textAlign: 'left' }}
            >
              {s.title}
            </a>
          </li>
        ))}
      </ul>
      {current && (
        <div style={{ marginTop: 12, borderTop: '1px solid #2b3952', paddingTop: 12 }}>
          <div style={{ fontWeight: 700, marginBottom: 6, textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8 }}>
            About
            {isChecking && (
              <span style={{ color: '#fbbf24', fontSize: 12, border: '1px solid #92400e', background: '#451a03', padding: '2px 6px', borderRadius: 6 }}>
                Checking…
              </span>
            )}
            {isOutdated && !isChecking && (
              <span style={{ color: '#fca5a5', fontSize: 12, border: '1px solid #7f1d1d', background: '#3f1d1d', padding: '2px 6px', borderRadius: 6 }}>
                Outdated
              </span>
            )}
          </div>
          <div style={{ color: '#9fb3d9', marginBottom: 6 }}>
            <strong>Preconditions:</strong>
            <ul style={{ margin: 0, paddingLeft: 16 }}>
              {current.preconditions.map((p, idx) => (
                <li key={idx}>{p}</li>
              ))}
            </ul>
          </div>
          <div style={{ color: '#9fb3d9', marginBottom: 6 }}>
            <strong>Context:</strong> {current.context}
          </div>
          <div style={{ color: '#9fb3d9', marginBottom: 6 }}>
            <strong>Goal:</strong> {current.goal}
          </div>
          {lastChecked && (
            <div style={{ color: '#6b7280', fontSize: 11, marginTop: 8, borderTop: '1px solid #374151', paddingTop: 6 }}>
              Last checked: {lastChecked.toLocaleTimeString()}
            </div>
          )}
        </div>
      )}
    </aside>
  );
}



