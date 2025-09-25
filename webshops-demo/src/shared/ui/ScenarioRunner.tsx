import { useMemo, useState } from 'react';
import { Input, Select, Button, DateRange as DateRangeCmp } from './universal';

type Field = {
  name: string;
  label: string;
  type?: 'text' | 'number' | 'select' | 'date' | 'daterange';
  required?: boolean;
  options?: { label: string; value: string }[];
};

type StepInfo = { kind: 'info'; title: string; description?: string; actionLabel?: string };
type StepForm = { kind: 'form'; title: string; description?: string; fields: Field[]; actionLabel?: string };
type StepConfirm = { kind: 'confirm'; title: string; summary?: Record<string, unknown>; actionLabel?: string };
export type Step = StepInfo | StepForm | StepConfirm;

type Props = {
  title: string;
  steps: Step[];
  onFinish?: (data: Record<string, unknown>) => void;
  onStepNext?: (index: number, data: Record<string, unknown>) => void;
  intro?: string;
};

export default function ScenarioRunner({ title, steps, onFinish, onStepNext, intro }: Props) {
  const [index, setIndex] = useState(0);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const step = steps[index];
  const isFirst = index === 0;
  const isLast = index === steps.length - 1;
  const isSingle = steps.length === 1;

  const isValid = useMemo(() => {
    if (step.kind !== 'form') return true;
    return step.fields.every((f) => {
      if (!f.required) return true;
      const val = formData[f.name];
      if (f.type === 'daterange') {
        return Boolean((val as any)?.start) && Boolean((val as any)?.end);
      }
      return !!val || val === 0;
    });
  }, [step, formData]);

  function handleNext() {
    if (isLast) {
      onFinish?.(formData);
      return;
    }
    onStepNext?.(index, formData);
    setIndex((i) => Math.min(steps.length - 1, i + 1));
  }

  return (
    <div>
      <h2 style={{ marginBottom: 8 }}>{title}</h2>
      {intro && <p style={{ color: '#9fb3d9', marginTop: 0 }}>{intro}</p>}
      {!isSingle && (
        <>
          <div style={{ color: '#9fb3d9', marginBottom: 8 }}>Step {index + 1} / {steps.length}</div>
          <div style={{ height: 6, background: '#0f1a2c', borderRadius: 999, overflow: 'hidden', marginBottom: 16 }}>
            <div style={{ width: `${((index + 1) / steps.length) * 100}%`, background: '#2e68ff', height: '100%' }} />
          </div>
        </>
      )}
      <div style={{ padding: 16, border: '1px solid #2b3952', background: '#111a2b', borderRadius: 8, boxShadow: '0 0 0 1px rgba(43,57,82,0.2) inset' }}>
        <div style={{ fontWeight: 600, marginBottom: 10 }}>{step.title}</div>
        {step.kind === 'info' && step.description && (
          <div style={{ color: '#9fb3d9' }}>{step.description}</div>
        )}
        {step.kind === 'form' && (
          <div style={{ display: 'grid', gap: 10 }}>
            {step.description && <div style={{ color: '#9fb3d9' }}>{step.description}</div>}
            {step.fields.map((f) => (
              <div key={f.name}>
                {(!f.type || f.type === 'text' || f.type === 'number' || f.type === 'date') && (
                  <Input
                    label={`${f.label}${f.required ? ' *' : ''}`}
                    type={f.type === 'date' ? 'date' : (f.type || 'text')}
                    value={(formData[f.name] as string | number | undefined) ?? ''}
                    onChange={(e) => setFormData((d) => ({ ...d, [f.name]: f.type === 'number' ? Number((e.target as HTMLInputElement).value) : (e.target as HTMLInputElement).value }))}
                    placeholder={f.type === 'number' ? 'Enter number' : 'Type here'}
                  />
                )}
                {f.type === 'daterange' && (
                  <DateRangeCmp
                    label={`${f.label}${f.required ? ' *' : ''}`}
                    value={(formData[f.name] as any) ?? {}}
                    onChange={(val) => setFormData((d) => ({ ...d, [f.name]: val }))}
                  />
                )}
                {f.type === 'select' && (
                  <Select
                    required={f.required}
                    label={`${f.label}${f.required ? ' *' : ''}`}
                    value={(formData[f.name] as string | undefined) ?? ''}
                    onChange={(e) => setFormData((d) => ({ ...d, [f.name]: (e.target as HTMLSelectElement).value }))}
                    options={f.options}
                  />
                )}
              </div>
            ))}
            {!isValid && <div style={{ color: '#ff7b7b' }}>Please fill required fields</div>}
          </div>
        )}
        {step.kind === 'confirm' && (
          <div style={{ color: '#9fb3d9' }}>
            {step.summary && (
              <pre style={{ background: '#0a1322', padding: 12, borderRadius: 6, border: '1px solid #1b2536', overflowX: 'auto' }}>
{JSON.stringify(step.summary, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        {!isSingle && (
          <>
            <Button variant="ghost" disabled={isFirst} onClick={() => setIndex((i) => Math.max(0, i - 1))}>Back</Button>
            <Button variant="ghost" onClick={() => { setIndex(0); setFormData({}); }}>Reset</Button>
          </>
        )}
        {(step.kind !== 'info') && (
          <Button disabled={step.kind === 'form' && !isValid} onClick={handleNext}>
            {isSingle ? (step.actionLabel || 'Submit') : (step.actionLabel || (isLast ? 'Finish' : 'Next'))}
          </Button>
        )}
      </div>
    </div>
  );
}
