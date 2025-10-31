export interface PreviewCommunicationPort {
  setIframeRef(ref: HTMLIFrameElement | null): void;
  onPreviewReady(handler: () => void): void;
  onElementSelected(handler: (elementId: string) => void): void;
  sendThemeUpdate(theme: Record<string, string>): void;
  sendSidebarUpdate(payload: { elementId: string; colors: Record<string, string> }): void;
  sendAuthUpdate?(payload: unknown): void;
  sendSidebarStructure?(layout: unknown): void;
  sendConfig(config: Record<string, unknown>): void;
}





