export interface SelectionRect {
  left: number;
  top: number;
  width: number;
  height: number;
  right?: number;
  bottom?: number;
  borderRadius?: number;
}


export class SelectionOverlay {
  private _overlay: HTMLDivElement | null = null;
  private _highlight: HTMLDivElement | null = null;
  private _currentHoveredElementId: string | null = null;
  private _currentSelectedElementId: string | null = null;
  private _selectedRect: SelectionRect | null = null;

  public show(rect: SelectionRect, elementId?: string | null, isSelected: boolean = false): void {
    if (typeof document === 'undefined') {
      console.warn('[SelectionOverlay] show() called but document is undefined');
      return;
    }

    console.log('[SelectionOverlay] show() called', {
      rect,
      hasDocument: !!document,
      hasBody: !!document.body,
      windowLocation: typeof window !== 'undefined' ? window.location.href : 'N/A'
    });

    this._ensureOverlay();

    if (!this._overlay || !this._highlight) {
      console.error('[SelectionOverlay] show() failed: overlay or highlight not created', {
        hasOverlay: !!this._overlay,
        hasHighlight: !!this._highlight
      });
      return;
    }

    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;

                const inset = 3;
    const insetWidth = Math.max(rect.width - inset * 2, 0);
    const insetHeight = Math.max(rect.height - inset * 2, 0);

            const rectRight = rect.right ?? (rect.left + rect.width);
    const rectBottom = rect.bottom ?? (rect.top + rect.height);
    const isOffscreen =
      rect.width <= 0 ||
      rect.height <= 0 ||
      rectRight < 0 ||
      rectBottom < 0 ||
      rect.left > window.innerWidth ||
      rect.top > window.innerHeight;

    if (isOffscreen) {
      this._overlay.style.display = 'none';
      this._currentHoveredElementId = null;
            return;
    }

                if (isSelected && elementId && elementId.startsWith('page-')) {
      const sidebarNodeList = document.querySelectorAll('[data-element-id*="sidebar"]') as NodeListOf<HTMLElement>;
      const hasVisibleSidebar = Array.from(sidebarNodeList).some((el) => {
        const sidebarRect = el.getBoundingClientRect();
        const visible =
          sidebarRect.width > 0 &&
          sidebarRect.height > 0 &&
          sidebarRect.bottom > 0 &&
          sidebarRect.right > 0 &&
          sidebarRect.left < window.innerWidth &&
          sidebarRect.top < window.innerHeight &&
          window.getComputedStyle(el).display !== 'none' &&
          window.getComputedStyle(el).visibility !== 'hidden';
        return visible;
      });

      if (hasVisibleSidebar) {
        this._overlay.style.display = 'none';
                        const pageElement = document.querySelector<HTMLElement>(`[data-element-id="${elementId}"]`);
        if (pageElement) {
          pageElement.classList.remove('preview-selected');
        }
                        return;
      }
    }

        if (isSelected) {
            this._currentSelectedElementId = elementId || null;
      this._selectedRect = rect;
      
            if (this._currentHoveredElementId) {
                return;
      }
    } else {
            this._currentHoveredElementId = elementId || null;
    }

    this._overlay.style.display = 'block';

    this._highlight.style.left = `${rect.left + scrollX + inset}px`;
    this._highlight.style.top = `${rect.top + scrollY + inset}px`;
    this._highlight.style.width = `${insetWidth}px`;
    this._highlight.style.height = `${insetHeight}px`;
    this._highlight.style.borderRadius =
      rect.borderRadius !== undefined ? `${Math.max(rect.borderRadius - inset, 0)}px` : '12px';

        if (isSelected) {
            this._highlight.style.boxShadow =
        '0 0 0 2px rgba(59,130,246,1)';
    } else {
            this._highlight.style.boxShadow =
        '0 0 0 2px rgba(59,130,246,0.5)';
    }

    console.log('[SelectionOverlay] show() applied', {
      rect,
      scrollX,
      scrollY,
      highlightStyle: {
        left: this._highlight.style.left,
        top: this._highlight.style.top,
        width: this._highlight.style.width,
        height: this._highlight.style.height,
        display: this._overlay.style.display,
        boxShadow: this._highlight.style.boxShadow
      },
      overlayInBody: document.body.contains(this._overlay)
    });
  }

  public hide(elementId?: string | null): void {
    if (!this._overlay) {
      return;
    }

        if (!elementId) {
      this._overlay.style.display = 'none';
      this._currentHoveredElementId = null;
      this._currentSelectedElementId = null;
      this._selectedRect = null;
      return;
    }

        if (this._currentHoveredElementId === elementId) {
      this._currentHoveredElementId = null;
      
            if (this._currentSelectedElementId && this._selectedRect) {
                this._showRect(this._selectedRect, true);
        return;
      }
      
            this._overlay.style.display = 'none';
      return;
    }

        if (this._currentSelectedElementId === elementId) {
      this._currentSelectedElementId = null;
      this._selectedRect = null;
      
            if (this._currentHoveredElementId) {
                return;
      }
      
            this._overlay.style.display = 'none';
      return;
    }

      }

  private _showRect(rect: SelectionRect, isSelected: boolean): void {
    if (!this._overlay || !this._highlight) {
      return;
    }

    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;

    const inset = 3;
    const insetWidth = Math.max(rect.width - inset * 2, 0);
    const insetHeight = Math.max(rect.height - inset * 2, 0);

    this._overlay.style.display = 'block';

    this._highlight.style.left = `${rect.left + scrollX + inset}px`;
    this._highlight.style.top = `${rect.top + scrollY + inset}px`;
    this._highlight.style.width = `${insetWidth}px`;
    this._highlight.style.height = `${insetHeight}px`;
    this._highlight.style.borderRadius =
      rect.borderRadius !== undefined ? `${Math.max(rect.borderRadius - inset, 0)}px` : '12px';

    if (isSelected) {
      this._highlight.style.boxShadow = '0 0 0 2px rgba(59,130,246,1)';
    } else {
      this._highlight.style.boxShadow = '0 0 0 2px rgba(59,130,246,0.5)';
    }
  }

  private _ensureOverlay(): void {
    if (this._overlay && this._highlight) {
      console.log('[SelectionOverlay] _ensureOverlay() - overlay already exists');
      return;
    }

    const existing = document.getElementById(
      'ui-selection-overlay'
    ) as HTMLDivElement | null;

    if (existing) {
      console.log('[SelectionOverlay] _ensureOverlay() - found existing overlay');
      this._overlay = existing;
      const existingHighlight = existing.querySelector(
        '.ui-selection-overlay-highlight'
      ) as HTMLDivElement | null;
      if (existingHighlight) {
        this._highlight = existingHighlight;
        return;
      }
    }

    console.log('[SelectionOverlay] _ensureOverlay() - creating new overlay', {
      hasDocument: !!document,
      hasBody: !!document.body,
      windowLocation: typeof window !== 'undefined' ? window.location.href : 'N/A'
    });

    const overlay = document.createElement('div');
    overlay.id = 'ui-selection-overlay';
    overlay.style.position = 'fixed';
    overlay.style.left = '0';
    overlay.style.top = '0';
    overlay.style.right = '0';
    overlay.style.bottom = '0';
    overlay.style.pointerEvents = 'none';
    overlay.style.zIndex = '9999';
    overlay.style.background =
      'radial-gradient(circle at center, rgba(0,0,0,0) 0, rgba(0,0,0,0) 40%, rgba(0,0,0,0.25) 100%)';
    overlay.style.display = 'none';

    const highlight = document.createElement('div');
    highlight.className = 'ui-selection-overlay-highlight';
    highlight.style.position = 'absolute';
    highlight.style.boxSizing = 'border-box';
    highlight.style.boxShadow =
      '0 0 0 2px rgba(59,130,246,0.7), 0 0 0 15px rgba(59,130,246,0.2)';     highlight.style.background = 'transparent';

    overlay.appendChild(highlight);
    document.body.appendChild(overlay);

    console.log('[SelectionOverlay] _ensureOverlay() - overlay created and appended to body', {
      overlayId: overlay.id,
      overlayInBody: document.body.contains(overlay),
      bodyChildrenCount: document.body.children.length
    });

    this._overlay = overlay;
    this._highlight = highlight;
  }
}

export const selectionOverlay = new SelectionOverlay();


