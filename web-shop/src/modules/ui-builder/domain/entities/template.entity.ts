export interface TemplatePageSnapshot {
  pageSlug: string;
  
  pageConfig: unknown;
}

export interface TemplateMetadata {
  description?: string;
  category?: string;
  createdBy?: string;
  previewImageUrl?: string;
  tags?: string[];
  
  [key: string]: unknown;
}

export interface Template {
  id: string;
  name: string;

  appConfig: unknown;

  pages: TemplatePageSnapshot[];

  metadata?: TemplateMetadata;

  isActive: boolean;

  published?: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

