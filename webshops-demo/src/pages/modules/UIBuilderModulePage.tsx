import ScenarioRunner from '../../shared/ui/ScenarioRunner';
import type { Step } from '../../shared/ui/ScenarioRunner';
// import { useAppStore } from '../../app/store/AppStore';
import { useScenario } from '../../app/store/ScenarioContext';
import { Input, Select, Button } from '../../shared/ui/universal';
import SpecLinkButton from '../../shared/ui/SpecLinkButton';

const steps: Step[] = [
  { kind: 'info', title: 'Open UI Builder', description: 'Drag & drop interface (mock)' },
  { kind: 'form', title: 'Create Theme', description: 'Base theme settings', fields: [
    { name: 'primary', label: 'Primary Color', required: true },
    { name: 'font', label: 'Font Family' },
  ] },
  { kind: 'form', title: 'Customize Layout', description: 'Add components', fields: [
    { name: 'components', label: 'Components (comma-separated)' }
  ] },
  { kind: 'confirm', title: 'Apply Theme', summary: { theme: 'applied (mock)' } }
];

export default function UIBuilderModulePage() {
  // Removed overview; state is not used here now
  // const { state } = useAppStore();
  const { selectedScenario } = useScenario();
  const scenarios = steps.map((s) => ({ title: s.title, step: s }));

  // Guard against out-of-range index
  const safeIndex = selectedScenario !== null && (selectedScenario < 0 || selectedScenario >= scenarios.length)
    ? 0
    : selectedScenario;
  const displayScenarios = safeIndex !== null ? [scenarios[safeIndex]] : scenarios;

  return (
    <div style={{ display: 'grid', gap: 16, maxWidth: '100%', overflow: 'hidden' }}>
      {displayScenarios.map(({ title, step }, idx) => {
        const realIndex = safeIndex !== null ? safeIndex : idx;
        return (
        <div id={`sc-${realIndex + 1}`} key={realIndex} style={{ border: '1px solid #1b2536', borderRadius: 8, padding: 12 }}>
          {realIndex === 0 ? (
            <div>
              <h3 style={{ margin: 0, marginBottom: 8, display:'flex', alignItems:'center', gap:8 }}>
                <span>{title}</span>
                <span style={{ marginLeft:'auto' }} />
                <SpecLinkButton moduleName="UIBuilder" scenarioTitle={title} />
              </h3>
              <p style={{ color: '#9fb3d9', marginTop: 0 }}>Drag and drop interface mock: palette and canvas preview.</p>
              <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '240px 1fr' }}>
                <div style={{ padding: 12, border: '1px solid #2b3952', borderRadius: 8 }}>
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>Palette</div>
                  <ul style={{ margin: 0 }}>
                    <li>Button</li>
                    <li>Card</li>
                    <li>Banner</li>
                    <li>Product Tile</li>
                  </ul>
                </div>
                <div style={{ padding: 12, border: '1px solid #2b3952', borderRadius: 8 }}>
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>Canvas (mock)</div>
                  <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
                    <div style={{ height: 80, background: '#11253f', border: '1px dashed #2b3952', borderRadius: 8 }} />
                    <div style={{ height: 80, background: '#11253f', border: '1px dashed #2b3952', borderRadius: 8 }} />
                    <div style={{ height: 80, background: '#11253f', border: '1px dashed #2b3952', borderRadius: 8 }} />
                  </div>
                </div>
              </div>
            </div>
          ) : realIndex === 1 ? (
            <div>
              <h3 style={{ margin: 0, marginBottom: 8, display:'flex', alignItems:'center', gap:8 }}>
                <span>{title}</span>
                <span style={{ marginLeft:'auto' }} />
                <SpecLinkButton moduleName="UIBuilder" scenarioTitle={title} />
              </h3>
              <p style={{ color: '#9fb3d9', marginTop: 0 }}>Define base theme settings (mock).</p>
              <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
                <Input label="Primary Color *" placeholder="#2e68ff" />
                <Select label="Font Family" defaultValue="Inter" options={[{label:'Inter', value:'Inter'},{label:'Roboto', value:'Roboto'}]} />
                <Button size="sm">Apply</Button>
              </div>
            </div>
          ) : realIndex === 2 ? (
            <div>
              <h3 style={{ margin: 0, marginBottom: 8, display:'flex', alignItems:'center', gap:8 }}>
                <span>{title}</span>
                <span style={{ marginLeft:'auto' }} />
                <SpecLinkButton moduleName="UIBuilder" scenarioTitle={title} />
              </h3>
              <p style={{ color: '#9fb3d9', marginTop: 0 }}>Add components to layout (mock).</p>
              <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
                <Select label="Add Component" defaultValue="button" options={[{label:'Button', value:'button'},{label:'Card', value:'card'},{label:'Banner', value:'banner'}]} />
                <Button size="sm">Add to Canvas</Button>
              </div>
            </div>
          ) : (
            <ScenarioRunner title={title} steps={[step]} onStepNext={() => {}} onFinish={() => {}} />
          )}
        </div>
        );
      })}
    </div>
  );
}



