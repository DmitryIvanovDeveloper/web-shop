import { injectable } from 'inversify';
import type { LocalDraft, LocalDraftStoragePort } from '../../application/ports/local-draft-storage.port';

@injectable()
export class LocalStorageDraftAdapter implements LocalDraftStoragePort {
  private _key(appId: string): string { return `ui_builder_draft_${appId}`; }

  async saveDraft(appId: string, draft: LocalDraft): Promise<void> {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this._key(appId), JSON.stringify(draft));
  }

  async loadDraft(appId: string): Promise<LocalDraft | null> {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(this._key(appId));
    if (!raw) return null;
    try { return JSON.parse(raw) as LocalDraft; } catch { return null; }
  }

  async clearDraft(appId: string): Promise<void> {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this._key(appId));
  }
}


