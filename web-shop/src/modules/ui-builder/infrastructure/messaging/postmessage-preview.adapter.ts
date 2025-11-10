import { injectable } from 'inversify';
import type { PreviewCommunicationPort } from '../../application/ports/preview-communication.port';
import { env } from '../../../../env';

@injectable()
export class PostMessagePreviewAdapter implements PreviewCommunicationPort {
  private _iframeEl: HTMLIFrameElement | null = null;
  private _readyCallbacks: (() => void)[] = [];
  private _elementSelectedHandler: ((event: MessageEvent) => void) | null = null;
  private _isIframeReady = false;
  private _pendingMessages: Array<{ payload: any }> = [];

  private get _targetOrigin(): string {
    return env.NEXT_PUBLIC_CLIENT_URL || '*';
  }

  public setIframeRef(ref: HTMLIFrameElement | null): void {
    const hasChanged = this._iframeEl !== ref;
    console.log('[PostMessagePreviewAdapter] setIframeRef called', {
      hasRef: !!ref,
      wasReady: this._isIframeReady,
      hasChanged
    });
    this._iframeEl = ref;
    if (hasChanged) {
      this._isIframeReady = false;
    }
  }

  public onElementSelected(callback: (elementId: string) => void): void {
    if (this._elementSelectedHandler) {
      window.removeEventListener('message', this._elementSelectedHandler);
    }

    this._elementSelectedHandler = (event: MessageEvent) => {
      console.log('[PostMessagePreviewAdapter] Received message:', {
        type: event.data.type,
        origin: event.origin,
        targetOrigin: this._targetOrigin
      });

      const isLocalhost = event.origin.startsWith('http://localhost:');
      const isAllowedOrigin = this._targetOrigin === '*' || event.origin === this._targetOrigin;

      if (!isAllowedOrigin && !isLocalhost) {
        console.warn('[PostMessagePreviewAdapter] Message from untrusted origin:', event.origin);
        return;
      }

      if (event.data.type === 'ELEMENT_SELECTED') {
        console.log('[PostMessagePreviewAdapter] Element selected:', event.data.elementId);
        callback(event.data.elementId);
      }

      if (event.data.type === 'PREVIEW_READY') {
        console.log('[PostMessagePreviewAdapter] Preview ready, notifying callbacks');
        this.notifyPreviewReady();
      }
    };

    console.log('[PostMessagePreviewAdapter] Listening for element selection and preview ready messages');
    window.addEventListener('message', this._elementSelectedHandler);
  }

  public onPreviewReady(callback: () => void): void {
    console.log('[PostMessagePreviewAdapter] Registering onPreviewReady callback');
    this._readyCallbacks.push(callback);
  }

  public notifyPreviewReady(): void {
    console.log('[PostMessagePreviewAdapter] notifying callbacks', { count: this._readyCallbacks.length });
    this._isIframeReady = true;

    if (this._pendingMessages.length > 0) {
      console.log('[PostMessagePreviewAdapter] Sending pending messages', { count: this._pendingMessages.length });
      this._pendingMessages.forEach(msg => {
        if (this._iframeEl?.contentWindow) {
          this._iframeEl.contentWindow.postMessage(msg.payload, this._targetOrigin);
        }
      });
      this._pendingMessages = [];
    }

    this._readyCallbacks.forEach(cb => cb());
  }

  public sendConfig(config: Record<string, unknown>): void {
    const message = {
      type: 'CONFIG_UPDATE',
      payload: { config },
    };

    if (!this._iframeEl?.contentWindow || !this._isIframeReady) {
      console.warn('[PostMessagePreviewAdapter] iframe not ready, queueing config update');
      this._pendingMessages.push({ payload: message });
      return;
    }

    console.log('[PostMessagePreviewAdapter] Sending config update');
    this._iframeEl.contentWindow.postMessage(message, this._targetOrigin);
  }
}
