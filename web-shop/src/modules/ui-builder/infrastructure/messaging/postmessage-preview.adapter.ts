import { injectable } from 'inversify';
import type { PreviewCommunicationPort } from '../../application/ports/preview-communication.port';
import { env } from '../../../../env';

@injectable()
export class PostMessagePreviewAdapter implements PreviewCommunicationPort {
  private _iframeEl: HTMLIFrameElement | null = null;
  private _readyCallbacks: (() => void)[] = [];
  private _elementSelectedHandler: ((event: MessageEvent) => void) | null = null;
  private _isIframeReady: boolean = false;
  private _pendingMessages: Array<{ type: string; payload: any }> = [];

  private get _targetOrigin(): string {
    // Use configured client URL; fall back to '*' to avoid TS undefined and prevent crashes in dev
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
    // Reset ready flag only when iframe ref actually changes
    if (hasChanged) {
      this._isIframeReady = false;
    }
  }

  public sendThemeUpdate(colors: Record<string, string>): void {
    if (!this._iframeEl?.contentWindow) {
      console.warn('[PostMessagePreviewAdapter] iframe not ready, cannot send theme update');
      return;
    }

    this._iframeEl.contentWindow.postMessage(
      {
        type: 'THEME_UPDATE',
        colors,
      },
      this._targetOrigin
    );
  }

  public sendSidebarUpdate(payload: { elementId: string; colors: Record<string, string> }): void {
    if (!this._iframeEl?.contentWindow) {
      console.warn('[PostMessagePreviewAdapter] iframe not ready, cannot send sidebar update');
      return;
    }

    console.log('[PostMessagePreviewAdapter] Sending sidebar update:', payload);

    this._iframeEl.contentWindow.postMessage(
      {
        type: 'SIDEBAR_UPDATE',
        elementId: payload.elementId,
        colors: payload.colors,
      },
      this._targetOrigin
    );
  }

  public sendAuthUpdate(payload: {
    loginButton?: {
      text?: string;
      icon?: string;
      styles?: Record<string, string>;
    };
    popup?: {
      userIdPlaceholder?: string;
      enterUserId?: string;
      visible?: boolean;
    };
  }): void {
    if (!this._iframeEl?.contentWindow) {
      console.warn('[PostMessagePreviewAdapter] iframe not ready, cannot send auth update');
      return;
    }

    this._iframeEl.contentWindow.postMessage(
      {
        type: 'AUTH_UPDATE',
        payload,
      },
      this._targetOrigin
    );
  }

  public onElementSelected(callback: (elementId: string) => void): void {
    // Remove old handler if exists
    if (this._elementSelectedHandler) {
      window.removeEventListener('message', this._elementSelectedHandler);
    }

    // Create new handler
    this._elementSelectedHandler = (event: MessageEvent) => {
      console.log('[PostMessagePreviewAdapter] Received message:', {
        type: event.data.type,
        origin: event.origin,
        targetOrigin: this._targetOrigin
      });
      
      // Allow localhost in development, or specific origin in production
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
    
    // Send all pending messages
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
    // Don't clear callbacks to allow re-sending updates on iframe reload
  }

  public sendSidebarStructure(layout: unknown): void {
    if (!this._iframeEl?.contentWindow) {
      console.warn('[PostMessagePreviewAdapter] iframe not ready, cannot send structure update');
      return;
    }

    this._iframeEl.contentWindow.postMessage(
      {
        type: 'STRUCTURE_UPDATE',
        layout,
      },
      this._targetOrigin
    );
  }

  public sendConfig(config: Record<string, unknown>): void {
    const message = {
      type: 'CONFIG_UPDATE',
      payload: { config },
    };

    if (!this._iframeEl?.contentWindow || !this._isIframeReady) {
      console.warn('[PostMessagePreviewAdapter] iframe not ready, queueing config update');
      this._pendingMessages.push({ type: 'CONFIG_UPDATE', payload: message });
      return;
    }

    console.log('[PostMessagePreviewAdapter] Sending config update');
    this._iframeEl.contentWindow.postMessage(message, this._targetOrigin);
  }
}





