/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React from 'react';

// Импортируем CSS GrapesJS
import 'grapesjs/dist/css/grapes.min.css';

// Используем официальный React wrapper + стандартный пресет
import GjsEditor from '@grapesjs/react';
import grapesjs from 'grapesjs';
import presetWebpage from 'grapesjs-preset-webpage';

export interface GrapesJsEditorProps {
  value?: any | null;
  onChange?: (projectJson: any) => void;
  onReady?: (editor: any) => void;
  className?: string;
}

// Простая утилита для дебаунса, чтобы не спамить onChange
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

export const GrapesJsEditor: React.FC<GrapesJsEditorProps> = ({
  value,
  onChange,
  onReady,
  className,
}) => {
  const handleEditor = (editor: any) => {
    console.log('GrapesJsEditor: Editor loaded', editor);

    // Делаем редактор доступным глобально (для отладки / автосборки карточек)
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).gjsEditor = editor;
    }

    // ============================
    // Настройка редактора
    // ============================

    // 1) Максимально богатый StyleManager (чтобы можно было собрать сложные карточки)
    const sm = editor.StyleManager;
    sm.getSectors().reset([
      {
        id: 'general',
        name: 'General',
        properties: ['display', 'opacity', 'cursor'],
      },
      {
        id: 'dimension',
        name: 'Dimension',
        properties: [
          'width',
          'height',
          'min-width',
          'min-height',
          'max-width',
          'max-height',
          'padding',
          'margin',
          'box-sizing',
          'gap',
          'aspect-ratio',
        ],
      },
      {
        id: 'position',
        name: 'Position',
        properties: [
          'position',
          'top',
          'right',
          'bottom',
          'left',
          'z-index',
          'float',
          'clear',
        ],
      },
      {
        id: 'flex',
        name: 'Flex',
        properties: [
          'flex-direction',
          'flex-wrap',
          'justify-content',
          'align-items',
          'align-content',
          'order',
          'flex-grow',
          'flex-shrink',
          'flex-basis',
        ],
      },
      {
        id: 'typography',
        name: 'Typography',
        properties: [
          'font-family',
          'font-size',
          'font-weight',
          'letter-spacing',
          'line-height',
          'text-align',
          'text-decoration',
          'text-transform',
          'color',
        ],
      },
      {
        id: 'background',
        name: 'Background',
        properties: [
          'background-color',
          'background-image',
          'background-repeat',
          'background-position',
          'background-size',
          'background-attachment',
        ],
      },
      {
        id: 'border',
        name: 'Border & Radius',
        properties: [
          'border-width',
          'border-style',
          'border-color',
          'border-radius',
        ],
      },
      {
        id: 'effects',
        name: 'Effects',
        properties: ['box-shadow', 'filter', 'overflow'],
      },
    ]);

    // 5) Добавляем несколько дополнительных базовых блоков с иконками
    const bm = editor.BlockManager;
    
    // Стандартизируем размеры блоков из пресета (Basic секция)
    const standardizeBlockMedia = (blockId: string) => {
      const block = bm.get(blockId);
      if (block) {
        const media = block.get('media');
        if (media) {
          // Обновляем attributes для единообразного размера
          block.set('attributes', { 
            ...block.get('attributes'),
            style: 'width:70px;height:70px' 
          });
        }
      }
    };
    
    // Применяем стандартные размеры к блокам из пресета
    ['link-block', 'quote', 'text-basic', 'text', 'link', 'image', 'video', 'map'].forEach(standardizeBlockMedia);
    
    // Простой контейнер, который можно использовать как корневую карточку
    bm.add('container', {
      label: 'Container',
      category: 'Layout',
      media: `<svg viewBox="0 0 24 24" style="width:100%;height:100%">
        <rect x="2" y="2" width="20" height="20" rx="2" fill="none" stroke="currentColor" stroke-width="2"/>
        <line x1="2" y1="8" x2="22" y2="8" stroke="currentColor" stroke-width="2"/>
        <line x1="2" y1="14" x2="22" y2="14" stroke="currentColor" stroke-width="2"/>
      </svg>`,
      attributes: { style: 'width:70px;height:70px' },
      content: {
        tagName: 'div',
        style: {
          display: 'flex',
          'flex-direction': 'column',
          gap: '8px',
          padding: '16px',
          'border-radius': '12px',
          background: '#1f2937',
          'min-height': '100px',
        },
      },
    });
    
    // 2 колонки
    bm.add('section-2col', {
      label: '2 Columns',
      category: 'Layout',
      media: `<svg viewBox="0 0 24 24" style="width:100%;height:100%">
        <rect x="2" y="2" width="9" height="20" rx="1" fill="none" stroke="currentColor" stroke-width="2"/>
        <rect x="13" y="2" width="9" height="20" rx="1" fill="none" stroke="currentColor" stroke-width="2"/>
      </svg>`,
      attributes: { style: 'width:70px;height:70px' },
      content:
        '<section class="gjs-section"><div class="gjs-container"><div class="gjs-row"><div class="gjs-cell"></div><div class="gjs-cell"></div></div></div></section>',
    });
    
    // Hero секция
    bm.add('hero', {
      label: 'Hero',
      category: 'Sections',
      media: `<svg viewBox="0 0 24 24" style="width:100%;height:100%">
        <rect x="2" y="4" width="20" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="2"/>
        <circle cx="12" cy="10" r="3" fill="currentColor"/>
        <rect x="5" y="15" width="14" height="2" rx="1" fill="currentColor"/>
      </svg>`,
      attributes: { style: 'width:70px;height:70px' },
      content:
        '<section class="hero-section"><h1>Hero Title</h1><p>Hero subtitle</p><button class="btn">Call to action</button></section>',
    });
    
    // Card компонент
    bm.add('card', {
      label: 'Card',
      category: 'UI',
      media: `<svg viewBox="0 0 24 24" style="width:100%;height:100%">
        <rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="currentColor" stroke-width="2"/>
        <rect x="5" y="5" width="14" height="6" rx="1" fill="currentColor" opacity="0.3"/>
        <line x1="5" y1="14" x2="13" y2="14" stroke="currentColor" stroke-width="2"/>
        <line x1="5" y1="17" x2="10" y2="17" stroke="currentColor" stroke-width="2"/>
      </svg>`,
      attributes: { style: 'width:70px;height:70px' },
      content:
        '<div class="card"><h3>Card title</h3><p>Card content</p><button>Button</button></div>',
    });
    
    // Daily Reward Card - специализированный блок
    bm.add('daily-reward-card', {
      label: 'Daily Reward',
      category: 'UI',
      media: `<svg viewBox="0 0 24 24" style="width:100%;height:100%">
        <rect x="4" y="4" width="16" height="18" rx="2" fill="none" stroke="currentColor" stroke-width="2"/>
        <path d="M12 2 L14 4 L10 4 Z" fill="currentColor"/>
        <circle cx="12" cy="10" r="3" fill="none" stroke="currentColor" stroke-width="2"/>
        <text x="12" y="11" text-anchor="middle" font-size="4" fill="currentColor">%</text>
        <rect x="6" y="16" width="12" height="3" rx="1" fill="currentColor" opacity="0.7"/>
      </svg>`,
      attributes: { style: 'width:70px;height:70px' },
      content: {
        tagName: 'div',
        attributes: { class: 'daily-reward-card' },
        style: {
          width: '200px',
          background: '#1f2937',
          'border-radius': '12px',
          padding: '16px',
          'box-shadow': '0 4px 6px rgba(0,0,0,0.3)',
          display: 'flex',
          'flex-direction': 'column',
          gap: '12px',
          position: 'relative',
        },
        components: [
          {
            tagName: 'div',
            attributes: { class: 'day-badge' },
            style: {
              position: 'absolute',
              top: '0',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#3b82f6',
              color: '#ffffff',
              padding: '4px 16px',
              'font-size': '12px',
              'font-weight': '600',
              'text-transform': 'uppercase',
              'border-radius': '0 0 4px 4px',
              'z-index': '10',
            },
            components: 'День 1',
          },
          {
            tagName: 'div',
            attributes: { class: 'image-container' },
            style: {
              position: 'relative',
              width: '100%',
              'aspect-ratio': '1',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              'border-radius': '8px',
              overflow: 'hidden',
              'margin-top': '20px',
              display: 'flex',
              'align-items': 'center',
              'justify-content': 'center',
              'font-size': '48px',
            },
            components: [
              {
                tagName: 'div',
                attributes: { class: 'quantity-badge' },
                style: {
                  position: 'absolute',
                  bottom: '0',
                  right: '0',
                  background: 'rgba(0,0,0,0.7)',
                  color: '#ffffff',
                  padding: '4px 8px',
                  'font-size': '14px',
                  'font-weight': '600',
                  'border-radius': '4px 0 0 0',
                },
                components: 'x1',
              },
              '🎁',
            ],
          },
          {
            tagName: 'p',
            attributes: { class: 'card-title' },
            style: {
              color: '#ffffff',
              'font-size': '14px',
              'font-weight': '600',
              'text-align': 'center',
              margin: '0',
              'line-height': '1.4',
            },
            components: 'Награда',
          },
          {
            tagName: 'button',
            attributes: { class: 'claim-button' },
            style: {
              background: 'linear-gradient(180deg, #fbbf24 0%, #f59e0b 100%)',
              color: '#000000',
              border: 'none',
              padding: '12px',
              'border-radius': '8px',
              'font-weight': '600',
              'font-size': '14px',
              cursor: 'pointer',
              'text-transform': 'none',
            },
            components: 'Получить',
          },
        ],
      },
    });

    // Настраиваем обработчики изменений
    const debouncedNotifyChange = onChange ? debounce(() => {
      try {
        const data = editor.getProjectData?.();
        if (data) {
          onChange(data);
        }
      } catch (error) {
        console.error('Error getting project data:', error);
      }
    }, 500) : null;

    if (debouncedNotifyChange) {
      editor.on('update', debouncedNotifyChange);
      editor.on('component:add', debouncedNotifyChange);
      editor.on('component:update', debouncedNotifyChange);
      editor.on('component:remove', debouncedNotifyChange);
      editor.on('style:change', debouncedNotifyChange);
    }

    if (onReady) {
      onReady(editor);
    }
  };

  return (
    <>
      <style>
        {`
          /* Минимальная нормализация размеров блоков */
          .gjs-block .gjs-block-media {
            min-width: 50px;
            min-height: 50px;
          }
          
          .gjs-block .gjs-block-media svg {
            width: 50px !important;
            height: 50px !important;
          }
        `}
      </style>
      <div
        className={className ?? 'w-full'}
        style={{ height: '80vh', minHeight: 600 }}
      >
        <GjsEditor
          grapesjs={grapesjs}
          grapesjsCss="https://unpkg.com/grapesjs/dist/css/grapes.min.css"
          options={{
            // Фикс: задаём явную высоту, чтобы canvas был виден
            height: '100%',
            storageManager: { type: 'none' },
            // Подключаем стандартный пресет, как в демо
            plugins: [presetWebpage],
            pluginsOpts: {
              'grapesjs-preset-webpage': {},
            },
          }}
          style={{ height: '100%' }}
          onEditor={handleEditor}
        />
      </div>
    </>
  );
};
