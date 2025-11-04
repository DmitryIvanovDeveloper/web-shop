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

  return (
    <section
      className={`page-section page-section-${section.type}`}
      style={sectionStyle}
    >
      {section.components.map(component => (
        <DynamicRenderer
          key={component.id}
          node={component}
          theme={theme}
        />
      ))}
    </section>
  );
}

