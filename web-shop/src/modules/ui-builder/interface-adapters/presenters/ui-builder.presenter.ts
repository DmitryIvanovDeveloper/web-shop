import { inject, injectable } from 'inversify';
import { UI_BUILDER_TYPES } from '../../infrastructure/bootstrap/types';
import type { PreviewCommunicationPort } from '../../application/ports/preview-communication.port';
import type { SaveDraftUseCase } from '../../application/use-cases/save-draft.use-case';
import { container } from '@/infrastructure/bootstrap/container';

interface ViewModel {
  appId: string;
  version: number | null;
  isDraft: boolean;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  validationErrors: any[];
  config: Record<string, unknown> | null;
  selectedElement: { id: string; colors?: Record<string, string> } | null;
}

@injectable()
export class UIBuilderPresenter {
  private readonly subscribers: Array<(vm: ViewModel) => void> = [];
  private saveDraftDebounceTimer: NodeJS.Timeout | null = null;
  private vm: ViewModel = {
    appId: '',
    version: 1,
    isDraft: true,
    isLoading: false,
    isSaving: false,
    error: null,
    validationErrors: [],
    config: {
      theme: { colors: { primary: '#1d4ed8', background: '#ffffff', text: '#111827' } },
      modules: {
        uiRenderer: {
          sidebar: {
            version: '1.0',
            theme: {
              colors: { primary: '#1d4ed8', background: '#ffffff', surface: '#ffffff', text: '#111827' },
              spacing: [4, 8, 12, 16, 24, 32, 48, 64]
            },
            layout: {
              id: 'left-sidebar',
              type: 'Container',
              props: { text: 'Left Sidebar' },
              styles: { backgroundColor: '#f3f4f6', textColor: '#111827', borderColor: '#e5e7eb' },
              children: [
                {
                  id: 'store-button',
                  type: 'Button',
                  props: { text: 'Store' },
                  styles: { backgroundColor: '#1d4ed8', textColor: '#ffffff', borderColor: '#1e40af' },
                },
              ],
            },
          },
        },
      },
    },
    selectedElement: null,
  };

  constructor(
    @inject(UI_BUILDER_TYPES.PreviewCommunication)
    private readonly preview: PreviewCommunicationPort
  ) {}

  public subscribe(cb: (vm: ViewModel) => void): () => void {
    this.subscribers.push(cb);
    cb(this.vm);
    return () => {
      const idx = this.subscribers.indexOf(cb);
      if (idx >= 0) this.subscribers.splice(idx, 1);
    };
  }

  private notify(): void {
    for (const cb of this.subscribers) cb(this.vm);
  }

  public getViewModel(): ViewModel {
    return this.vm;
  }

  public getPreviewCommunication(): PreviewCommunicationPort {
    return this.preview;
  }

  public async loadConfig(appId: string): Promise<void> {
    this.vm.isLoading = true;
    this.vm.appId = appId;
    this.notify();
    // Placeholder for real load via use case; keep current config
    this.vm.isLoading = false;
    this.notify();
  }

  public async loadLocalDraft(): Promise<void> {
    // no-op placeholder
  }

  public updateTheme(colors: Record<string, string>): void {
    // Update config and trigger auto-save
    if (this.vm.config) {
      (this.vm.config as any).theme = { ...(this.vm.config as any).theme, colors };
    }
    this.triggerAutoSave();
  }

  public selectElement(elementId: string): void {
    console.log('[UIBuilderPresenter] selectElement called:', elementId);
    const colors = this.getElementColorsFromConfig(elementId);
    console.log('[UIBuilderPresenter] Found colors:', colors);
    // Create new viewModel object to trigger React re-render
    this.vm = { ...this.vm, selectedElement: { id: elementId, colors: colors || undefined } };
    console.log('[UIBuilderPresenter] Updated viewModel.selectedElement:', this.vm.selectedElement);
    this.notify();
  }

  public updateElementColors(elementId: string, colors: Record<string, string>): void {
    this.applyColorsToConfig(elementId, colors);
    this.selectElement(elementId);
    this.triggerAutoSave();
  }

  public addSidebarButton(label?: string): void {
    const layout = (this.vm.config as any)?.modules?.uiRenderer?.sidebar?.layout;
    if (!layout) return;
    if (!Array.isArray(layout.children)) {
      layout.children = [];
    }

    const existingIds = new Set<string>();
    const collect = (n: any) => {
      if (n?.id) existingIds.add(n.id);
      if (Array.isArray(n?.children)) n.children.forEach(collect);
    };
    collect(layout);

    let index = 1;
    let newId = `button-${index}`;
    while (existingIds.has(newId)) {
      index += 1;
      newId = `button-${index}`;
    }

    const node = {
      id: newId,
      type: 'Button',
      props: { text: label || 'New Button' },
      styles: {
        backgroundColor: '#1d4ed8',
        textColor: '#ffffff',
        borderColor: '#1e40af',
      },
    };

    layout.children.push(node);
    // Иммутабельное обновление, чтобы React отследил изменения
    const clonedConfig = JSON.parse(JSON.stringify(this.vm.config || {}));
    this.vm = {
      ...this.vm,
      config: clonedConfig,
      selectedElement: { id: newId, colors: this.getElementColorsFromConfig(newId) || undefined },
      isDraft: true,
    };
    this.notify();
  }

  public async saveDraft(): Promise<boolean> {
    // stub success
    this.vm.isDraft = true;
    this.notify();
    return true;
  }

  public async publishDraft(): Promise<boolean> {
    // stub publish success
    this.vm.isDraft = false;
    this.notify();
    return true;
  }

  public previewAuthPopup(visible: boolean): void {
    // Preview via Supabase Realtime only
  }

  public updateLoginButton(input: { text?: string; styles?: Record<string, string> }): void {
    const node = this.findNode('store-button');
    if (!node) return;
    if (input.text) node.props = { ...(node.props || {}), text: input.text };
    if (input.styles) node.styles = { ...(node.styles || {}), ...input.styles };
    this.notify();
    this.triggerAutoSave();
  }

  public updateAuthPopup(input: Record<string, unknown>): void {
    this.triggerAutoSave();
  }

  private triggerAutoSave(): void {
    // Clear existing timer
    if (this.saveDraftDebounceTimer) {
      clearTimeout(this.saveDraftDebounceTimer);
    }

    // Set new timer - debounce for 300ms
    this.saveDraftDebounceTimer = setTimeout(() => {
      this.saveDraftDebounceTimer = null;
      this.autoSaveDraft();
    }, 300);
  }

  private async autoSaveDraft(): Promise<void> {
    if (!this.vm.config || !this.vm.appId) {
      console.warn('[UIBuilderPresenter] Cannot auto-save: missing config or appId');
      return;
    }

    try {
      console.log('[UIBuilderPresenter] Auto-saving draft');
      const saveDraftUseCase = container.get<SaveDraftUseCase>(UI_BUILDER_TYPES.SaveDraftUseCase);
      const result = await saveDraftUseCase.execute({
        appId: this.vm.appId,
        config: this.vm.config,
      });
      
      if (result.isSuccess) {
        console.log('[UIBuilderPresenter] Draft auto-saved successfully');
        this.vm.isDraft = true;
        this.notify();
        
        // Dispatch custom event for UIBuilderPage to refresh iframe
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('uibuilder:autoSave'));
        }
      } else {
        console.error('[UIBuilderPresenter] Failed to auto-save draft:', result.error);
      }
    } catch (error) {
      console.error('[UIBuilderPresenter] Error during auto-save:', error);
    }
  }

  private getElementColorsFromConfig(elementId: string): Record<string, string> | null {
    const node = this.findNode(elementId);
    if (!node) return null;
    const s = node.styles || {};
    const colors: Record<string, string> = {};
    if (s.backgroundColor) colors.backgroundColor = s.backgroundColor;
    if (s.textColor) colors.textColor = s.textColor;
    if (s.borderColor) colors.borderColor = s.borderColor;
    return colors;
  }

  private applyColorsToConfig(elementId: string, colors: Record<string, string>): void {
    const node = this.findNode(elementId);
    if (!node) return;
    node.styles = { ...(node.styles || {}), ...colors };
  }

  private findNode(elementId: string): any | null {
    const layout = (this.vm.config as any)?.modules?.uiRenderer?.sidebar?.layout;
    if (!layout) return null;
    const dfs = (n: any): any | null => {
      if (n.id === elementId) return n;
      if (Array.isArray(n.children)) {
        for (const c of n.children) {
          const r = dfs(c);
          if (r) return r;
        }
      }
      return null;
    };
    return dfs(layout);
  }
}


