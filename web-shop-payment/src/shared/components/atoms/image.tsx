'use client';

import type { CSSProperties } from 'react';

export interface UniversalImageProps {
  readonly src?: string;
  readonly alt?: string;
  readonly className?: string;
  readonly style?: CSSProperties;
}

export function UniversalImage({ 
  src = '', 
  alt = '', 
  className = '', 
  style 
}: UniversalImageProps): JSX.Element {
  return <img src={src} alt={alt} className={className} style={style} />;
}

