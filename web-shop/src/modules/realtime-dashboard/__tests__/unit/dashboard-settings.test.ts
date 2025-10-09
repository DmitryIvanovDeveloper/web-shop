import { describe, it, expect } from 'vitest';
import { DashboardSettings } from '../../domain/value-objects/dashboard-settings.value-object';

describe('DashboardSettings', () => {
  it('should create default settings', () => {
    const settings = DashboardSettings.createDefault();
    
    expect(settings.dateRange).toBe('last7days');
    expect(settings.refreshInterval).toBe(30000);
    expect(settings.theme).toBe('light');
  });

  it('should convert to query params', () => {
    const settings = new DashboardSettings('last30days', 60000, 'dark');
    const params = settings.toQueryParams();

    expect(params.get('dateRange')).toBe('last30days');
    expect(params.get('refreshInterval')).toBe('60000');
    expect(params.get('theme')).toBe('dark');
  });

  it('should create from query params', () => {
    const params = new URLSearchParams({
      dateRange: 'today',
      refreshInterval: '45000',
      theme: 'light'
    });

    const result = DashboardSettings.fromQueryParams(params);

    expect(result.success).toBe(true);
    expect(result.data.dateRange).toBe('today');
    expect(result.data.refreshInterval).toBe(45000);
    expect(result.data.theme).toBe('light');
  });

  it('should use defaults for missing query params', () => {
    const params = new URLSearchParams();
    const result = DashboardSettings.fromQueryParams(params);

    expect(result.success).toBe(true);
    expect(result.data.dateRange).toBe('last7days');
    expect(result.data.refreshInterval).toBe(30000);
    expect(result.data.theme).toBe('light');
  });
});

