import { injectable, inject } from 'inversify';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Result, Success, Failure, isFailure } from '../../../../shared/result/result';
import { PaymentStoragePort, PaymentStorageData } from '../../application/ports/payment-storage.port';
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
  private supabase: SupabaseClient;

  constructor(
    @inject(ROOT_TYPES.Logger)
    private readonly _logger: Logger
  ) {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  public async insert(data: PaymentStorageData): Promise<Result<PaymentStorageData, PaymentError>> {
    try {
      this._logger.info('[SupabasePaymentStorage] Inserting payment data', { 
        id: data.id,
        userId: data.user_id,
        productId: data.product_id
      });

      const { data: insertedData, error } = await this.supabase
        .from('payments')
        .insert(data)
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
        .from('payments')
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
        .from('payments')
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
        .from('payments')
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
}
