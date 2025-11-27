export interface MetricsSelection {
  selectedMetrics: string[];
  visiblePanels: string[];
  layout: string;
}

import type { Logger } from '../../../../../../application/ports/logger.port';
import { ROOT_TYPES } from '../../../../../../infrastructure/bootstrap/types';
import { inject, injectable } from 'inversify';

@injectable()
export class MetricsSelectionRepositoryMock {
  private selection: MetricsSelection | null = null;

  constructor(
    @inject(ROOT_TYPES.Logger)
    private readonly logger: Logger
  ) {}

  async load(): Promise<MetricsSelection | null> {
    try {
      // Load from mock JSON
      const response = await fetch('/mocks/api/metrics/selected.json');
      const data = await response.json();
      
      // Store in memory
      this.selection = data as MetricsSelection;
      return this.selection;
    } catch (error) {
      this.logger.error('[MetricsSelectionRepositoryMock] Failed to load metrics selection', error as Error);
      return null;
    }
  }

  async save(selection: MetricsSelection): Promise<void> {
    // In real app, this would POST to API
    // For now, just store in memory
    this.selection = selection;
  }

  async loadCatalog(): Promise<any> {
    try {
      const response = await fetch('/mocks/api/metrics/catalog.json');
      return await response.json();
    } catch (error) {
      this.logger.error('[MetricsSelectionRepositoryMock] Failed to load metrics catalog', error as Error);
      return { categories: [] };
    }
  }

  getCurrent(): MetricsSelection | null {
    return this.selection;
  }

  isMetricSelected(metricId: string): boolean {
    return this.selection?.selectedMetrics?.includes(metricId) ?? false;
  }

  isPanelVisible(panelId: string): boolean {
    return this.selection?.visiblePanels?.includes(panelId) ?? true;
  }
}

// Singleton instance
export const metricsSelectionRepository = new MetricsSelectionRepositoryMock();
