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
  path: string[];
  colors?: Record<string, string>;
}


