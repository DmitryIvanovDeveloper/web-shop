export interface GrapeJsAppConfig {
  pages: GrapeJsPage[];
  assets: GrapeJsAsset[];
  styles: GrapeJsStyle[];
  symbols: GrapeJsSymbol[];
  dataSources: GrapeJsDataSource[];
}

export interface GrapeJsPage {
  id: string;
  type: 'main' | 'secondary';
  frames: GrapeJsFrame[];
}

export interface GrapeJsFrame {
  id: string;
  component: any; // HTML структура компонента из GrapeJS
}

export interface GrapeJsAsset {
  id: string;
  type: 'image' | 'video' | 'document';
  src: string;
  name: string;
  width?: number;
  height?: number;
  size?: number;
}

export interface GrapeJsStyle {
  style: Record<string, string | number>;
  selectors: string[];
  selectorsAdd: string;
  mediaText?: string;
  state?: string;
}

export interface GrapeJsSymbol {
  id: string;
  name: string;
  component: any; // Переиспользуемый компонент
  category?: string;
}

export interface GrapeJsDataSource {
  id: string;
  type: 'api' | 'static';
  url?: string;
  data?: any;
  headers?: Record<string, string>;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
}