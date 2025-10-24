import { injectable, inject } from 'inversify';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Result, Success, Failure, isFailure } from '../../../../shared/result/result';
import { PaymentStoragePort, PaymentStorageData } from '../../application/ports/payment-storage.port';
import { Payment } from '../../domain/entities/payment.entity';
import { PaymentError, PaymentErrorCode, TransactionSaveError } from '../../domain/errors/payment.error';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';
import type { Logger } from '../../../../application/ports/logger.port';

/**
 * Supabase Payment Storage Implementation
 * 
 * Infrastructure implementation of PaymentStoragePort using Supabase
 * Handles raw database operations for payment data
 */
@injectable()
export class SupabasePaymentStorage implements PaymentStoragePort {
  private static supabase: SupabaseClient | null = null;

  constructor(
    @inject(ROOT_TYPES.Logger)
    private readonly _logger: Logger
  ) {
    // Создаем Supabase клиент только один раз (синглтон)
    if (!SupabasePaymentStorage.supabase) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        const errorMsg = 'supabaseUrl and supabaseKey are required. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.';
        this._logger.error('[SupabasePaymentStorage] ' + errorMsg);
        throw new Error(errorMsg);
      }

      SupabasePaymentStorage.supabase = createClient(supabaseUrl, supabaseKey);
      this._logger.info('[SupabasePaymentStorage] Supabase client created');
    }
  }

  private get supabase(): SupabaseClient {
    if (!SupabasePaymentStorage.supabase) {
      throw new Error('Supabase client not initialized');
    }
    return SupabasePaymentStorage.supabase;
  }

  public async save(payment: Payment): Promise<void> {
    try {
      this._logger.info('[SupabasePaymentStorage] Saving payment data', { 
        paymentId: payment.id, 
        userId: payment.userId, 
        productId: payment.productId 
      });

      // Convert Payment to transaction log format
      const storageData = {
        id: payment.id,
        user_id: payment.userId, // TEXT -> UUID (Supabase will handle conversion)
        product_id: payment.productId, // TEXT -> UUID (Supabase will handle conversion)
        paid_amount: payment.amount,
        stripe_payment_intent_id: payment.providerIntentId,
        payment_status: payment.status,
        payment_method: 'stripe', // Default payment method
        created_at: payment.createdAt.toISOString(),
        updated_at: payment.updatedAt.toISOString()
      };

      // Convert back to PaymentStorageData format for insert method
      const paymentStorageData: PaymentStorageData = {
        id: payment.id,
        user_id: payment.userId,
        product_id: payment.productId,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        provider_intent_id: payment.providerIntentId,
        created_at: payment.createdAt.toISOString(),
        updated_at: payment.updatedAt.toISOString()
      };

      await this.insert(paymentStorageData);
    } catch (error) {
      this._logger.error('[SupabasePaymentStorage] Unexpected error saving payment', { 
        error, 
        paymentId: payment.id 
      });
      throw error;
    }
  }

  public async insert(data: PaymentStorageData): Promise<Result<PaymentStorageData, PaymentError>> {
    try {
      this._logger.info('[SupabasePaymentStorage] Inserting payment data', { 
        id: data.id,
        userId: data.user_id,
        productId: data.product_id
      });

      // Convert PaymentStorageData to transaction log format
      const transactionLogData = {
        id: data.id,
        user_id: data.user_id, // user-003
        product_id: data.product_id, // tank-turret
        app_id: data.app_id || null, // APP123 (if available)
        merchant_id: null, // Not provided in query params
        paid_amount: data.amount, // 99.99
        stripe_payment_intent_id: data.provider_intent_id,
        payment_status: data.status,
        payment_method: 'stripe',
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      const { data: insertedData, error } = await this.supabase
        .from('transaction_log')
        .insert(transactionLogData)
        .select()
        .single();

      if (error) {
        this._logger.error('[SupabasePaymentStorage] Failed to insert payment', { 
          error: error.message,
          code: error.code,
          details: error.details
        });
        return Failure.fail(new TransactionSaveError());
      }

      this._logger.info('[SupabasePaymentStorage] Payment data inserted successfully', { 
        id: insertedData.id
      });

      return Success.ok(insertedData);
    } catch (error) {
      this._logger.error('[SupabasePaymentStorage] Unexpected error inserting payment', { 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return Failure.fail(new TransactionSaveError(error instanceof Error ? error : undefined));
    }
  }

  public async findById(id: string): Promise<Result<PaymentStorageData | null, PaymentError>> {
    try {
      this._logger.info('[SupabasePaymentStorage] Finding payment by id', { id });

      const { data, error } = await this.supabase
        .from('transaction_log')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          this._logger.info('[SupabasePaymentStorage] Payment not found', { id });
          return Success.ok(null);
        }
        
        this._logger.error('[SupabasePaymentStorage] Failed to find payment', { 
          error: error.message,
          code: error.code
        });
        return Failure.fail(new PaymentError(
          'Failed to find payment',
          PaymentErrorCode.PAYMENT_NOT_FOUND
        ));
      }

      this._logger.info('[SupabasePaymentStorage] Payment found successfully', { id });
      return Success.ok(data);
    } catch (error) {
      this._logger.error('[SupabasePaymentStorage] Unexpected error finding payment', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        id
      });
      return Failure.fail(new PaymentError(
        'Unexpected error finding payment',
        PaymentErrorCode.DATABASE_CONNECTION_ERROR,
        error instanceof Error ? error : undefined
      ));
    }
  }

  public async findByUserId(userId: string): Promise<Result<PaymentStorageData[], PaymentError>> {
    try {
      this._logger.info('[SupabasePaymentStorage] Finding payments by user id', { userId });

      const { data, error } = await this.supabase
        .from('transaction_log')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        this._logger.error('[SupabasePaymentStorage] Failed to find payments by user', { 
          error: error.message,
          userId
        });
        return Failure.fail(new PaymentError(
          'Failed to find payments by user',
          PaymentErrorCode.DATABASE_CONNECTION_ERROR
        ));
      }

      this._logger.info('[SupabasePaymentStorage] Found payments for user', { 
        userId,
        count: data?.length || 0
      });

      return Success.ok(data || []);
    } catch (error) {
      this._logger.error('[SupabasePaymentStorage] Unexpected error finding payments by user', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        userId
      });
      return Failure.fail(new PaymentError(
        'Unexpected error finding payments by user',
        PaymentErrorCode.DATABASE_CONNECTION_ERROR,
        error instanceof Error ? error : undefined
      ));
    }
  }

  public async findByProductId(productId: string): Promise<Result<PaymentStorageData[], PaymentError>> {
    try {
      this._logger.info('[SupabasePaymentStorage] Finding payments by product id', { productId });

      const { data, error } = await this.supabase
        .from('transaction_log')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) {
        this._logger.error('[SupabasePaymentStorage] Failed to find payments by product', { 
          error: error.message,
          productId
        });
        return Failure.fail(new PaymentError(
          'Failed to find payments by product',
          PaymentErrorCode.DATABASE_CONNECTION_ERROR
        ));
      }

      this._logger.info('[SupabasePaymentStorage] Found payments for product', { 
        productId,
        count: data?.length || 0
      });

      return Success.ok(data || []);
    } catch (error) {
      this._logger.error('[SupabasePaymentStorage] Unexpected error finding payments by product', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        productId
      });
      return Failure.fail(new PaymentError(
        'Unexpected error finding payments by product',
        PaymentErrorCode.DATABASE_CONNECTION_ERROR,
        error instanceof Error ? error : undefined
      ));
    }
  }

  public async clear(): Promise<void> {
    try {
      this._logger.info('[SupabasePaymentStorage] Clearing all payments');
      
      const { error } = await this.supabase
        .from('transaction_log')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

      if (error) {
        this._logger.error('[SupabasePaymentStorage] Failed to clear payments', { 
          error: error.message 
        });
        throw new Error(`Failed to clear payments: ${error.message}`);
      }

      this._logger.info('[SupabasePaymentStorage] All payments cleared successfully');
    } catch (error) {
      this._logger.error('[SupabasePaymentStorage] Unexpected error clearing payments', { 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  public async getAll(): Promise<PaymentStorageData[]> {
    try {
      this._logger.info('[SupabasePaymentStorage] Getting all payments');

      const { data, error } = await this.supabase
        .from('transaction_log')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        this._logger.error('[SupabasePaymentStorage] Failed to get all payments', { 
          error: error.message 
        });
        throw new Error(`Failed to get all payments: ${error.message}`);
      }

      this._logger.info('[SupabasePaymentStorage] Retrieved all payments', { 
        count: data?.length || 0 
      });

      return data || [];
    } catch (error) {
      this._logger.error('[SupabasePaymentStorage] Unexpected error getting all payments', { 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  public getCount(): number {
    // This is a simplified implementation
    // In a real scenario, you might want to cache this or make it async
    return 0;
  }
}
