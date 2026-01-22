// GrapeJS Project Data structure
export interface GrapeJsProjectData {
  pages: Array<{
    frames: Array<{
      component: unknown;
    }>;
    type?: string;
    id?: string;
  }>;
  styles: Array<{
    selectors: string[];
    style: Record<string, string | number>;
  }>;
  assets?: unknown[];
}

// Full Template entity
export interface TemplateGrape {
  id: string;
  name: string;
  description?: string;
  templateData: GrapeJsProjectData; // JSON данные GrapeJS
  createdAt?: Date;
  updatedAt?: Date;
}

// Summary for list view
export interface TemplateGrapeSummary {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly updatedAt?: Date;
}
