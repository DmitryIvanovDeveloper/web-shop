'use client';

import type { CSSProperties, ImgHTMLAttributes } from 'react';

export interface UniversalImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'style'> {
  readonly src?: string;
  readonly alt?: string;
  readonly className?: string;
  readonly style?: CSSProperties;
}

export function UniversalImage({ 
  src, 
  alt = '', 
  className = '', 
  style,
  ...rest
}: UniversalImageProps): JSX.Element | null {
      if (!src || src.trim() === '') {
    return null;
  }
  
  return <img src={src} alt={alt} className={className} style={style} {...rest} />;
}


