import React from 'react';

function getFocusable(container: HTMLElement): HTMLElement[] {
  const selectors = [
    'a[href]', 'area[href]', 'input:not([disabled])', 'select:not([disabled])',
    'textarea:not([disabled])', 'button:not([disabled])', 'iframe', 'object', 'embed',
    '*[tabindex]:not([tabindex="-1"])', '*[contenteditable=true]'
  ];
  return Array.from(container.querySelectorAll<HTMLElement>(selectors.join(',')))
    .filter(el => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden'));
}

export const FocusTrap: React.FC<{ children: React.ReactNode; initialFocusSelector?: string }> = ({ children, initialFocusSelector }) => {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const focusables = getFocusable(root);
    const toFocus = initialFocusSelector ? root.querySelector<HTMLElement>(initialFocusSelector) : focusables[0];
    toFocus?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const list = getFocusable(root);
      if (list.length === 0) return;
      const first = list[0];
      const last = list[list.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey) {
        if (active === first || !root.contains(active)) {
          last.focus();
          e.preventDefault();
        }
      } else {
        if (active === last) {
          first.focus();
          e.preventDefault();
        }
      }
    };

    root.addEventListener('keydown', onKeyDown as any);
    return () => root.removeEventListener('keydown', onKeyDown as any);
  }, [initialFocusSelector]);

  return <div ref={ref}>{children}</div>;
};

export default FocusTrap;

