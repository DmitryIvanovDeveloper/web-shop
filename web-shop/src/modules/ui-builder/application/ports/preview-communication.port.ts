export interface PreviewCommunicationPort {
  setIframeRef(ref: HTMLIFrameElement | null): void;
  onPreviewReady(handler: () => void): void;
  onElementSelected(handler: (elementId: string) => void): void;
  sendConfig(config: Record<string, unknown>, selectedElementId?: string | null): void;
  showAuthPopup(visible: boolean): void;
  selectElement(elementId: string | null): void;
}
