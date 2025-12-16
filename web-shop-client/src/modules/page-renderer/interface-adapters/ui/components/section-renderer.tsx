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

// Check if in preview mode
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
  // State for hover effect in element selection mode
  const [isHovered, setIsHovered] = useState(false);
  const [elementSelectionMode, setElementSelectionMode] = useState(false);

  // Listen for element selection mode changes
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleModeChange = (event: CustomEvent) => {
      const enabled = event.detail?.enabled ?? false;
      console.log('[SectionRenderer] Received elementSelectionModeChanged event:', enabled, { sectionId: section.id });
      setElementSelectionMode(enabled);
    };

    const initialMode = readSelectionModeFlag();
    setElementSelectionMode(initialMode);

    window.addEventListener('elementSelectionModeChanged', handleModeChange as EventListener);

    return () => {
      window.removeEventListener('elementSelectionModeChanged', handleModeChange as EventListener);
    };
  }, [section.id]);

  // Default styles for empty sections to make them visible and selectable
  const isEmpty = !section.components || section.components.length === 0;
  const hasMinHeight = section.styles && 'minHeight' in section.styles;
  const defaultStylesForEmpty: React.CSSProperties = isEmpty && !hasMinHeight ? {
    minHeight: '150px',
    border: '2px dashed #d1d5db', // Gray dashed border
  } : {};

  const sectionStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: section.layout.customGrid || getGridTemplate(section.layout.grid),
    gap: section.layout.gap || '1rem',
    alignItems: section.layout.align || 'start',
    ...defaultStylesForEmpty,
    ...(section.styles as React.CSSProperties),
  };

  // Add outline styles for hover in selection mode
  const isSelectionModeActive = isPreviewMode() && elementSelectionMode && section.id;
  if (isSelectionModeActive && isHovered) {
    sectionStyle.outline = '2px solid #3b82f6';
    sectionStyle.outlineOffset = '2px';
    sectionStyle.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.3)';
    sectionStyle.position = sectionStyle.position || 'relative';
  }

  console.log(`[SectionRenderer] Rendering section ${section.type}`, {
    sectionId: section.id,
    componentsCount: section.components.length,
    components: section.components.map(c => ({ id: c.id, type: c.type, props: c.props }))
  });

  // Handle click for element selection mode
  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    const previewMode = isPreviewMode();
    const selectionMode = elementSelectionMode;
    console.log('[SectionRenderer] Click handler check:', { previewMode, selectionMode, sectionId: section.id });
    
    if (previewMode && selectionMode && section.id) {
      // Only handle click if the target is the section itself, not a child element
      const target = e.target as HTMLElement;
      const currentTarget = e.currentTarget as HTMLElement;
      
      // If clicking on a child element with data-element-id, let it handle the click
      if (target !== currentTarget && target.closest('[data-element-id]') !== currentTarget) {
        return;
      }
      
      e.preventDefault();
      e.stopPropagation();
      
      console.log('[SectionRenderer] Section clicked in selection mode:', section.id);
      
      if (window.parent && window.parent !== window) {
        const builderOrigin = process.env.NEXT_PUBLIC_BUILDER_URL || '*';
        console.log('[SectionRenderer] Sending ELEMENT_SELECTED to parent:', {
          elementId: section.id,
          origin: builderOrigin
        });
        
        window.parent.postMessage(
          { type: 'ELEMENT_SELECTED', elementId: section.id },
          builderOrigin
        );
      }
    }
  };

  // Handle mouse enter for hover effect in selection mode
  const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    const previewMode = isPreviewMode();
    const selectionMode = elementSelectionMode;
    
    if (previewMode && selectionMode && section.id) {
      const target = e.currentTarget as HTMLElement;
      const eventTarget = e.target as HTMLElement;
      
      // Check if the cursor is actually over this element, not a child element with data-element-id
      // If a child element with data-element-id is being hovered, don't highlight the parent
      if (eventTarget !== target) {
        // The cursor is over a child element, not this element
        // Check if the child has its own data-element-id
        const childWithId = eventTarget.closest('[data-element-id]') as HTMLElement;
        if (childWithId && childWithId !== target && childWithId.hasAttribute('data-element-id')) {
          // A child element with data-element-id is being hovered, don't highlight parent
          return;
        }
      }
      
      console.log('[SectionRenderer] Mouse enter on section:', section.id, { elementSelectionMode: selectionMode, previewMode, sectionType: section.type });
      setIsHovered(true);
      
      // Apply outline styles directly to DOM element for immediate feedback
      if (!target.classList.contains('preview-hover')) {
        target.classList.add('preview-hover');
      }
      target.style.setProperty('cursor', 'pointer', 'important');
      target.style.setProperty('outline', '2px solid #3b82f6', 'important');
      target.style.setProperty('outline-offset', '2px', 'important');
      target.style.setProperty('box-shadow', '0 0 0 2px rgba(59, 130, 246, 0.3)', 'important');
      target.style.setProperty('position', 'relative', 'important');
      
      // Ensure outline is not clipped
      target.style.setProperty('overflow', 'visible', 'important');
      
      // Also add border as fallback
      target.style.setProperty('border', '2px solid #3b82f6', 'important');
      
      console.log('[SectionRenderer] Applied outline styles to section:', section.id, {
        outline: target.style.outline,
        outlineOffset: target.style.outlineOffset,
        border: target.style.border,
        hasClass: target.classList.contains('preview-hover')
      });
    }
  };

  // Handle mouse leave for hover effect in selection mode
  const handleMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    const previewMode = isPreviewMode();
    const selectionMode = elementSelectionMode;
    
    if (previewMode && selectionMode && section.id) {
      console.log('[SectionRenderer] Mouse leave on section:', section.id);
      setIsHovered(false);
      
      // Remove outline styles from DOM element
      const target = e.currentTarget as HTMLElement;
      target.classList.remove('preview-hover');
      target.style.removeProperty('cursor');
      target.style.removeProperty('outline');
      target.style.removeProperty('outline-offset');
      target.style.removeProperty('box-shadow');
      target.style.removeProperty('border');
      target.style.removeProperty('overflow');
      
      console.log('[SectionRenderer] Removed outline styles from section:', section.id);
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
        // Log Text component styles in detail
        if (component.type === 'Text') {
          console.log(`[SectionRenderer] Rendering Text component with styles:`, {
            componentId: component.id,
            text: component.props?.text || '',
            textColor: component.styles?.textColor,
            fontSize: component.styles?.fontSize,
            fontWeight: component.styles?.fontWeight,
            textAlign: component.styles?.textAlign,
            textDecoration: component.styles?.textDecoration,
            allStyles: JSON.stringify(component.styles || {}),
            hasStyles: !!component.styles,
            stylesKeys: component.styles ? Object.keys(component.styles) : []
          });
        } else {
          console.log(`[SectionRenderer] Rendering component`, {
            sectionType: section.type,
            componentId: component.id,
            componentType: component.type,
            componentProps: component.props,
            componentStyles: component.styles
          });
        }
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

