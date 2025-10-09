import { describe, it, expect } from 'vitest';
import { DerivedMetric } from '../../domain/entities/derived-metric.entity';

describe('DerivedMetric', () => {
  describe('create', () => {
    it('should create a valid derived metric', () => {
      const result = DerivedMetric.create({
        id: 'conversion-rate',
        name: 'Conversion Rate',
        numeratorMetricId: 'sales',
        denominatorMetricId: 'visitors',
        operator: 'divide',
        format: 'percentage',
        decimals: 2,
      });

      expect(result.isSuccess()).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.id).toBe('conversion-rate');
      expect(result.data!.name).toBe('Conversion Rate');
    });

    it('should reject empty ID', () => {
      const result = DerivedMetric.create({
        id: '',
        name: 'Test Metric',
        numeratorMetricId: 'sales',
        operator: 'divide',
      });

      expect(result.isFailure()).toBe(true);
      expect(result.error?.message).toContain('ID is required');
    });

    it('should reject empty name', () => {
      const result = DerivedMetric.create({
        id: 'test-metric',
        name: '',
        numeratorMetricId: 'sales',
        operator: 'divide',
      });

      expect(result.isFailure()).toBe(true);
      expect(result.error?.message).toContain('name is required');
    });

    it('should reject divide operator without denominator', () => {
      const result = DerivedMetric.create({
        id: 'test-metric',
        name: 'Test',
        numeratorMetricId: 'sales',
        operator: 'divide',
      });

      expect(result.isFailure()).toBe(true);
      expect(result.error?.message).toContain('Denominator is required');
    });

    it('should reject percentage operator without denominator', () => {
      const result = DerivedMetric.create({
        id: 'test-metric',
        name: 'Test',
        numeratorMetricId: 'sales',
        operator: 'percentage',
      });

      expect(result.isFailure()).toBe(true);
      expect(result.error?.message).toContain('Denominator is required');
    });
  });

  describe('calculate', () => {
    it('should calculate division correctly', () => {
      const metricResult = DerivedMetric.create({
        id: 'test',
        name: 'Test',
        numeratorMetricId: 'a',
        denominatorMetricId: 'b',
        operator: 'divide',
      });

      expect(metricResult.isSuccess()).toBe(true);
      const metric = metricResult.data!;

      const result = metric.calculate(100, 4);
      expect(result.isSuccess()).toBe(true);
      expect(result.data).toBe(25);
    });

    it('should reject division by zero', () => {
      const metricResult = DerivedMetric.create({
        id: 'test',
        name: 'Test',
        numeratorMetricId: 'a',
        denominatorMetricId: 'b',
        operator: 'divide',
      });

      const metric = metricResult.data!;
      const result = metric.calculate(100, 0);

      expect(result.isFailure()).toBe(true);
      expect(result.error?.message).toContain('divide by zero');
    });

    it('should calculate multiplication correctly', () => {
      const metricResult = DerivedMetric.create({
        id: 'test',
        name: 'Test',
        numeratorMetricId: 'a',
        denominatorMetricId: 'b',
        operator: 'multiply',
      });

      const metric = metricResult.data!;
      const result = metric.calculate(10, 5);

      expect(result.isSuccess()).toBe(true);
      expect(result.data).toBe(50);
    });

    it('should calculate addition correctly', () => {
      const metricResult = DerivedMetric.create({
        id: 'test',
        name: 'Test',
        numeratorMetricId: 'a',
        denominatorMetricId: 'b',
        operator: 'add',
      });

      const metric = metricResult.data!;
      const result = metric.calculate(10, 5);

      expect(result.isSuccess()).toBe(true);
      expect(result.data).toBe(15);
    });

    it('should calculate subtraction correctly', () => {
      const metricResult = DerivedMetric.create({
        id: 'test',
        name: 'Test',
        numeratorMetricId: 'a',
        denominatorMetricId: 'b',
        operator: 'subtract',
      });

      const metric = metricResult.data!;
      const result = metric.calculate(10, 5);

      expect(result.isSuccess()).toBe(true);
      expect(result.data).toBe(5);
    });

    it('should calculate percentage correctly', () => {
      const metricResult = DerivedMetric.create({
        id: 'test',
        name: 'Test',
        numeratorMetricId: 'a',
        denominatorMetricId: 'b',
        operator: 'percentage',
      });

      const metric = metricResult.data!;
      const result = metric.calculate(25, 100);

      expect(result.isSuccess()).toBe(true);
      expect(result.data).toBe(25);
    });
  });

  describe('formatValue', () => {
    it('should format as number', () => {
      const metricResult = DerivedMetric.create({
        id: 'test',
        name: 'Test',
        numeratorMetricId: 'a',
        operator: 'divide',
        format: 'number',
        decimals: 2,
      });

      const metric = metricResult.data!;
      const formatted = metric.formatValue(1234.5678);

      expect(formatted).toBe('1,234.57');
    });

    it('should format as currency', () => {
      const metricResult = DerivedMetric.create({
        id: 'test',
        name: 'Test',
        numeratorMetricId: 'a',
        operator: 'divide',
        format: 'currency',
        decimals: 2,
      });

      const metric = metricResult.data!;
      const formatted = metric.formatValue(1234.567);

      expect(formatted).toContain('1,234.57');
      expect(formatted).toContain('$');
    });

    it('should format as percentage', () => {
      const metricResult = DerivedMetric.create({
        id: 'test',
        name: 'Test',
        numeratorMetricId: 'a',
        operator: 'divide',
        format: 'percentage',
        decimals: 1,
      });

      const metric = metricResult.data!;
      const formatted = metric.formatValue(25.678);

      expect(formatted).toBe('25.7%');
    });

    it('should respect decimal places', () => {
      const metricResult = DerivedMetric.create({
        id: 'test',
        name: 'Test',
        numeratorMetricId: 'a',
        operator: 'divide',
        format: 'number',
        decimals: 0,
      });

      const metric = metricResult.data!;
      const formatted = metric.formatValue(1234.567);

      expect(formatted).toBe('1,235');
    });
  });

  describe('update', () => {
    it('should update metric properties', () => {
      const metricResult = DerivedMetric.create({
        id: 'test',
        name: 'Test',
        numeratorMetricId: 'a',
        operator: 'divide',
      });

      const metric = metricResult.data!;
      const updated = metric.update({ name: 'Updated Name', decimals: 3 });

      expect(updated.name).toBe('Updated Name');
      expect(updated.decimals).toBe(3);
      expect(updated.id).toBe('test'); // ID should not change
    });
  });
});


