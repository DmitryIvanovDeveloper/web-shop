import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupabaseRevenueRepository } from '../supabase-revenue.repository';
import { ConsoleLogger } from '../../../../../../../infrastructure/logging/console-logger';
import type { Logger } from '../../../../../../application/ports/logger.port';

// Mock Supabase client
const mockSupabaseClient = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        gte: vi.fn(() => Promise.resolve({ data: [], error: null }))
      })),
      gte: vi.fn(() => Promise.resolve({ data: [], error: null }))
    }))
  }))
};

// Mock createClient
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabaseClient)
}));

describe('SupabaseRevenueRepository', () => {
  let repository: SupabaseRevenueRepository;
  let mockLogger: Logger;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock environment variables
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';
    
    mockLogger = new ConsoleLogger();
    repository = new SupabaseRevenueRepository(mockLogger);
  });

  describe('getRevenueSummary', () => {
    it('should return revenue summary with calculated metrics', async () => {
      // Arrange - Mock successful transactions data
      const mockTransactions = [
        { amount: 100, created_at: '2024-01-01T10:00:00Z', payment_status: 'succeeded' },
        { amount: 200, created_at: '2024-01-02T10:00:00Z', payment_status: 'succeeded' },
        { amount: 150, created_at: '2024-01-03T10:00:00Z', payment_status: 'succeeded' }
      ];

      const mockVisitors = [
        { user_id: 'user1', created_at: '2024-01-01T10:00:00Z' },
        { user_id: 'user2', created_at: '2024-01-02T10:00:00Z' }
      ];

      // Mock Supabase responses
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'transaction log') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                gte: vi.fn(() => Promise.resolve({ 
                  data: mockTransactions, 
                  error: null 
                }))
              }))
            }))
          };
        } else if (table === 'user_sessions') {
          return {
            select: vi.fn(() => ({
              gte: vi.fn(() => Promise.resolve({ 
                data: mockVisitors, 
                error: null 
              }))
            }))
          };
        }
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              gte: vi.fn(() => ({
                lt: vi.fn(() => Promise.resolve({ 
                  data: [], 
                  error: null 
                }))
              }))
            }))
          }))
        };
      });

      // Act
      const result = await repository.getRevenueSummary();

      // Assert
      expect(result).toBeDefined();
      expect(result.totalRevenue).toBe(450); // 100 + 200 + 150
      expect(result.averageOrderValue).toBe(150); // 450 / 3
      expect(result.revenuePerVisitor).toBe(225); // 450 / 2
      expect(result.netIncome).toBe(360); // 450 - (450 * 0.2)
      expect(result.currency).toBe('USD');
      expect(result.trend).toBeDefined();
      expect(Array.isArray(result.trend)).toBe(true);
    });

    it('should handle empty transactions data', async () => {
      // Arrange - Mock empty transactions
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'transaction log') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                gte: vi.fn(() => Promise.resolve({ 
                  data: [], 
                  error: null 
                }))
              }))
            }))
          };
        } else if (table === 'user_sessions') {
          return {
            select: vi.fn(() => ({
              gte: vi.fn(() => Promise.resolve({ 
                data: [], 
                error: null 
              }))
            }))
          };
        }
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              gte: vi.fn(() => Promise.resolve({ 
                data: [], 
                error: null 
              }))
            }))
          }))
        };
      });

      // Act
      const result = await repository.getRevenueSummary();

      // Assert
      expect(result.totalRevenue).toBe(0);
      expect(result.averageOrderValue).toBe(0);
      expect(result.revenuePerVisitor).toBe(0);
      expect(result.netIncome).toBe(0);
    });

    it('should handle Supabase errors gracefully', async () => {
      // Arrange - Mock Supabase error
      const mockError = { message: 'Database connection failed' };
      mockSupabaseClient.from.mockImplementation(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            gte: vi.fn(() => Promise.resolve({ 
              data: null, 
              error: mockError 
            }))
          }))
        }))
      }));

      // Act & Assert
      await expect(repository.getRevenueSummary()).rejects.toThrow(
        'Failed to load transactions: Database connection failed'
      );
    });

    it('should handle missing environment variables', () => {
      // Arrange
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      // Act & Assert
      expect(() => new SupabaseRevenueRepository(mockLogger)).toThrow(
        'Supabase URL and Anon Key must be provided'
      );
    });

    it('should calculate trend data correctly', async () => {
      // Arrange - Mock transactions with specific dates
      const mockTransactions = [
        { amount: 100, created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), payment_status: 'succeeded' },
        { amount: 200, created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), payment_status: 'succeeded' },
        { amount: 150, created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), payment_status: 'succeeded' }
      ];

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'transaction log') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                gte: vi.fn(() => Promise.resolve({ 
                  data: mockTransactions, 
                  error: null 
                }))
              }))
            }))
          };
        } else if (table === 'user_sessions') {
          return {
            select: vi.fn(() => ({
              gte: vi.fn(() => Promise.resolve({ 
                data: [], 
                error: null 
              }))
            }))
          };
        }
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              gte: vi.fn(() => ({
                lt: vi.fn(() => Promise.resolve({ 
                  data: [], 
                  error: null 
                }))
              }))
            }))
          }))
        };
      });

      // Act
      const result = await repository.getRevenueSummary();

      // Assert
      expect(result.trend).toBeDefined();
      expect(Array.isArray(result.trend)).toBe(true);
      expect(result.trend.length).toBeGreaterThan(0);
      
      // Check that trend data has correct structure
      result.trend.forEach(point => {
        expect(point).toHaveProperty('timestamp');
        expect(point).toHaveProperty('value');
        expect(point.timestamp).toBeInstanceOf(Date);
        expect(typeof point.value).toBe('number');
      });
    });
  });
});
