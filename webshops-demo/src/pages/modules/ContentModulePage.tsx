import type { Step } from '../../shared/ui/ScenarioRunner';
import SpecLinkButton from '../../shared/ui/SpecLinkButton';
import { useScenario } from '../../app/store/ScenarioContext';
import { useEffect } from 'react';
import { useState } from 'react';

const steps: Step[] = [
  { kind: 'form', title: 'Create Post', fields: [
    { name: 'title', label: 'Title', required: true },
    { name: 'category', label: 'Category' },
  ], actionLabel: 'Save' },
  { kind: 'form', title: 'Upload Media', fields: [
    { name: 'file', label: 'File name', required: true },
    { name: 'type', label: 'Type', type: 'select', options: [
      { label: 'Video', value: 'video' },
      { label: 'Image', value: 'image' }
    ] }
  ] },
  { kind: 'form', title: 'Schedule Publish', fields: [
    { name: 'publishAt', label: 'Publish at (ISO)', required: true }
  ] },
  { kind: 'confirm', title: 'Moderation', summary: { status: 'Pending moderation (mock)' } }
];

export default function ContentModulePage() {
  const { selectedScenario, setSelectedScenario } = useScenario();
  const [post, setPost] = useState<{ title: string; category: string; cover?: string }>({ title: '', category: '' });
  const [media] = useState<Array<{ name: string; type: 'image' | 'video' }>>([
    { name: 'banner.jpg', type: 'image' },
    { name: 'teaser.mp4', type: 'video' },
    { name: 'promo.png', type: 'image' },
  ]);
  const [schedule, setSchedule] = useState<{ publishAt: string; status: 'draft' | 'scheduled' | 'published' }>({ publishAt: '', status: 'scheduled' });
  const [moderation, setModeration] = useState<Array<{ id: string; title: string; author: string; status: 'pending' | 'approved' | 'rejected' }>>([
    { id: 'm1', title: 'New weapon leak', author: 'player_42', status: 'pending' },
    { id: 'm2', title: 'Clan recruiting rules', author: 'clan_lead', status: 'pending' },
  ]);
  const scenarios = [
    { title: 'Create Post', steps: [steps[0]] },
    { title: 'Upload Media', steps: [steps[1]] },
    { title: 'Schedule Publish', steps: [steps[2]] },
    { title: 'Moderation', steps: [steps[3]] },
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
                  <span>Create Post</span>
                  <span style={{ marginLeft:'auto' }} />
                  <SpecLinkButton moduleName="Content" scenarioTitle="Create Post" />
                </h3>
                <div style={{ display: 'grid', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', color: '#9fb3d9', fontSize: 12, marginBottom: 6 }}>Title *</label>
                    <input
                      value={post.title}
                      onChange={(e) => setPost({ ...post, title: e.target.value })}
                      placeholder="New season announcement"
                      style={{ width: '100%', boxSizing: 'border-box', padding: 12, background: '#11253f', color: '#e7f0ff', border: '1px solid #2b3952', borderRadius: 8, outlineColor: '#2e68ff' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#9fb3d9', fontSize: 12, marginBottom: 6 }}>Category</label>
                    <input
                      value={post.category}
                      onChange={(e) => setPost({ ...post, category: e.target.value })}
                      placeholder="Updates / Events / Devlog"
                      style={{ width: '100%', boxSizing: 'border-box', padding: 12, background: '#11253f', color: '#e7f0ff', border: '1px solid #2b3952', borderRadius: 8, outlineColor: '#2e68ff' }}
                    />
                  </div>
                  <button
                    disabled={!post.title}
                    style={{ background: post.title ? '#2e68ff' : '#374151', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 16px', fontWeight: 700, cursor: post.title ? 'pointer' : 'not-allowed' }}
                  >
                    Save Post (mock)
                  </button>
                  {/* Preview */}
                  <div style={{ padding: 12, border: '1px solid #2b3952', borderRadius: 8 }}>
                    <div style={{ color: '#9fb3d9', fontSize: 12 }}>Preview</div>
                    <div style={{ fontSize: 18, fontWeight: 800 }}>{post.title || 'Post title'}</div>
                    <div style={{ color: '#9fb3d9' }}>{post.category || 'Category'}</div>
                  </div>
                </div>
              </div>
            ) : realIndex === 1 ? (
              <div>
              <h3 style={{ margin: 0, marginBottom: 8, display:'flex', alignItems:'center', gap:8 }}>
                <span>Upload Media</span>
                <span style={{ marginLeft:'auto' }} />
                <SpecLinkButton moduleName="Content" scenarioTitle="Upload Media" />
              </h3>
                <div style={{ display: 'grid', gap: 12 }}>
                  {/* Upload area */}
                  <div style={{ padding: 16, border: '2px dashed #2b3952', borderRadius: 8, background: '#0f1a2c', textAlign: 'center', color: '#9fb3d9' }}>
                    Drag & Drop files here (mock)
                  </div>
                  {/* Grid */}
                  <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
                    {media.map((m, idx) => (
                      <div key={idx} style={{ padding: 12, border: '1px solid #2b3952', borderRadius: 8 }}>
                        <div style={{ fontSize: 22 }}>{m.type === 'image' ? '🖼️' : '🎬'}</div>
                        <div style={{ fontWeight: 600 }}>{m.name}</div>
                        <div style={{ color: '#9fb3d9', fontSize: 12 }}>{m.type}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : realIndex === 2 ? (
              <div>
              <h3 style={{ margin: 0, marginBottom: 8, display:'flex', alignItems:'center', gap:8 }}>
                <span>Schedule Publish</span>
                <span style={{ marginLeft:'auto' }} />
                <SpecLinkButton moduleName="Content" scenarioTitle="Schedule Publish" />
              </h3>
                <div style={{ display: 'grid', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', color: '#9fb3d9', fontSize: 12, marginBottom: 6 }}>Publish at (ISO) *</label>
                    <input
                      value={schedule.publishAt}
                      onChange={(e) => setSchedule({ ...schedule, publishAt: e.target.value })}
                      placeholder="2025-10-05T10:00:00Z"
                      style={{ width: '100%', boxSizing: 'border-box', padding: 12, background: '#11253f', color: '#e7f0ff', border: '1px solid #2b3952', borderRadius: 8, outlineColor: '#2e68ff' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#9fb3d9', fontSize: 12, marginBottom: 6 }}>Status</label>
                    <select
                      value={schedule.status}
                      onChange={(e) => setSchedule({ ...schedule, status: e.target.value as any })}
                      style={{ width: '100%', boxSizing: 'border-box', padding: 12, background: '#11253f', color: '#e7f0ff', border: '1px solid #2b3952', borderRadius: 8, outlineColor: '#2e68ff' }}
                    >
                      <option value="draft">Draft</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                  <button
                    disabled={!schedule.publishAt}
                    style={{ background: schedule.publishAt ? '#2e68ff' : '#374151', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 16px', fontWeight: 700, cursor: schedule.publishAt ? 'pointer' : 'not-allowed' }}
                  >
                    Apply Schedule (mock)
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h3 style={{ margin: 0, marginBottom: 8, display:'flex', alignItems:'center', gap:8 }}>
                  <span>Moderation</span>
                  <span style={{ marginLeft:'auto' }} />
                  <SpecLinkButton moduleName="Content" scenarioTitle="Moderation" />
                </h3>
                <div style={{ display: 'grid', gap: 12 }}>
                  {moderation.map((m) => (
                    <div key={m.id} style={{ display: 'grid', gap: 8, padding: 12, border: '1px solid #2b3952', borderRadius: 8, background: '#0f1a2c' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div style={{ fontWeight: 700 }}>{m.title}</div>
                        <span style={{ color: '#9fb3d9', fontSize: 12 }}>by {m.author}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => setModeration((list) => list.map(x => x.id === m.id ? { ...x, status: 'approved' } : x))}
                          style={{ background: '#22c55e', color: '#0a0f19', border: 'none', borderRadius: 6, padding: '6px 10px', fontWeight: 700, cursor: 'pointer' }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => setModeration((list) => list.map(x => x.id === m.id ? { ...x, status: 'rejected' } : x))}
                          style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 10px', fontWeight: 700, cursor: 'pointer' }}
                        >
                          Reject
                        </button>
                        <span style={{ marginLeft: 'auto', color: '#9fb3d9', fontSize: 12 }}>Status: <strong style={{ color: '#fff' }}>{m.status}</strong></span>
                      </div>
                    </div>
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
