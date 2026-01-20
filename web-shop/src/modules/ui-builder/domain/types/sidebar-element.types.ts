export interface SidebarElement {
  id: string;
  name: string;
  type?: string;
  label?: string;
  colors?: Record<string, string>;
  children?: SidebarElement[];
}

export interface SelectedElement {
  id: string;
  path?: string[];
  colors?: Record<string, string>;
  gap?: string;
  padding?: string;
  width?: string;
  maxHeight?: string;
  type?: string;
  borderRadius?: string;
  label?: string;
  textAlign?: string;
  flexDirection?: string;
  icon?: string;
  area?: 'sidebar' | 'rightSidebar';
  backgroundOpacity?: string;
  pageSlug?: string;
}

