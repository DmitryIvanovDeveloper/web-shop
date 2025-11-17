import { injectable, inject } from 'inversify';
import { ROOT_TYPES } from '../../../../infrastructure/bootstrap/types';
import { PAYMENT_TYPES } from '../../infrastructure/bootstrap/types';
import type { Logger } from '../../../../application/ports/logger.port';
import type { RealtimeClientPort, RealtimeMessage } from '../../../../application/ports/realtime-client.port';
import { PaymentStorageData } from '../../application/ports/payment-storage.port';

/**
 * Payment Realtime Presenter
 * 
 * Subscribes to real-time transaction_log updates
 * Respects RLS policies (users see only their transactions)
 */
@injectable()
export class PaymentRealtimePresenter {
  private _isSubscribed: boolean = false;
  private _listeners: Set<(transaction: PaymentStorageData) => void> = new Set();

  constructor(
    @inject(ROOT_TYPES.Logger)
    private readonly _logger: Logger,
    @inject(ROOT_TYPES.RealtimeClient)
    private readonly _realtimeClient: RealtimeClientPort
  ) {}

  /**
   * Start listening to transaction_log changes
   * With RLS: user will only receive their own transactions
   */
  public async startListening(userId?: string): Promise<void> {
    if (this._isSubscribed) {
      this._logger.info('[PaymentRealtimePresenter] Already subscribed');
      return;
    }

    try {
      // Connect to Realtime (with anon key + RLS)
      await this._realtimeClient.connect();

      // Subscribe to transaction_log table
      // RLS will filter events based on user_id
      this._realtimeClient.subscribe<PaymentStorageData>(
        'transaction_log',
        (message: RealtimeMessage<PaymentStorageData>) => {
          this._handleRealtimeMessage(message, userId);
        }
      );

      this._isSubscribed = true;
      this._logger.info('[PaymentRealtimePresenter] Started listening to transaction_log', { 
        userId,
        hasRLS: true 
      });
    } catch (error) {
      this._logger.error('[PaymentRealtimePresenter] Failed to start listening', { 
        error,
        userId 
      });
      throw error;
    }
  }

  /**
   * Stop listening to updates
   */
  public async stopListening(): Promise<void> {
    if (!this._isSubscribed) {
      return;
    }

    try {
      this._realtimeClient.unsubscribe('transaction_log');
      await this._realtimeClient.disconnect();
      
      this._isSubscribed = false;
      this._listeners.clear();
      
      this._logger.info('[PaymentRealtimePresenter] Stopped listening to transaction_log');
    } catch (error) {
      this._logger.error('[PaymentRealtimePresenter] Failed to stop listening', { error });
      throw error;
    }
  }

  /**
   * Subscribe to transaction updates
   * 
   * @param callback - Called when new transaction received (respecting RLS)
   * @returns Unsubscribe function
   */
  public onTransactionUpdate(callback: (transaction: PaymentStorageData) => void): () => void {
    this._listeners.add(callback);
    
    this._logger.info('[PaymentRealtimePresenter] Added transaction listener', {
      totalListeners: this._listeners.size
    });

    // Return unsubscribe function
    return () => {
      this._listeners.delete(callback);
      this._logger.info('[PaymentRealtimePresenter] Removed transaction listener', {
        totalListeners: this._listeners.size
      });
    };
  }

  /**
   * Handle incoming Realtime message
   * RLS ensures we only receive transactions allowed by policies
   */
  private _handleRealtimeMessage(
    message: RealtimeMessage<PaymentStorageData>,
    userId?: string
  ): void {
    this._logger.info('[PaymentRealtimePresenter] Received realtime update', {
      event: message.event,
      transactionId: message.data.id,
      userId: message.data.user_id,
      timestamp: message.timestamp
    });

    // Additional client-side validation (belt and suspenders)
    if (userId && message.data.user_id !== userId) {
      this._logger.warn('[PaymentRealtimePresenter] Received transaction for different user (RLS leak?)', {
        expectedUserId: userId,
        receivedUserId: message.data.user_id
      });
      return;
    }

    // Notify all listeners
    this._listeners.forEach(listener => {
      try {
        listener(message.data);
      } catch (error) {
        this._logger.error('[PaymentRealtimePresenter] Error in listener callback', { error });
      }
    });

    // Log event type for debugging
    switch (message.event) {
      case 'INSERT':
        this._logger.info('[PaymentRealtimePresenter] New transaction inserted', {
          transactionId: message.data.id
        });
        break;
      case 'UPDATE':
        this._logger.info('[PaymentRealtimePresenter] Transaction updated', {
          transactionId: message.data.id
        });
        break;
      case 'DELETE':
        this._logger.info('[PaymentRealtimePresenter] Transaction deleted', {
          transactionId: message.data.id
        });
        break;
    }
  }

  /**
   * Check if currently subscribed
   */
  public get isSubscribed(): boolean {
    return this._isSubscribed;
  }

  /**
   * Get number of active listeners
   */
  public get listenerCount(): number {
    return this._listeners.size;
  }
}
















