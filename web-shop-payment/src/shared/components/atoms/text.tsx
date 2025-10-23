'use client';

import type { CSSProperties, ReactNode } from 'react';

export interface UniversalTextProps {
  readonly text?: string;
  readonly children?: ReactNode;
  readonly className?: string;
  readonly style?: CSSProperties;
}

export function UniversalText({ 
  text, 
  children, 
  className = '', 
  style 
}: UniversalTextProps): JSX.Element {
  return <span className={className} style={style}>{text || children}</span>;
}

