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

/**
 * Извлекает YouTube Video ID из различных форматов URL
 */
function extractYouTubeVideoId(url: string): string | null {
  if (!url) return null;

  // Уже чистый ID
  if (!url.includes('youtube.com') && !url.includes('youtu.be') && /^[a-zA-Z0-9_-]{11}$/.test(url)) {
    return url;
  }

  // https://www.youtube.com/watch?v=VIDEO_ID
  const watchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (watchMatch && watchMatch[1]) {
    return watchMatch[1];
  }

  // https://www.youtube.com/shorts/VIDEO_ID
  const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
  if (shortsMatch && shortsMatch[1]) {
    return shortsMatch[1];
  }

  // https://www.youtube.com/embed/VIDEO_ID
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
  console.log('[UniversalVideo] Rendering with props', {
    url,
    videoId,
    width,
    height,
    autoplay,
    controls,
    allowFullScreen
  });

  // Определяем ID видео
  const id = videoId || (url ? extractYouTubeVideoId(url) : null);
  
  console.log('[UniversalVideo] Extracted video ID', { id, fromUrl: url, fromVideoId: videoId });
  
  if (!id) {
    console.warn('[UniversalVideo] No video ID found, returning null');
    return null;
  }

  // Используем React state для отслеживания ошибок загрузки iframe
  const [iframeError, setIframeError] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Проверяем, является ли это YouTube Shorts
  const isShorts = url?.includes('/shorts/');
  
  // Пытаемся использовать iframe для всех видео (включая Shorts)
  // Превью показываем только если iframe не работает
  const usePreview = false;
  
  // Формируем embed URL для всех YouTube видео (включая Shorts)
  // Для Shorts пробуем использовать обычный embed URL
  let embedUrl: URL;
  
  if (isShorts) {
    // Для Shorts используем embed URL с параметром, который может помочь
    embedUrl = new URL(`https://www.youtube.com/embed/${id}`);
  } else {
    embedUrl = new URL(`https://www.youtube.com/embed/${id}`);
  }
  
  // Добавляем параметры
  const params = new URLSearchParams();
  if (autoplay) params.append('autoplay', '1');
  if (!controls) params.append('controls', '0');
  params.append('rel', '0'); // Не показывать связанные видео в конце
  params.append('modestbranding', '1'); // Убираем логотип YouTube
  params.append('playsinline', '1'); // Воспроизведение встроенное (для мобильных)
  
  if (params.toString()) {
    embedUrl.search = params.toString();
  }

  console.log('[UniversalVideo] Embed URL:', embedUrl.toString(), 'original URL:', url, 'isShorts:', isShorts, 'usePreview:', usePreview);

  // Таймаут для проверки загрузки iframe (5 секунд)
  useEffect(() => {
    if (usePreview || iframeError) return;
    
    const timer = setTimeout(() => {
      if (!iframeLoaded) {
        console.warn('[UniversalVideo] Iframe did not load within 5 seconds, showing fallback');
        setIframeError(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [iframeLoaded, usePreview, iframeError]);

  // Extract minHeight from style if present, apply to container
  const containerStyle: CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    minHeight: style?.minHeight || '315px', // Default minHeight for Video component
    ...style
  };

  const iframeStyle: CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    border: 'none',
  };

  console.log('[UniversalVideo] Rendering iframe with style:', iframeStyle, 'container style:', { width, height, ...style }, 'iframeError:', iframeError);

  // Fallback: если iframe не загрузился или это Shorts, показываем превью с кнопкой
  const thumbnailUrl = `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
  const videoUrl = url || (isShorts ? `https://www.youtube.com/shorts/${id}` : `https://www.youtube.com/watch?v=${id}`);

  // Если iframe ошибся или это Shorts, показываем превью с модальным окном
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
            {/* Превью изображение */}
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
            
            {/* Overlay с кнопкой play */}
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
              {/* Кнопка play */}
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

        {/* Модальное окно с iframe */}
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
          console.log('[UniversalVideo] Iframe loaded successfully');
          setIframeLoaded(true);
          setIframeError(false);
        }}
        onError={(e) => {
          console.error('[UniversalVideo] Iframe load error:', e);
          setIframeError(true);
        }}
      />
    </div>
  );
}




