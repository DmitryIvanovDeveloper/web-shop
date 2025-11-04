'use client';

import React from 'react';
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

export function SectionRenderer({ section, theme }: SectionRendererProps): JSX.Element {
  const sectionStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: section.layout.customGrid || getGridTemplate(section.layout.grid),
    gap: section.layout.gap || '1rem',
    alignItems: section.layout.align || 'start',
    ...(section.styles as React.CSSProperties),
  };

  console.log(`[SectionRenderer] Rendering section ${section.type}`, {
    sectionId: section.id,
    componentsCount: section.components.length,
    components: section.components.map(c => ({ id: c.id, type: c.type, props: c.props }))
  });

  return (
    <section
      className={`page-section page-section-${section.type}`}
      style={sectionStyle}
    >
      {section.components.map(component => {
        console.log(`[SectionRenderer] Rendering component`, {
          sectionType: section.type,
          componentId: component.id,
          componentType: component.type,
          componentProps: component.props,
          componentStyles: component.styles
        });
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

