import React, { forwardRef, useId } from 'react';

type BaseFieldProps = {
  label?: string;
  helperText?: string;
  error?: boolean;
  size?: 'sm' | 'md' | 'lg';
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
};

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & BaseFieldProps>(
  (props, ref) => {
    const { label, helperText, error, id, style, size = 'md', startIcon, endIcon, ...rest } = props;
    const autoId = useId();
    const fieldId = id ?? autoId;
    const paddings = ({ sm: 8, md: 12, lg: 14 } as const)[size ?? 'md'];
    return (
      <div>
        {label && <label htmlFor={fieldId} style={{ display: 'block', marginBottom: 6, color: '#9fb3d9', fontSize: 12, textAlign: 'left' }}>{label}</label>}
        <div style={{ position: 'relative' }}>
          {startIcon && <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9fb3d9' }}>{startIcon}</span>}
          <input
            id={fieldId}
            ref={ref}
            aria-invalid={error || undefined}
            {...rest}
            style={{ width: '100%', boxSizing: 'border-box', padding: paddings, paddingLeft: startIcon ? paddings + 16 : paddings, paddingRight: endIcon ? paddings + 16 : paddings, background: '#11253f', color: '#e7f0ff', border: `1px solid ${error ? '#ff7b7b' : '#2b3952'}`, borderRadius: 8, outlineColor: '#2e68ff', ...style }}
          />
          {endIcon && <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#9fb3d9' }}>{endIcon}</span>}
        </div>
        {helperText && <div style={{ color: error ? '#ff7b7b' : '#7e92b8', marginTop: 4, fontSize: 12 }}>{helperText}</div>}
      </div>
    );
  }
);
Input.displayName = 'Input';

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement> & BaseFieldProps & { options?: { label: string; value: string }[] }>(
  (props, ref) => {
    const { label, helperText, error, options, children, id, style, size = 'md', startIcon, endIcon, ...rest } = props;
    const autoId = useId();
    const fieldId = id ?? autoId;
    const paddings = ({ sm: 8, md: 12, lg: 14 } as const)[size ?? 'md'];
    return (
      <div>
        {label && <label htmlFor={fieldId} style={{ display: 'block', marginBottom: 6, color: '#9fb3d9', fontSize: 12, textAlign: 'left' }}>{label}</label>}
        <div style={{ position: 'relative' }}>
          {startIcon && <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9fb3d9' }}>{startIcon}</span>}
          <select
            id={fieldId}
            ref={ref}
            aria-invalid={error || undefined}
            {...rest}
            style={{ width: '100%', boxSizing: 'border-box', padding: paddings, paddingLeft: startIcon ? paddings + 16 : paddings, paddingRight: endIcon ? paddings + 16 : paddings, background: '#11253f', color: '#e7f0ff', border: `1px solid ${error ? '#ff7b7b' : '#2b3952'}`, borderRadius: 8, outlineColor: '#2e68ff', ...style }}
          >
            <option value="" disabled>Select...</option>
            {options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            {children}
          </select>
          {endIcon && <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#9fb3d9' }}>{endIcon}</span>}
        </div>
        {helperText && <div style={{ color: error ? '#ff7b7b' : '#7e92b8', marginTop: 4, fontSize: 12 }}>{helperText}</div>}
      </div>
    );
  }
);
Select.displayName = 'Select';

export function Button(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    align?: 'start' | 'center' | 'end' | 'stretch';
  }
) {
  const { variant = 'primary', size = 'md', align = 'start', style, ...rest } = props;
  const base: React.CSSProperties = variant === 'primary'
    ? { background: '#2e68ff', color: '#fff', border: '1px solid #2e68ff' }
    : { background: 'transparent', color: '#9fb3d9', border: '1px solid #2b3952' };
  const sizing = ({ sm: { pad: '6px 12px', fs: 13, h: 34 }, md: { pad: '8px 14px', fs: 14, h: 38 }, lg: { pad: '10px 16px', fs: 16, h: 42 } } as const)[size];
  const self: React.CSSProperties = align === 'center'
    ? { placeSelf: 'center', justifySelf: 'center', alignSelf: 'center' }
    : align === 'end'
    ? { placeSelf: 'end', justifySelf: 'end', alignSelf: 'end', marginLeft: 'auto' }
    : align === 'stretch'
    ? { placeSelf: 'stretch', justifySelf: 'stretch', alignSelf: 'stretch', width: '100%' }
    : { placeSelf: 'start', justifySelf: 'start', alignSelf: 'start' };
  return (
    <button
      {...rest}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...self,
        padding: sizing.pad,
        minHeight: sizing.h,
        fontSize: sizing.fs,
        lineHeight: 1.2,
        borderRadius: 8,
        cursor: 'pointer',
        width: 'auto',
        maxWidth: 'max-content',
        whiteSpace: 'nowrap',
        ...base,
        ...style,
      }}
    />
  );
}

export const DateRange = forwardRef<HTMLDivElement, { value?: { start?: string; end?: string }; onChange?: (val: { start?: string; end?: string }) => void; label?: string; helperText?: string; error?: boolean; size?: 'sm' | 'md' | 'lg'; startLabel?: string; endLabel?: string; startPlaceholder?: string; endPlaceholder?: string }>(
  ({ value, onChange, label, helperText, error, size = 'md', startLabel = 'Start', endLabel = 'End', startPlaceholder = 'YYYY-MM-DD', endPlaceholder = 'YYYY-MM-DD' }, ref) => {
    const paddings = ({ sm: 8, md: 12, lg: 14 } as const)[size ?? 'md'];
    return (
      <div ref={ref as any}>
        {label && <label style={{ display: 'block', marginBottom: 6, color: '#9fb3d9', fontSize: 12, textAlign: 'left' }}>{label}</label>}
        <div style={{ display: 'grid', gap: 8, gridTemplateColumns: '1fr 1fr' }}>
          <div>
            <label style={{ display: 'block', marginBottom: 4, color: '#9fb3d9', fontSize: 12 }}>{startLabel}</label>
            <input type="date" placeholder={startPlaceholder} value={value?.start ?? ''} onChange={(e) => onChange?.({ ...value, start: e.target.value })} style={{ width: '100%', boxSizing: 'border-box', padding: paddings, background: '#11253f', color: '#e7f0ff', border: `1px solid ${error ? '#ff7b7b' : '#2b3952'}`, borderRadius: 8, outlineColor: '#2e68ff' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 4, color: '#9fb3d9', fontSize: 12 }}>{endLabel}</label>
            <input type="date" placeholder={endPlaceholder} value={value?.end ?? ''} onChange={(e) => onChange?.({ ...value, end: e.target.value })} style={{ width: '100%', boxSizing: 'border-box', padding: paddings, background: '#11253f', color: '#e7f0ff', border: `1px solid ${error ? '#ff7b7b' : '#2b3952'}`, borderRadius: 8, outlineColor: '#2e68ff' }} />
          </div>
        </div>
        {helperText && <div style={{ color: error ? '#ff7b7b' : '#7e92b8', marginTop: 4, fontSize: 12 }}>{helperText}</div>}
      </div>
    );
  }
);
DateRange.displayName = 'DateRange';


