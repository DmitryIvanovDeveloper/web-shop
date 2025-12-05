export interface SelectionRect {
  left: number;
  top: number;
  width: number;
  height: number;
  borderRadius?: number;
}

/**
 * SelectionOverlay
 * Lightweight DOM-based overlay for highlighting selected elements in preview.
 * Does NOT modify component styles; draws a spotlight rectangle on top.
 */
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

    // Draw spotlight slightly ВНУТРИ элемента:
    // уменьшаем прямоугольник на несколько пикселей,
    // чтобы рамка визуально была внутри, а не снаружи.
    const inset = 3;
    const insetWidth = Math.max(rect.width - inset * 2, 0);
    const insetHeight = Math.max(rect.height - inset * 2, 0);

    // If element is not visible in the current viewport (e.g. sidebar is closed in mobile),
    // do not show the overlay at all.
    const isOffscreen =
      rect.width <= 0 ||
      rect.height <= 0 ||
      rect.right < 0 ||
      rect.bottom < 0 ||
      rect.left > window.innerWidth ||
      rect.top > window.innerHeight;

    if (isOffscreen) {
      this._overlay.style.display = 'none';
      this._currentHoveredElementId = null;
      // keep selected state logically, but do not draw anything
      return;
    }

    // If a sidebar is visible (e.g. slide-out sidebar on mobile) and we are trying
    // to draw selection for the full page (page-*), do not show the page outline
    // behind the sidebar.
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
        // Remove CSS-based selection class from page to avoid ::before outlines,
        // but keep the logical selected state (used by the builder).
        const pageElement = document.querySelector<HTMLElement>(`[data-element-id="${elementId}"]`);
        if (pageElement) {
          pageElement.classList.remove('preview-selected');
        }
        // Keep selected state logically, but do not render any visual outline
        // while sidebar is open.
        return;
      }
    }

    // Hover всегда имеет визуальный приоритет над selected
    if (isSelected) {
      // Сохраняем selected элемент (но не показываем, если есть активный hover)
      this._currentSelectedElementId = elementId || null;
      this._selectedRect = rect;
      
      // Показываем selected только если нет активного hover
      if (this._currentHoveredElementId) {
        console.log('[SelectionOverlay] Selected element saved, but hover is active - not showing selected');
        return;
      }
    } else {
      // Hover всегда показывается (даже если есть selected)
      this._currentHoveredElementId = elementId || null;
    }

    this._overlay.style.display = 'block';

    this._highlight.style.left = `${rect.left + scrollX + inset}px`;
    this._highlight.style.top = `${rect.top + scrollY + inset}px`;
    this._highlight.style.width = `${insetWidth}px`;
    this._highlight.style.height = `${insetHeight}px`;
    this._highlight.style.borderRadius =
      rect.borderRadius !== undefined ? `${Math.max(rect.borderRadius - inset, 0)}px` : '12px';

    // Different styles for hover vs selected (всё внутри контура элемента)
    if (isSelected) {
      // Selected: яркая внутренняя рамка
      this._highlight.style.boxShadow =
        '0 0 0 2px rgba(59,130,246,1)';
    } else {
      // Hover: более мягкая внутренняя рамка
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

    // Explicit hide (e.g. clear selection) – always hide and reset state
    if (!elementId) {
      this._overlay.style.display = 'none';
      this._currentHoveredElementId = null;
      this._currentSelectedElementId = null;
      this._selectedRect = null;
      return;
    }

    // If hiding hovered element
    if (this._currentHoveredElementId === elementId) {
      this._currentHoveredElementId = null;
      
      // If there's a selected element, restore its spotlight
      if (this._currentSelectedElementId && this._selectedRect) {
        console.log('[SelectionOverlay] Hover ended, restoring selected element spotlight');
        this._showRect(this._selectedRect, true);
        return;
      }
      
      // No selected element, hide overlay
      this._overlay.style.display = 'none';
      return;
    }

    // If hiding selected element
    if (this._currentSelectedElementId === elementId) {
      this._currentSelectedElementId = null;
      this._selectedRect = null;
      
      // If there's a hovered element, keep showing it
      if (this._currentHoveredElementId) {
        console.log('[SelectionOverlay] Selected cleared, but hover is active - keeping hover');
        return;
      }
      
      // No hover, hide overlay
      this._overlay.style.display = 'none';
      return;
    }

    // If it's some other element, nothing to do
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
      '0 0 0 2px rgba(59,130,246,0.7), 0 0 0 15px rgba(59,130,246,0.2)'; // Default hover style
    highlight.style.background = 'transparent';

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


