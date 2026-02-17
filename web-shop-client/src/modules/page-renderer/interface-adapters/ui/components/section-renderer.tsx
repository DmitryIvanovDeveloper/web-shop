'use client';

import React, { useState, useEffect } from 'react';
import type { PageSection } from '../../../domain/entities/page-section';
import { DynamicRenderer } from '../../../../app-layout/interface-adapters/ui/components/dynamic-renderer';

interface SectionRendererProps {
  section: PageSection;
  theme: any;
}

function getGridTemplate(grid: string): string {
  const map: Record<string, string> = {
    '1-column': '1fr',
    '2-column': '1fr 1fr',
    '3-column': '1fr 1fr 1fr',
    '4-column': '1fr 1fr 1fr 1fr',
  };
  return map[grid] || '1fr';
}

const isPreviewMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get('previewMode') === 'true' || params.get('uibuilder') === 'true';
};

const readSelectionModeFlag = (): boolean => {
  if (typeof document !== 'undefined' && document.body) {
    return document.body.getAttribute('data-selection-mode') === 'true';
  }
  if (typeof window !== 'undefined') {
    return (window as any).__elementSelectionMode === true;
  }
  return false;
};

export function SectionRenderer({ section, theme }: SectionRendererProps): JSX.Element {
  const [isHovered, setIsHovered] = useState(false);
  const [elementSelectionMode, setElementSelectionMode] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleModeChange = (event: CustomEvent) => {
      const enabled = event.detail?.enabled ?? false;
      setElementSelectionMode(enabled);
    };

    const initialMode = readSelectionModeFlag();
    setElementSelectionMode(initialMode);

    window.addEventListener('elementSelectionModeChanged', handleModeChange as EventListener);

    return () => {
      window.removeEventListener('elementSelectionModeChanged', handleModeChange as EventListener);
    };
  }, [section.id]);

  const isEmpty = !section.components || section.components.length === 0;
  const hasMinHeight = section.styles && 'minHeight' in section.styles;
  const defaultStylesForEmpty: React.CSSProperties = isEmpty && !hasMinHeight ? {
    minHeight: '150px',
    border: '2px dashed #d1d5db',
  } : {};

  const sectionStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: section.layout.customGrid || getGridTemplate(section.layout.grid),
    gap: section.layout.gap || '1rem',
    alignItems: section.layout.align || 'start',
    ...defaultStylesForEmpty,
    ...(section.styles as React.CSSProperties),
  };

  const isSelectionModeActive = isPreviewMode() && elementSelectionMode && section.id;
  if (isSelectionModeActive && isHovered) {
    sectionStyle.outline = '2px solid #3b82f6';
    sectionStyle.outlineOffset = '2px';
    sectionStyle.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.3)';
    sectionStyle.position = sectionStyle.position || 'relative';
  }

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    const previewMode = isPreviewMode();
    const selectionMode = elementSelectionMode;
    
    if (previewMode && selectionMode && section.id) {
      const target = e.target as HTMLElement;
      const currentTarget = e.currentTarget as HTMLElement;
      
      if (target !== currentTarget && target.closest('[data-element-id]') !== currentTarget) {
        return;
      }
      
      e.preventDefault();
      e.stopPropagation();
      
      if (window.parent && window.parent !== window) {
        const builderOrigin = process.env['NEXT_PUBLIC_BUILDER_URL'] || '*';
        
        if (window.parent && typeof window.parent.postMessage === 'function') {
          try {
            window.parent.postMessage(
              { type: 'ELEMENT_SELECTED', elementId: section.id },
              builderOrigin
            );
          } catch (error) {
          }
        }
      }
    }
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    const previewMode = isPreviewMode();
    const selectionMode = elementSelectionMode;
    
    if (previewMode && selectionMode && section.id) {
      const target = e.currentTarget as HTMLElement;
      const eventTarget = e.target as HTMLElement;
      
      if (eventTarget !== target) {
        const childWithId = eventTarget.closest('[data-element-id]') as HTMLElement;
        if (childWithId && childWithId !== target && childWithId.hasAttribute('data-element-id')) {
          return;
        }
      }
      
      setIsHovered(true);
      
      if (!target.classList.contains('preview-hover')) {
        target.classList.add('preview-hover');
      }
      target.style.setProperty('cursor', 'pointer', 'important');
      target.style.setProperty('outline', '2px solid #3b82f6', 'important');
      target.style.setProperty('outline-offset', '2px', 'important');
      target.style.setProperty('box-shadow', '0 0 0 2px rgba(59, 130, 246, 0.3)', 'important');
      target.style.setProperty('position', 'relative', 'important');
      target.style.setProperty('overflow', 'visible', 'important');
      target.style.setProperty('border', '2px solid #3b82f6', 'important');
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    const previewMode = isPreviewMode();
    const selectionMode = elementSelectionMode;
    
    if (previewMode && selectionMode && section.id) {
      setIsHovered(false);
      
      const target = e.currentTarget as HTMLElement;
      target.classList.remove('preview-hover');
      target.style.removeProperty('cursor');
      target.style.removeProperty('outline');
      target.style.removeProperty('outline-offset');
      target.style.removeProperty('box-shadow');
      target.style.removeProperty('border');
      target.style.removeProperty('overflow');
    }
  };

  return (
    <section
      className={`page-section page-section-${section.type}`}
      style={sectionStyle}
      data-element-id={section.id}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {section.components.map(component => {
        return (
          <DynamicRenderer
            key={component.id}
            node={component}
            theme={theme}
          />
        );
      })}
    </section>
  );
}

