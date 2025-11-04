/**
 * Component node structure used in page sections
 */
export interface ComponentNode {
  id: string;
  type: string;
  props?: Record<string, unknown>;
  styles?: Record<string, unknown>;
  children?: ComponentNode[];
}

/**
 * Layout configuration for a page section
 * Defines how components are arranged within the section using CSS Grid
 */
export interface SectionLayout {
  /** Grid template: predefined layouts or custom */
  grid: '1-column' | '2-column' | '3-column' | '4-column' | 'custom';
  
  /** Gap between grid items (e.g., "1rem", "20px") */
  gap?: string;
  
  /** Alignment of items within the grid */
  align?: 'start' | 'center' | 'end';
  
  /** Custom CSS Grid template for advanced layouts (e.g., "1fr 2fr 1fr") */
  customGrid?: string;
}

/**
 * A section within a page (Header, Content, or Footer)
 * Contains multiple components arranged according to the layout configuration
 */
export interface PageSection {
  /** Unique identifier for the section */
  id: string;
  
  /** Type of section determining its semantic meaning */
  type: 'header' | 'content' | 'footer';
  
  /** Layout configuration for component arrangement */
  layout: SectionLayout;
  
  /** Optional styles applied to the section container */
  styles?: Record<string, unknown>;
  
  /** Components within this section */
  components: ComponentNode[];
}

