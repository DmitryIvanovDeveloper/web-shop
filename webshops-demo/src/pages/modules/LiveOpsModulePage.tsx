import { useScenario } from '../../app/store/ScenarioContext';
import { useEffect } from 'react';
import SpecLinkButton from '../../shared/ui/SpecLinkButton';
import { useState } from 'react';

type NodeKind = 'Trigger' | 'Condition' | 'Action' | 'Schedule' | 'Cap';
type GraphNode = { id: string; kind: NodeKind; label: string; x: number; y: number };
type Edge = { from: string; to: string };

export default function LiveOpsModulePage() {
  const { selectedScenario, setSelectedScenario } = useScenario();
  const scenarios = [
    { title: 'Graph Builder' },
    { title: 'Event Simulator' },
  ];
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

  const [nodes, setNodes] = useState<GraphNode[]>([
    { id: 't1', kind: 'Trigger', label: 'session_start', x: 40, y: 60 },
    { id: 'c1', kind: 'Condition', label: 'rfm > 60', x: 240, y: 60 },
    { id: 'a1', kind: 'Action', label: 'inapp: Welcome Back', x: 440, y: 60 },
  ]);
  const [edges, setEdges] = useState<Edge[]>([{ from: 't1', to: 'c1' }, { from: 'c1', to: 'a1' }]);
  const [dragId, setDragId] = useState<string | null>(null);

  const onMouseDown = (id: string) => setDragId(id);
  const onMouseUp = () => setDragId(null);
  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragId) return;
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const nx = e.clientX - rect.left;
    const ny = e.clientY - rect.top;
    setNodes((list) => list.map(n => n.id === dragId ? { ...n, x: nx - 60, y: ny - 20 } : n));
  };

  const addNode = (kind: NodeKind) => {
    const id = kind[0].toLowerCase() + Math.random().toString(36).slice(2, 6);
    setNodes(n => [...n, { id, kind, label: kind, x: 80 + n.length * 20, y: 140 }]);
  };
  const connect = (from: string, to: string) => setEdges(e => [...e, { from, to }]);

  return (
    <div style={{ display: 'grid', gap: 16, maxWidth: '100%', overflow: 'hidden' }}>
      {displayScenarios.map((_, i) => {
        const realIndex = selectedScenario !== null ? selectedScenario : i;
        return (
          <div id={`sc-${realIndex + 1}`} key={realIndex} style={{ border: '1px solid #1b2536', borderRadius: 8, padding: 12 }}>
            {realIndex === 0 ? (
              <div>
                <h3 style={{ margin: 0, marginBottom: 8, display:'flex', alignItems:'center', gap:8 }}>
                  <span>Graph Builder</span>
                  <span style={{ marginLeft:'auto' }} />
                  <SpecLinkButton moduleName="LiveOps" scenarioTitle="Graph Builder" />
                </h3>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ width: 180 }}>
                    <div style={{ color:'#9fb3d9', marginBottom: 8 }}>Nodes</div>
                    {(['Trigger','Condition','Action','Schedule','Cap'] as NodeKind[]).map(k => (
                      <button key={k} onClick={()=>addNode(k)} style={{ width:'100%', marginBottom: 6, background:'#11253f', color:'#e7f0ff', border:'1px solid #2b3952', borderRadius:6, padding:'6px 8px', cursor:'pointer' }}>{k}</button>
                    ))}
                    <div style={{ marginTop: 12, color:'#9fb3d9' }}>Connect</div>
                    <small style={{ color:'#9fb3d9' }}>Click IDs in canvas order</small>
                  </div>
                  <div onMouseMove={onMouseMove} onMouseUp={onMouseUp} style={{ position:'relative', flex:1, height: 360, background:'#0f1a2c', border:'1px solid #2b3952', borderRadius: 8 }}>
                    <svg width="100%" height="100%" style={{ position:'absolute', top:0, left:0 }}>
                      {edges.map((e, idx) => {
                        const a = nodes.find(n=>n.id===e.from);
                        const b = nodes.find(n=>n.id===e.to);
                        if (!a || !b) return null;
                        return <line key={idx} x1={a.x+60} y1={a.y+20} x2={b.x+60} y2={b.y+20} stroke="#2e68ff" strokeWidth={2} />;
                      })}
                    </svg>
                    {nodes.map(n => (
                      <div key={n.id} onMouseDown={()=>onMouseDown(n.id)} style={{ position:'absolute', left:n.x, top:n.y, width:120, padding:8, background:'#131b2b', border:'1px solid #2b3952', borderRadius:8, cursor:'move' }}>
                        <div style={{ fontSize:10, color:'#9fb3d9' }}>{n.id}</div>
                        <div style={{ fontWeight:700 }}>{n.kind}</div>
                        <div style={{ fontSize:12 }}>{n.label}</div>
                        <button onClick={()=>connect(n.id, prompt('connect to id:') || '')} style={{ marginTop:6, background:'#2e68ff', color:'#fff', border:'none', borderRadius:4, padding:'4px 6px', cursor:'pointer' }}>Connect</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h3 style={{ margin: 0, marginBottom: 8, display:'flex', alignItems:'center', gap:8 }}>
                  <span>Event Simulator</span>
                  <span style={{ marginLeft:'auto' }} />
                  <SpecLinkButton moduleName="LiveOps" scenarioTitle="Event Simulator" />
                </h3>
                <div style={{ display:'grid', gap: 8, gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))' }}>
                  {['session_start','no_login_3d','add_to_cart','purchase','level_up'].map(ev => (
                    <button key={ev} onClick={()=>alert(`Event '${ev}' processed (mock)`)} style={{ background:'#11253f', color:'#e7f0ff', border:'1px solid #2b3952', borderRadius:6, padding:'8px 12px', cursor:'pointer' }}>{ev}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}


