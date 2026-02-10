import { injectable, inject } from 'inversify';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { RevenueRepositoryPort } from '../../application/ports/revenue-repository.port';
import { RevenueSummary } from '../../domain/entities/revenue-summary.entity';
import { ROOT_TYPES } from '../../../../../../infrastructure/bootstrap/types';
import type { Logger } from '../../../../../../application/ports/logger.port';
import { TrendDataPoint } from '../../domain/types/trend.types';

@injectable()
export class SupabaseRevenueRepository implements RevenueRepositoryPort {
  private readonly _supabase: SupabaseClient;

  constructor(
    @inject(ROOT_TYPES.Logger)
    private readonly _logger: Logger
  ) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL and Anon Key must be provided');
    }

    this._supabase = createClient(supabaseUrl, supabaseKey);
  }

  public async getRevenueSummary(): Promise<RevenueSummary> {
    try {
            const { data: transactions, error: transactionsError } = await this._supabase
        .from('transaction_log')
        .select('amount, created_at, payment_status')
        .eq('payment_status', 'succeeded')
        .gte('created_at', this.getLast30DaysDate());

      if (transactionsError) {
                throw new Error(`Failed to load transactions: ${transactionsError.message}`);
      }

      const { data: visitors, error: visitorsError } = await this._supabase
        .from('user_sessions')
        .select('user_id, created_at')
        .gte('created_at', this.getLast30DaysDate());

      if (visitorsError) {
              }

      const totalRevenue = this.calculateTotalRevenue(transactions || []);
      const averageOrderValue = this.calculateAverageOrderValue(transactions || []);
      const revenuePerVisitor = this.calculateRevenuePerVisitor(
        totalRevenue, 
        visitors || []
      );
      const netIncome = this.calculateNetIncome(totalRevenue);
      const monthlyGrowth = await this.calculateMonthlyGrowth();
      const trend = await this.calculateTrend(transactions || []);

      const revenueSummary = new RevenueSummary(
        totalRevenue,
        averageOrderValue,
        revenuePerVisitor,
        netIncome,
        monthlyGrowth,
        'USD', 
        trend
      );

            return revenueSummary;
    } catch (error) {
            throw error;
    }
  }

  private calculateTotalRevenue(transactions: any[]): number {
    return transactions.reduce((sum, transaction) => {
      return sum + (transaction.amount || 0);
    }, 0);
  }

  private calculateAverageOrderValue(transactions: any[]): number {
    if (transactions.length === 0) return 0;
    return this.calculateTotalRevenue(transactions) / transactions.length;
  }

  private calculateRevenuePerVisitor(totalRevenue: number, visitors: any[]): number {
    if (visitors.length === 0) return 0;
    return totalRevenue / visitors.length;
  }

  private calculateNetIncome(totalRevenue: number): number {
    
    const operatingExpenses = totalRevenue * 0.2;
    return totalRevenue - operatingExpenses;
  }

  private async calculateMonthlyGrowth(): Promise<number> {
    try {
      const currentMonth = new Date();
      const lastMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
      const currentMonthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);

      const { data: currentMonthData } = await this._supabase
        .from('transaction_log')
        .select('amount')
        .eq('payment_status', 'succeeded')
        .gte('created_at', currentMonthStart.toISOString());

      const { data: lastMonthData } = await this._supabase
        .from('transaction_log')
        .select('amount')
        .eq('payment_status', 'succeeded')
        .gte('created_at', lastMonth.toISOString())
        .lt('created_at', currentMonthStart.toISOString());

      const currentRevenue = this.calculateTotalRevenue(currentMonthData || []);
      const lastRevenue = this.calculateTotalRevenue(lastMonthData || []);

      if (lastRevenue === 0) return 0;
      
      return ((currentRevenue - lastRevenue) / lastRevenue) * 100;
    } catch (error) {
            return 0;
    }
  }

  private async calculateTrend(transactions: any[]): Promise<TrendDataPoint[]> {
    try {
      
      const last7Days = this.getLast7Days();
      const trendMap = new Map<string, number>();

      last7Days.forEach(date => {
        trendMap.set(date.toISOString().split('T')[0], 0);
      });

      transactions.forEach(transaction => {
        const date = new Date(transaction.created_at);
        const dateKey = date.toISOString().split('T')[0];
        if (trendMap.has(dateKey)) {
          trendMap.set(dateKey, (trendMap.get(dateKey) || 0) + (transaction.amount || 0));
        }
      });

      return Array.from(trendMap.entries()).map(([date, value]) => ({
        timestamp: new Date(date),
        value
      })).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    } catch (error) {
            return [];
    }
  }

  async getRevenueTrend(startDate: Date, endDate: Date, interval: string): Promise<TrendDataPoint[]> {
    try {
      const startDateStr = startDate.toISOString();
      const endDateStr = endDate.toISOString();

      const { data, error } = await this._supabase
        .from('transactions')
        .select('created_at, amount')
        .gte('created_at', startDateStr)
        .lte('created_at', endDateStr)
        .eq('status', 'completed');

      if (error) {
        this._logger.error('Failed to fetch revenue trend data', error);
        return [];
      }

      // Group by interval
      const trendMap = new Map<string, number>();

      (data || []).forEach(item => {
        let key: string;
        const date = new Date(item.created_at);

        switch (interval) {
          case 'hour':
            key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}-${date.getHours()}`;
            break;
          case 'day':
            key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
            break;
          case 'week':
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            key = `${weekStart.getFullYear()}-${weekStart.getMonth() + 1}-${weekStart.getDate()}`;
            break;
          case 'month':
            key = `${date.getFullYear()}-${date.getMonth() + 1}`;
            break;
          default:
            key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
        }

        trendMap.set(key, (trendMap.get(key) || 0) + item.amount);
      });

      return Array.from(trendMap.entries()).map(([date, value]) => ({
        timestamp: new Date(date),
        value
      })).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    } catch (error) {
      this._logger.error('Failed to fetch revenue trend data', error);
      return [];
    }
  }

  private getLast30DaysDate(): string {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString();
  }

  private getLast7Days(): Date[] {
    const days: Date[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date);
    }
    return days;
  }
}
