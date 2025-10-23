import { Result } from '../../../../shared/result/result';
import { PaymentError } from '../../domain/errors/payment.error';

/**
 * Payment Storage Port
 * 
 * Generic database storage interface (not tied to Supabase, PostgreSQL, MongoDB, etc.)
 * Defines the contract for raw data persistence operations
 */
export interface PaymentStoragePort {
  insert(data: PaymentStorageData): Promise<Result<PaymentStorageData, PaymentError>>;
  findById(id: string): Promise<Result<PaymentStorageData | null, PaymentError>>;
  findByUserId(userId: string): Promise<Result<PaymentStorageData[], PaymentError>>;
  findByProductId(productId: string): Promise<Result<PaymentStorageData[], PaymentError>>;
}

/**
 * Payment Storage Data
 * 
 * Raw data structure for database storage
 * Uses snake_case naming convention for database compatibility
 */
export interface PaymentStorageData {
  id: string;
  user_id: string;
  product_id: string;
  app_id?: string; // APP123 from query params
  amount: number;
  currency: string;
  status: string;
  provider_intent_id: string;
  created_at: string;
  updated_at: string;
}
