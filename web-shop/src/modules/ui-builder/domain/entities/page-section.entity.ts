
export interface ComponentNode {
  id: string;
  type: string;
  props?: Record<string, unknown>;
  styles?: Record<string, unknown>;
  children?: ComponentNode[];
}

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

