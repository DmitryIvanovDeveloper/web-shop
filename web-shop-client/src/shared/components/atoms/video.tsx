'use client';

import { useState, useEffect } from 'react';
import type { CSSProperties, HTMLAttributes } from 'react';

export interface UniversalVideoProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  readonly url?: string;
  readonly videoId?: string;
  readonly className?: string;
  readonly style?: CSSProperties;
  readonly width?: string | number;
  readonly height?: string | number;
  readonly autoplay?: boolean;
  readonly controls?: boolean;
  readonly allowFullScreen?: boolean;
}

function extractYouTubeVideoId(url: string): string | null {
  if (!url) return null;

  if (!url.includes('youtube.com') && !url.includes('youtu.be') && /^[a-zA-Z0-9_-]{11}$/.test(url)) {
    return url;
  }

  const watchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (watchMatch && watchMatch[1]) {
    return watchMatch[1];
  }

  const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
  if (shortsMatch && shortsMatch[1]) {
    return shortsMatch[1];
  }

  const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch && embedMatch[1]) {
    return embedMatch[1];
  }

  return null;
}

export function UniversalVideo({ 
  url,
  videoId,
  className = '', 
  style,
  width = '100%',
  height = '315',
  autoplay = false,
  controls = true,
  allowFullScreen = true,
  ...rest
}: UniversalVideoProps): JSX.Element | null {
  const [iframeError, setIframeError] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const id = videoId || (url ? extractYouTubeVideoId(url) : null);

  const isShorts = url?.includes('/shorts/');

  const usePreview = false;

  useEffect(() => {
    if (usePreview || iframeError) return;

    const timer = setTimeout(() => {
      if (!iframeLoaded) {
        setIframeError(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [iframeLoaded, usePreview, iframeError]);

  if (!id) {
    return null;
  }
  
  let embedUrl: URL;

  if (isShorts) {
    // YouTube Shorts embed URL
    embedUrl = new URL(
      url?.replace('/shorts/', '/embed/') ?? 'https://www.youtube.com/embed',
    );
  } else {
    // Regular YouTube watch URL → embed URL
    if (url && url.includes('watch')) {
      const parsed = new URL(url);
      const videoId = parsed.searchParams.get('v');
      embedUrl = new URL(`https://www.youtube.com/embed/${videoId ?? ''}`);
    } else {
      embedUrl = new URL(url ?? 'https://www.youtube.com/embed');
    }
  }
  
  const params = new URLSearchParams();
  if (autoplay) params.append('autoplay', '1');
  if (!controls) params.append('controls', '0');
  params.append('rel', '0');
  params.append('modestbranding', '1');
  params.append('playsinline', '1');
  
  if (params.toString()) {
    embedUrl.search = params.toString();
  }

  const containerStyle: CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    minHeight: style?.minHeight || '315px',
    ...style
  };

  const iframeStyle: CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    border: 'none',
  };

  const videoUrl =
    url || (isShorts ? embedUrl.toString() : 'https://www.youtube.com');
  const thumbnailVideoId = (() => {
    try {
      const parsed = new URL(videoUrl);
      if (parsed.hostname.includes('youtube.com') || parsed.hostname.includes('youtu.be')) {
        if (parsed.hostname === 'youtu.be') {
          return parsed.pathname.slice(1);
        }
        const id = parsed.searchParams.get('v');
        if (id) return id;
        const parts = parsed.pathname.split('/');
        return parts[parts.length - 1] || '';
      }
    } catch {
      // ignore parse errors
    }
    return '';
  })();
  const thumbnailUrl = thumbnailVideoId
    ? `https://img.youtube.com/vi/${thumbnailVideoId}/hqdefault.jpg`
    : '';
  if (usePreview || iframeError) {
    return (
      <>
        <div className={className} style={{ width, height, minHeight: style?.minHeight || '315px', ...style, position: 'relative' }} {...rest}>
          <div
            onClick={() => setShowModal(true)}
            style={{
              display: 'block',
              width: '100%',
              height: '100%',
              position: 'relative',
              cursor: 'pointer',
              borderRadius: '8px',
              overflow: 'hidden',
              backgroundColor: '#000',
            }}
          >
            <img
              src={thumbnailUrl}
              alt="YouTube video preview"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                transition: 'background-color 0.2s',
              }}
            >
              <div
                style={{
                  width: '68px',
                  height: '48px',
                  backgroundColor: '#FF0000',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4)',
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8 5v14l11-7z"
                    fill="#FFFFFF"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {showModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
            }}
            onClick={() => setShowModal(false)}
          >
            <div
              style={{
                position: 'relative',
                width: '90%',
                maxWidth: '900px',
                aspectRatio: '16/9',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowModal(false)}
                style={{
                  position: 'absolute',
                  top: '-40px',
                  right: 0,
                  background: 'none',
                  border: 'none',
                  color: '#fff',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '8px',
                }}
              >
                ✕
              </button>
              <iframe
                src={embedUrl.toString()}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  borderRadius: '8px',
                }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="YouTube video player"
              />
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className={className} style={containerStyle} {...rest}>
      <iframe
        src={embedUrl.toString()}
        width={typeof width === 'number' ? width : undefined}
        height={typeof height === 'number' ? height : undefined}
        style={iframeStyle}
        allow={allowFullScreen ? 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture' : 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope'}
        allowFullScreen={allowFullScreen}
        title="YouTube video player"
        loading="lazy"
        onLoad={() => {
          setIframeLoaded(true);
          setIframeError(false);
        }}
        onError={(e) => {
          setIframeError(true);
        }}
      />
    </div>
  );
}




