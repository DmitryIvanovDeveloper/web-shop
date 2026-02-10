export interface MetricsSelection {
  selectedMetrics: string[];
  visiblePanels: string[];
  layout: string;
}

import type { Logger } from '../../../../../../application/ports/logger.port';

export class MetricsSelectionRepositoryMock {
  private selection: MetricsSelection | null = null;
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  async load(): Promise<MetricsSelection | null> {
    try {
      
      const response = await fetch('/mocks/api/metrics/selected.json');
      const data = await response.json();

      this.selection = data as MetricsSelection;
      return this.selection;
    } catch (error) {
            return null;
    }
  }

  async save(selection: MetricsSelection): Promise<void> {

    this.selection = selection;
  }

  async loadCatalog(): Promise<any> {
    try {
      const response = await fetch('/mocks/api/metrics/catalog.json');
      return await response.json();
    } catch (error) {
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

export const metricsSelectionRepository = new MetricsSelectionRepositoryMock({
  info: () => {},
  warn: () => {},
  debug: () => {},
  error: () => {},
});
