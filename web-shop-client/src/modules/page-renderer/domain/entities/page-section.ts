import { ComponentNode } from '../../../app-layout/domain/value-objects/component-node.value-object';

/**
 * Section Layout configuration
 */
export interface SectionLayout {
  grid: '1-column' | '2-column' | '3-column' | '4-column' | 'custom';
  gap?: string;
  align?: 'start' | 'center' | 'end';
  customGrid?: string;
}

/**
 * Page Section entity
 * Использует ComponentNode из ui-renderer для единообразия
 */
export interface PageSection {
  id: string;
  type: 'header' | 'content' | 'footer';
  layout: SectionLayout;
  styles?: Record<string, unknown>;
  components: ComponentNode[];
}
