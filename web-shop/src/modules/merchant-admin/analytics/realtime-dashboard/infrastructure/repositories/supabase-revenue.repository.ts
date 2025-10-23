import { injectable, inject } from 'inversify';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { RevenueRepositoryPort } from '../../application/ports/revenue-repository.port';
import { RevenueSummary } from '../../domain/entities/revenue-summary.entity';
import { ROOT_TYPES } from '../../../../../../infrastructure/bootstrap/types';
import type { Logger } from '../../../../../../application/ports/logger.port';
import { TrendDataPoint } from '../../domain/types/trend.types';

/**
 * Supabase Revenue Repository Implementation
 * 
 * Infrastructure implementation of RevenueRepositoryPort using Supabase
 * Handles revenue analytics operations through Supabase API
 */
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
      this._logger.info('[SupabaseRevenueRepository] Loading revenue summary');

      // Получаем данные о доходах из таблицы транзакций
      const { data: transactions, error: transactionsError } = await this._supabase
        .from('transaction log')
        .select('amount, created_at, payment_status')
        .eq('payment_status', 'succeeded')
        .gte('created_at', this.getLast30DaysDate());

      if (transactionsError) {
        this._logger.error('[SupabaseRevenueRepository] Failed to load transactions', { 
          error: transactionsError
        });
        throw new Error(`Failed to load transactions: ${transactionsError.message}`);
      }

      // Получаем данные о посетителях для расчета revenue per visitor
      const { data: visitors, error: visitorsError } = await this._supabase
        .from('user_sessions')
        .select('user_id, created_at')
        .gte('created_at', this.getLast30DaysDate());

      if (visitorsError) {
        this._logger.warn('[SupabaseRevenueRepository] Failed to load visitors data', { 
          error: visitorsError
        });
        // Продолжаем без данных о посетителях
      }

      // Вычисляем метрики
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
        'USD', // Можно сделать конфигурируемым
        trend
      );

      this._logger.info('[SupabaseRevenueRepository] Revenue summary loaded', { 
        totalRevenue,
        averageOrderValue,
        revenuePerVisitor,
        netIncome,
        monthlyGrowth
      });

      return revenueSummary;
    } catch (error) {
      this._logger.error('[SupabaseRevenueRepository] Unexpected error loading revenue summary', { 
        error
      });
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
    // Предполагаем 20% операционных расходов
    const operatingExpenses = totalRevenue * 0.2;
    return totalRevenue - operatingExpenses;
  }

  private async calculateMonthlyGrowth(): Promise<number> {
    try {
      const currentMonth = new Date();
      const lastMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
      const currentMonthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);

      // Текущий месяц
      const { data: currentMonthData } = await this._supabase
        .from('transaction log')
        .select('amount')
        .eq('payment_status', 'succeeded')
        .gte('created_at', currentMonthStart.toISOString());

      // Прошлый месяц
      const { data: lastMonthData } = await this._supabase
        .from('transaction log')
        .select('amount')
        .eq('payment_status', 'succeeded')
        .gte('created_at', lastMonth.toISOString())
        .lt('created_at', currentMonthStart.toISOString());

      const currentRevenue = this.calculateTotalRevenue(currentMonthData || []);
      const lastRevenue = this.calculateTotalRevenue(lastMonthData || []);

      if (lastRevenue === 0) return 0;
      
      return ((currentRevenue - lastRevenue) / lastRevenue) * 100;
    } catch (error) {
      this._logger.warn('[SupabaseRevenueRepository] Failed to calculate monthly growth', { error });
      return 0;
    }
  }

  private async calculateTrend(transactions: any[]): Promise<TrendDataPoint[]> {
    try {
      // Группируем транзакции по дням за последние 7 дней
      const last7Days = this.getLast7Days();
      const trendMap = new Map<string, number>();

      // Инициализируем все дни нулевыми значениями
      last7Days.forEach(date => {
        trendMap.set(date.toISOString().split('T')[0], 0);
      });

      // Суммируем транзакции по дням
      transactions.forEach(transaction => {
        const date = new Date(transaction.created_at);
        const dateKey = date.toISOString().split('T')[0];
        if (trendMap.has(dateKey)) {
          trendMap.set(dateKey, (trendMap.get(dateKey) || 0) + (transaction.amount || 0));
        }
      });

      // Преобразуем в массив TrendDataPoint
      return Array.from(trendMap.entries()).map(([date, value]) => ({
        timestamp: new Date(date),
        value
      })).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    } catch (error) {
      this._logger.warn('[SupabaseRevenueRepository] Failed to calculate trend', { error });
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
