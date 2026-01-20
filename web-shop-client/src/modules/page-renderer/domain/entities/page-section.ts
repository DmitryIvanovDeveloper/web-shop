import { ComponentNode } from '../../../app-layout/domain/value-objects/component-node.value-object';


export interface SectionLayout {
  grid: '1-column' | '2-column' | '3-column' | '4-column' | 'custom';
  gap?: string;
  align?: 'start' | 'center' | 'end';
  customGrid?: string;
}


export interface PageSection {
  id: string;
  type: 'header' | 'content' | 'footer';
  layout: SectionLayout;
  styles?: Record<string, unknown>;
  components: ComponentNode[];
}
