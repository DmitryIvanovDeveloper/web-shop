'use client';

import type { CSSProperties, ReactNode, HTMLAttributes } from 'react';

export interface UniversalTextProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'style'> {
  readonly text?: string;
  readonly children?: ReactNode;
  readonly className?: string;
  readonly style?: CSSProperties;
}

export function UniversalText({ 
  text, 
  children, 
  className = '', 
  style,
  ...rest
}: UniversalTextProps): JSX.Element {
  return <span className={className} style={style} {...rest}>{text || children}</span>;
}


