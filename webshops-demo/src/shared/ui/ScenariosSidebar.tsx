import React from 'react';

export type ScenarioInfo = {
  id: string;
  title: string;
  preconditions: string[];
  context: string;
  goal: string;
};

export function ScenariosSidebar({ items }: { items: ScenarioInfo[] }) {
  const [selected, setSelected] = React.useState<string | null>(null);
  const current = items.find((i) => i.id === selected);

  return (
    <aside style={{ position: 'sticky', top: 12, height: 'fit-content', border: '1px solid #1b2536', borderRadius: 8, padding: 12, minWidth: 320, maxWidth: 320, textAlign: 'left' }}>
      <div style={{ fontWeight: 700, marginBottom: 8, textAlign: 'left' }}>Scenarios</div>
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
          <div style={{ fontWeight: 700, marginBottom: 6, textAlign: 'left' }}>About</div>
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
          <div style={{ color: '#9fb3d9' }}>
            <strong>Goal:</strong> {current.goal}
          </div>
        </div>
      )}
    </aside>
  );
}



