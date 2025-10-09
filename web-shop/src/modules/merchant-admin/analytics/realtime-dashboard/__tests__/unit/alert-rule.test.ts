import { describe, it, expect } from 'vitest';
import { AlertRule } from '../../domain/value-objects/alert-rule.value-object';
import { InvalidThresholdError, InvalidMetricError, InvalidScopeError } from '../../domain/errors/alert-rule.error';

describe('AlertRule', () => {
  describe('create', () => {
    it('should create a valid alert rule with GREATER_THAN operator', () => {
      const result = AlertRule.create({
        id: 'rule-1',
        name: 'High Refund Rate',
        metric: 'refundRate',
        operator: 'GREATER_THAN',
        threshold: 15,
        scope: 'ALL',
      });

      expect(result.success).toBe(true);
      expect(result.data.name).toBe('High Refund Rate');
      expect(result.data.metric).toBe('refundRate');
      expect(result.data.operator).toBe('GREATER_THAN');
      expect(result.data.threshold).toBe(15);
    });

    it('should create a valid alert rule with BETWEEN operator', () => {
      const result = AlertRule.create({
        id: 'rule-2',
        name: 'Normal Sales Range',
        metric: 'sales',
        operator: 'BETWEEN',
        threshold: { min: 100000, max: 200000 },
        scope: 'ALL',
      });

      expect(result.success).toBe(true);
      expect(result.data.threshold).toEqual({ min: 100000, max: 200000 });
    });

    it('should fail when metric name is empty', () => {
      const result = AlertRule.create({
        id: 'rule-3',
        name: 'Test',
        metric: '',
        operator: 'GREATER_THAN',
        threshold: 10,
        scope: 'ALL',
      });

      expect(result.isFailure()).toBe(true);
      expect(result.error).toBeInstanceOf(InvalidMetricError);
    });

    it('should fail when threshold is negative for non-BETWEEN operator', () => {
      const result = AlertRule.create({
        id: 'rule-4',
        name: 'Test',
        metric: 'sales',
        operator: 'GREATER_THAN',
        threshold: -10,
        scope: 'ALL',
      });

      expect(result.isFailure()).toBe(true);
      expect(result.error).toBeInstanceOf(InvalidThresholdError);
    });

    it('should fail when BETWEEN min >= max', () => {
      const result = AlertRule.create({
        id: 'rule-5',
        name: 'Test',
        metric: 'sales',
        operator: 'BETWEEN',
        threshold: { min: 200000, max: 100000 },
        scope: 'ALL',
      });

      expect(result.isFailure()).toBe(true);
      expect(result.error).toBeInstanceOf(InvalidThresholdError);
    });

    it('should fail when scope is not ALL and scopeValue is missing', () => {
      const result = AlertRule.create({
        id: 'rule-6',
        name: 'Test',
        metric: 'sales',
        operator: 'GREATER_THAN',
        threshold: 10,
        scope: 'REGION',
      });

      expect(result.isFailure()).toBe(true);
      expect(result.error).toBeInstanceOf(InvalidScopeError);
    });

    it('should succeed when scope is REGION and scopeValue is provided', () => {
      const result = AlertRule.create({
        id: 'rule-7',
        name: 'US Sales',
        metric: 'sales',
        operator: 'GREATER_THAN',
        threshold: 10,
        scope: 'REGION',
        scopeValue: 'US',
      });

      expect(result.isSuccess()).toBe(true);
      expect(result.value.scopeValue).toBe('US');
    });
  });

  describe('evaluate', () => {
    it('should return true when value is greater than threshold', () => {
      const rule = AlertRule.create({
        id: 'rule-1',
        name: 'Test',
        metric: 'refundRate',
        operator: 'GREATER_THAN',
        threshold: 15,
        scope: 'ALL',
      }).value;

      expect(rule.evaluate(20)).toBe(true);
      expect(rule.evaluate(15)).toBe(false);
      expect(rule.evaluate(10)).toBe(false);
    });

    it('should return true when value is less than threshold', () => {
      const rule = AlertRule.create({
        id: 'rule-2',
        name: 'Test',
        metric: 'sales',
        operator: 'LESS_THAN',
        threshold: 100000,
        scope: 'ALL',
      }).value;

      expect(rule.evaluate(50000)).toBe(true);
      expect(rule.evaluate(100000)).toBe(false);
      expect(rule.evaluate(150000)).toBe(false);
    });

    it('should return true when value equals threshold', () => {
      const rule = AlertRule.create({
        id: 'rule-3',
        name: 'Test',
        metric: 'conversion',
        operator: 'EQUALS',
        threshold: 5,
        scope: 'ALL',
      }).value;

      expect(rule.evaluate(5)).toBe(true);
      expect(rule.evaluate(4.9)).toBe(false);
      expect(rule.evaluate(5.1)).toBe(false);
    });

    it('should return true when value is within range for BETWEEN', () => {
      const rule = AlertRule.create({
        id: 'rule-4',
        name: 'Test',
        metric: 'sales',
        operator: 'BETWEEN',
        threshold: { min: 100000, max: 200000 },
        scope: 'ALL',
      }).value;

      expect(rule.evaluate(150000)).toBe(true);
      expect(rule.evaluate(100000)).toBe(true);
      expect(rule.evaluate(200000)).toBe(true);
      expect(rule.evaluate(50000)).toBe(false);
      expect(rule.evaluate(250000)).toBe(false);
    });
  });

  describe('toExpression', () => {
    it('should format GREATER_THAN expression', () => {
      const rule = AlertRule.create({
        id: 'rule-1',
        name: 'Test',
        metric: 'refundRate',
        operator: 'GREATER_THAN',
        threshold: 15,
        scope: 'ALL',
      }).value;

      expect(rule.toExpression()).toBe('refund Rate > 15');
    });

    it('should format LESS_THAN expression', () => {
      const rule = AlertRule.create({
        id: 'rule-2',
        name: 'Test',
        metric: 'totalSales',
        operator: 'LESS_THAN',
        threshold: 100000,
        scope: 'ALL',
      }).value;

      expect(rule.toExpression()).toBe('total Sales < 100000');
    });

    it('should format BETWEEN expression', () => {
      const rule = AlertRule.create({
        id: 'rule-3',
        name: 'Test',
        metric: 'sales',
        operator: 'BETWEEN',
        threshold: { min: 100000, max: 200000 },
        scope: 'ALL',
      }).value;

      expect(rule.toExpression()).toBe('100000 ≤ sales ≤ 200000');
    });
  });
});

