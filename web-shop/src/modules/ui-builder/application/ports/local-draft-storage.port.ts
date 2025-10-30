export interface LocalDraft {
  appId: string;
  updatedAt: number;
  data: Record<string, unknown>;
}

export interface LocalDraftStoragePort {
  saveDraft(appId: string, draft: LocalDraft): Promise<void>;
  loadDraft(appId: string): Promise<LocalDraft | null>;
  clearDraft(appId: string): Promise<void>;
}


