
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
      const isLocalhost = event.origin.startsWith('http://localhost');
      const isAllowedOrigin = this._targetOrigin === '*' || event.origin === this._targetOrigin;

      if (!isAllowedOrigin && !isLocalhost) {
        return;
      }

      if (event.data.type === 'ELEMENT_SELECTED') {
        callback(event.data.elementId);
      }

      if (event.data.type === 'PREVIEW_READY') {
        this.notifyPreviewReady();
      }
    };
    window.addEventListener('message', this._elementSelectedHandler);
  }

  public onPreviewReady(callback: () => void): void {
    this._readyCallbacks.push(callback);
  }

  public notifyPreviewReady(): void {
    this._isIframeReady = true;

    if (this._pendingMessages.length > 0) {
      this._pendingMessages.forEach(msg => {
        if (this._iframeEl?.contentWindow) {
          this._iframeEl.contentWindow.postMessage(msg.payload, this._targetOrigin);
        }
      });
      this._pendingMessages = [];
    }

    this._readyCallbacks.forEach(cb => cb());
  }

  public sendConfig(config: Record<string, unknown>, selectedElementId?: string | null): void {
    const message = {
      type: 'CONFIG_UPDATE',
      payload: {
        config,
        selectedElementId: selectedElementId ?? null,
      },
    };

    if (!this._iframeEl?.contentWindow || !this._isIframeReady) {
      this._pendingMessages.push({ payload: message });
      return;
    }

    this._iframeEl.contentWindow.postMessage(message, this._targetOrigin);
  }

  public showAuthPopup(visible: boolean): void {
    const message = {
      type: 'SHOW_AUTH_POPUP',
      payload: { visible },
    };

    if (!this._iframeEl?.contentWindow || !this._isIframeReady) {
      this._pendingMessages.push({ payload: message });
      return;
    }

    this._iframeEl.contentWindow.postMessage(message, this._targetOrigin);
  }

  public selectElement(elementId: string | null): void {
    const message = {
      type: 'SELECT_ELEMENT',
      payload: { elementId },
    };

    if (!this._iframeEl?.contentWindow || !this._isIframeReady) {
      this._pendingMessages.push({ payload: message });
      return;
    }
    this._iframeEl.contentWindow.postMessage(message, this._targetOrigin);
  }
}
