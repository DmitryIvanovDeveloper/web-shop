import { describe, it, expect } from 'vitest';
import { MonitorDataFreshnessUseCase } from '../../application/use-cases/monitor-data-freshness.use-case';

describe('MonitorDataFreshnessUseCase Integration', () => {
  it('should monitor multiple panels and report overall fresh status', () => {
    const useCase = new MonitorDataFreshnessUseCase();
    
    const panelUpdates = new Map<string, Date>();
    const now = new Date();
    
    // All panels updated recently
    panelUpdates.set('sales', new Date(now.getTime() - 60000)); // 1 minute ago
    panelUpdates.set('revenue', new Date(now.getTime() - 120000)); // 2 minutes ago
    panelUpdates.set('geography', new Date(now.getTime() - 180000)); // 3 minutes ago
    
    const result = useCase.execute({ panelUpdates });
    
    expect(result.isSuccess()).toBe(true);
    expect(result.data!.overallStatus).toBe('fresh');
    expect(result.data!.metrics).toHaveLength(3);
    expect(result.data!.stalePanels).toHaveLength(0);
    expect(result.data!.warningPanels).toHaveLength(0);
  });

  it('should detect warning status for delayed panels', () => {
    const useCase = new MonitorDataFreshnessUseCase();
    
    const panelUpdates = new Map<string, Date>();
    const now = new Date();
    
    // One panel delayed
    panelUpdates.set('sales', new Date(now.getTime() - 60000)); // 1 minute ago - fresh
    panelUpdates.set('revenue', new Date(now.getTime() - 420000)); // 7 minutes ago - warning
    
    const result = useCase.execute({ panelUpdates });
    
    expect(result.isSuccess()).toBe(true);
    expect(result.data!.overallStatus).toBe('warning');
    expect(result.data!.warningPanels).toContain('revenue');
    expect(result.data!.stalePanels).toHaveLength(0);
  });

  it('should detect stale status for very old panels', () => {
    const useCase = new MonitorDataFreshnessUseCase();
    
    const panelUpdates = new Map<string, Date>();
    const now = new Date();
    
    // One panel very stale
    panelUpdates.set('sales', new Date(now.getTime() - 60000)); // 1 minute ago - fresh
    panelUpdates.set('geography', new Date(now.getTime() - 1000000)); // 16+ minutes ago - stale
    
    const result = useCase.execute({ panelUpdates });
    
    expect(result.isSuccess()).toBe(true);
    expect(result.data!.overallStatus).toBe('stale');
    expect(result.data!.stalePanels).toContain('geography');
  });

  it('should calculate lag seconds correctly for each panel', () => {
    const useCase = new MonitorDataFreshnessUseCase();
    
    const panelUpdates = new Map<string, Date>();
    const now = new Date();
    
    panelUpdates.set('sales', new Date(now.getTime() - 120000)); // 2 minutes ago
    
    const result = useCase.execute({ panelUpdates });
    
    expect(result.isSuccess()).toBe(true);
    const salesMetric = result.data!.metrics.find(m => m.panelId === 'sales');
    expect(salesMetric).toBeDefined();
    expect(salesMetric!.lagSeconds).toBeGreaterThanOrEqual(119);
    expect(salesMetric!.lagSeconds).toBeLessThanOrEqual(121);
  });

  it('should generate relative time strings', () => {
    const useCase = new MonitorDataFreshnessUseCase();
    
    const panelUpdates = new Map<string, Date>();
    const now = new Date();
    
    panelUpdates.set('sales', new Date(now.getTime() - 45000)); // 45 seconds ago
    panelUpdates.set('revenue', new Date(now.getTime() - 180000)); // 3 minutes ago
    
    const result = useCase.execute({ panelUpdates });
    
    expect(result.isSuccess()).toBe(true);
    
    const salesMetric = result.data!.metrics.find(m => m.panelId === 'sales');
    expect(salesMetric!.relativeTime).toContain('second');
    
    const revenueMetric = result.data!.metrics.find(m => m.panelId === 'revenue');
    expect(revenueMetric!.relativeTime).toContain('minute');
  });

  it('should use custom latency thresholds', () => {
    const useCase = new MonitorDataFreshnessUseCase();
    
    const panelUpdates = new Map<string, Date>();
    const now = new Date();
    
    // 90 seconds ago - would be fresh with default (300s), but warning with custom (60s)
    panelUpdates.set('sales', new Date(now.getTime() - 90000));
    
    const result = useCase.execute({
      panelUpdates,
      targetLatencySeconds: 60,
      maxLatencySeconds: 120,
    });
    
    expect(result.isSuccess()).toBe(true);
    expect(result.data!.overallStatus).toBe('warning');
  });

  it('should reject empty panel updates', () => {
    const useCase = new MonitorDataFreshnessUseCase();
    
    const panelUpdates = new Map<string, Date>();
    
    const result = useCase.execute({ panelUpdates });
    
    expect(result.isFailure()).toBe(true);
    expect(result.error?.message).toContain('cannot be empty');
  });

  describe('getIncidentPlaybook', () => {
    it('should return no-action playbook for fresh status', () => {
      const useCase = new MonitorDataFreshnessUseCase();
      const playbook = useCase.getIncidentPlaybook('fresh');
      
      expect(playbook).toHaveLength(1);
      expect(playbook[0]).toContain('no action needed');
    });

    it('should return monitoring steps for warning status', () => {
      const useCase = new MonitorDataFreshnessUseCase();
      const playbook = useCase.getIncidentPlaybook('warning');
      
      expect(playbook.length).toBeGreaterThan(1);
      expect(playbook.some(step => step.toLowerCase().includes('monitor'))).toBe(true);
    });

    it('should return detailed incident steps for stale status', () => {
      const useCase = new MonitorDataFreshnessUseCase();
      const playbook = useCase.getIncidentPlaybook('stale');
      
      expect(playbook.length).toBeGreaterThan(3);
      expect(playbook.some(step => step.toLowerCase().includes('service'))).toBe(true);
      expect(playbook.some(step => step.toLowerCase().includes('websocket'))).toBe(true);
    });
  });
});


