'use client';

import type { CSSProperties } from 'react';

export interface UniversalImageProps {
  readonly src?: string;
  readonly alt?: string;
  readonly className?: string;
  readonly style?: CSSProperties;
}

export function UniversalImage({ 
  src, 
  alt = '', 
  className = '', 
  style 
}: UniversalImageProps): JSX.Element | null {
  // Don't render img if src is empty, undefined, or null
  // Explicitly check for empty string to prevent React warning
  if (!src || src.trim() === '') {
    return null;
  }
  
  return <img src={src} alt={alt} className={className} style={style} />;
}

