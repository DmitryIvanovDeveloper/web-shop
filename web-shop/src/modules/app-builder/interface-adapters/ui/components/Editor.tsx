/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import 'grapesjs/dist/css/grapes.min.css';
import GjsEditor from '@grapesjs/react';
import grapesjs from 'grapesjs';
import presetWebpage from 'grapesjs-preset-webpage';

export interface EditorProps {
  value?: any | null;
  onChange?: (projectJson: any) => void;
  onReady?: (editor: any) => void;
  className?: string;
  readonly?: boolean;
  testMode?: boolean;
}

function debounce<T extends (...args: any[]) => void>(fn: T, delay: number): T {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return ((...args: any[]) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      fn(...args);
    }, delay);
  }) as T;
}

export const Editor: React.FC<EditorProps> = ({
  value,
  onChange,
  onReady,
  className,
  readonly = false,
  testMode = false,
}) => {
  const searchParams = useSearchParams();
  const appId = searchParams?.get('appId') ?? null;
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const editorRef = useRef<any>(null);

  // Setup change listener
  const debouncedNotifyChange = useCallback(() => {
    if (!onChange || !editorRef.current) return;
    try {
      const data = editorRef.current.getProjectData?.();
      if (data) {
        onChange(data);
      }
    } catch (error) {
      console.error('Error getting project data:', error);
    }
  }, [onChange]);

  // Load CSS variables and styles
  useEffect(() => {
    const loadStyles = () => {
      try {
        const cssVariables = `
          :root {
            --tkn-color-sem-component-sf-component-store-card: #242a42;
            --tkn-color-sem-component-br-component-store-card: #373c53;
            --tkn-color-sem-component-sf-component-badge-discount: #ef3f2b;
            --tkn-color-sem-component-br-component-badge-discount: #ef3f2b;
            --tkn-color-sem-component-tx-component-badge-discount: #ffffff;
            --tkn-color-sem-component-sf-component-card: #242a42;
            --tkn-color-sem-component-br-component-card: #373c53;
            --tkn-color-sem-component-shadow-store-card: #161924;
            --tkn-color-sem-text-tx-primary: #ffffff;
            --tkn-color-sem-text-tx-quaternary: #9297a0;
            --tkn-color-sem-component-tx-component-card-name: #ffffff;
            --tkn-color-sem-component-sf-component-badge-purchases-left: #50525c;
            --tkn-color-sem-component-br-component-badge-purchases-left: #50525c;
            --tkn-color-sem-component-tx-component-badge-purchases-left: #ffffff;
            --tkn-color-sem-component-sf-component-balance-rp: #373c53;
            --tkn-color-sem-component-tx-component-balance-rp: #8b8e9c;
            --tkn-color-sem-component-sf-component-buy: linear-gradient(180deg, #ffd300 0%, #e3bc0d 100%);
            --tkn-color-sem-component-tx-component-buy: #131521;
            --tkn-color-sem-text-tx-system-error-on-primary: #ffffff;
            --tkn-color-sem-component-tx-component-card-quantity: #ffffff;
            --tkn-color-sem-component-tx-component-card-quantity-strikethrough: #ffffff80;
            --tkn-color-sem-component-sf-component-card-quantity-strikethrough: #ef444480;
            --tkn-color-sem-text-tx-brand-a-primary: #ffd300;
            --tkn-color-sem-border-br-base-tertiary: #32364b;
            --tkn-color-sem-border-br-base-tertiary-accent: #424559;
            --tkn-color-sem-surface-sf-base-tertiary-accent: #32364b;
          }

          .store-card {
            background: var(--tkn-color-sem-component-sf-component-store-card);
            border: 1px solid var(--tkn-color-sem-component-br-component-store-card);
            border-radius: 12px;
            padding: 16px;
            position: relative;
            overflow: hidden;
          }

          .text-store-card-sku-name-2xl {
            font-family: 'Russo One', sans-serif;
            font-size: 1rem;
            font-weight: 600;
            color: var(--tkn-color-sem-component-tx-component-card-name);
          }
        `;

        const styleElement = document.createElement('style');
        styleElement.textContent = cssVariables;
        styleElement.setAttribute('data-grapesjs-store-vars', 'true');
        document.head.appendChild(styleElement);

        console.log('✅ Store CSS variables and styles loaded');
      } catch (error) {
        console.warn('⚠️ Failed to load store styles:', error);
      }
    };

    loadStyles();
    setIsLoading(false);
  }, []);

  const handleEditor = useCallback((editor: any) => {
    console.log('Editor loaded:', editor);
    editorRef.current = editor;

    if (typeof window !== 'undefined') {
      (window as any).gjsEditor = editor;
    }

    // Setup basic configuration
    editor.on('load', () => {
      console.log('Editor fully loaded');
    });

    // Register custom store components
    const bm = editor.BlockManager;

    // Store Card
    bm.add('store-card', {
      label: 'Store Card',
      category: 'Store Components',
      media: `<svg viewBox="0 0 24 24" style="width:100%;height:100%">
        <rect x="2" y="2" width="20" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="2"/>
        <circle cx="8" cy="8" r="2" fill="currentColor"/>
        <rect x="12" y="6" width="8" height="2" rx="1" fill="currentColor"/>
        <rect x="12" y="10" width="6" height="2" rx="1" fill="currentColor"/>
        <rect x="6" y="14" width="12" height="2" rx="1" fill="currentColor"/>
      </svg>`,
      attributes: { style: 'width:70px;height:70px' },
      content: {
        tagName: 'div',
        attributes: { class: 'store-card' },
        components: [{
          tagName: 'h3',
          content: 'Product Title'
        }, {
          tagName: 'p',
          content: '$99.99'
        }]
      }
    });

    // Product Image
    bm.add('product-image', {
      label: 'Product Image',
      category: 'Store Components',
      media: `<svg viewBox="0 0 24 24" style="width:100%;height:100%">
        <rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="currentColor" stroke-width="2"/>
        <circle cx="9" cy="9" r="2" fill="currentColor"/>
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" fill="none" stroke="currentColor" stroke-width="2"/>
      </svg>`,
      attributes: { style: 'width:70px;height:70px' },
      content: {
        tagName: 'div',
        components: [{
          tagName: 'img',
          attributes: {
            src: 'https://via.placeholder.com/300x200?text=Product+Image',
            alt: 'Product'
          },
          style: {
            width: '100%',
            height: '100%',
            'object-fit': 'contain'
          }
        }]
      }
    });

    // Product Name
    bm.add('product-name', {
      label: 'Product Name',
      category: 'Store Components',
      media: `<svg viewBox="0 0 24 24" style="width:100%;height:100%">
        <rect x="2" y="4" width="20" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="2"/>
        <line x1="6" y1="8" x2="18" y2="8" stroke="currentColor" stroke-width="2"/>
        <line x1="6" y1="12" x2="14" y2="12" stroke="currentColor" stroke-width="2"/>
        <line x1="6" y1="16" x2="16" y2="16" stroke="currentColor" stroke-width="2"/>
      </svg>`,
      attributes: { style: 'width:70px;height:70px' },
      content: {
        tagName: 'div',
        style: {
          'font-family': "'Russo One', sans-serif",
          'font-size': '1rem',
          'font-weight': '600',
          color: '#ffffff',
          'text-align': 'center'
        },
        components: 'Product Name'
      }
    });

    // Buy Button
    bm.add('buy-button', {
      label: 'Buy Button',
      category: 'Store Components',
      media: `<svg viewBox="0 0 24 24" style="width:100%;height:100%">
        <rect x="2" y="4" width="20" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="2"/>
        <circle cx="8" cy="10" r="1.5" fill="currentColor"/>
        <circle cx="12" cy="10" r="1.5" fill="currentColor"/>
        <circle cx="16" cy="10" r="1.5" fill="currentColor"/>
        <rect x="6" y="14" width="12" height="2" rx="1" fill="currentColor"/>
      </svg>`,
      attributes: { style: 'width:70px;height:70px' },
      content: {
        tagName: 'button',
        style: {
          width: '100%',
          background: 'linear-gradient(180deg, #ffd300 0%, #e3bc0d 100%)',
          border: 'none',
          'border-radius': '8px',
          padding: '12px',
          cursor: 'pointer',
          'font-weight': '600'
        },
        components: 'Buy Now'
      }
    });

    // Setup change listener
    if (debouncedNotifyChange) {
      editor.on('update', debouncedNotifyChange);
      editor.on('component:add', debouncedNotifyChange);
      editor.on('component:update', debouncedNotifyChange);
      editor.on('component:remove', debouncedNotifyChange);
    }

    if (onReady) {
      onReady(editor);
    }
  }, [debouncedNotifyChange, onReady]);

  if (isLoading) {
    return (
      <div
        className={className ?? 'w-full'}
        style={{
          height: '80vh',
          minHeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1a1a1a',
          color: '#fff'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '16px' }}>⏳</div>
          <div style={{ fontSize: '16px' }}>Loading editor...</div>
          {appId && (
            <div style={{ fontSize: '12px', marginTop: '8px', opacity: 0.7 }}>
              App ID: {appId}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={className ?? 'w-full'}
        style={{
          height: '80vh',
          minHeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1a1a1a',
          color: '#ff4444'
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: '500px', padding: '20px' }}>
          <div style={{ fontSize: '24px', marginBottom: '16px' }}>❌</div>
          <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
            Error Loading Editor
          </div>
          <div style={{ fontSize: '14px', opacity: 0.8 }}>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          .gjs-block .gjs-block-media {
            min-width: 50px;
            min-height: 50px;
          }

          .gjs-block .gjs-block-media svg {
            width: 50px !important;
            height: 50px !important;
          }

          ${readonly ? `
            .gjs-blocks-cs .gjs-block {
              pointer-events: none !important;
              opacity: 0.6;
            }

            .gjs-layers .gjs-layer {
              pointer-events: none !important;
            }

            .gjs-sm-sectors .gjs-sm-sector {
              pointer-events: none !important;
            }

            .gjs-editor {
              position: relative;
            }

            .gjs-editor::after {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: rgba(0, 0, 0, 0.02);
              pointer-events: none;
              z-index: 1;
            }
          ` : ''}
        `}
      </style>
      <div
        className={`relative ${className ?? 'w-full'}`}
        style={{ height: '80vh', minHeight: 600 }}
      >
        <GjsEditor
          grapesjs={grapesjs}
          grapesjsCss="https://unpkg.com/grapesjs/dist/css/grapes.min.css"
          options={{
            height: '100%',
            storageManager: { type: 'none' },
            plugins: [presetWebpage],
            pluginsOpts: {
              'grapesjs-preset-webpage': {}
            },
            ...(readonly && {
              // Readonly mode settings
            })
          }}
          style={{ height: '100%' }}
          onEditor={handleEditor}
        />

        {readonly && (
          <div className="absolute top-2 left-2 z-50 pointer-events-none">
            <div className="bg-gray-800 bg-opacity-90 text-white px-3 py-2 rounded-lg shadow-lg">
              <div className="flex items-center space-x-2">
                <span className="text-lg">🔒</span>
                <div>
                  <div className="text-sm font-medium">Read-only mode</div>
                  <div className="text-xs opacity-90">Editing disabled</div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
};