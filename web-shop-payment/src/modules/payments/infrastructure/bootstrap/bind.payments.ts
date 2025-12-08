import { Container } from 'inversify';
import { PaymentRepositoryPort } from '../../application/ports/payment-repository.port';
import { PaymentStoragePort } from '../../application/ports/payment-storage.port';
import { PaymentServicePort } from '../../application/ports/payment-service.port';
import { PaymentRepository } from '../repositories/payment.repository';
import { SupabasePaymentStorage } from '../storages/supabase-payment.storage';
import { StripePaymentService } from '../services/stripe-payment.service';
import { MockPaymentService } from '../services/mock-payment.service';
import { CreatePaymentIntentUseCase } from '../../application/use-cases/create-payment-intent.use-case';
import { ConfirmPaymentUseCase } from '../../application/use-cases/confirm-payment.use-case';
import { SavePaymentTransactionUseCase } from '../../application/use-cases/save-payment-transaction.use-case';
import { LoadPaymentProductUseCase } from '../../application/use-cases/load-payment-product.use-case';
import { WebhookService } from '../../application/services/webhook.service';
import { PaymentPresenter } from '../../interface-adapters/presenters/payment.presenter';
import { PaymentWebhookHandler } from '../../interface-adapters/handlers/payment-webhook.handler';
import { IAsyncEventHandler } from '../../../../infrastructure/events/events-handler.plugin';
import { PaymentConfirmedEvent } from '../../../../shared/events/payment-events';
import { PAYMENT_TYPES } from './types';
import { PaymentProductRepositoryPort } from '../../application/ports/payment-product.repository.port';
import { PaymentProductHttpRepository } from '../repositories/payment-product-http.repository';

/**
 * Bind Payments Module Dependencies
 * 
 * Configures DI container for Payments module
 * Follows Clean Architecture dependency rules
 */
export function bindPayments(container: Container): void {
  // ============= Infrastructure Layer =============
  
  // Storage (Infrastructure) - Supabase implementation for Payment Service
  // Payment Service saves to Supabase for persistent storage
  container
    .bind<PaymentStoragePort>(PAYMENT_TYPES.PaymentStorage)
    .to(SupabasePaymentStorage)
    .inSingletonScope();

  // Repository (Infrastructure) - uses PaymentStoragePort
  container
    .bind<PaymentRepositoryPort>(PAYMENT_TYPES.PaymentRepository)
    .to(PaymentRepository)
    .inSingletonScope();

  container
    .bind<PaymentProductRepositoryPort>(PAYMENT_TYPES.PaymentProductRepository)
    .to(PaymentProductHttpRepository)
    .inSingletonScope();

  // Payment Service (Infrastructure) - Stripe implementation
  container
    .bind<PaymentServicePort>(PAYMENT_TYPES.PaymentService)
    .to(StripePaymentService)
    .inSingletonScope();

  // ============= Application Layer =============
  
  // Use Cases (Application)
  container
    .bind<CreatePaymentIntentUseCase>(PAYMENT_TYPES.CreatePaymentIntentUseCase)
    .to(CreatePaymentIntentUseCase);

  container
    .bind<ConfirmPaymentUseCase>(PAYMENT_TYPES.ConfirmPaymentUseCase)
    .to(ConfirmPaymentUseCase);

  container
    .bind<SavePaymentTransactionUseCase>(PAYMENT_TYPES.SavePaymentTransactionUseCase)
    .to(SavePaymentTransactionUseCase);

  container
    .bind<LoadPaymentProductUseCase>(PAYMENT_TYPES.LoadPaymentProductUseCase)
    .to(LoadPaymentProductUseCase);

  // Application Services (exports functionality for webhooks and other modules)
  container
    .bind<WebhookService>(PAYMENT_TYPES.WebhookService)
    .to(WebhookService)
    .inSingletonScope();

  // ============= Interface Adapters Layer =============
  
  // Presenter (Interface Adapters) - Singleton to maintain state
  container
    .bind<PaymentPresenter>(PAYMENT_TYPES.PaymentPresenter)
    .to(PaymentPresenter)
    .inSingletonScope();

  // Event Handlers (Interface Adapters) - ENABLED for Payment Service
  // Payment Service saves to database to prevent data loss
  // Main Client can also listen to events for real-time updates
  container
    .bind<IAsyncEventHandler<PaymentConfirmedEvent>>(Symbol.for(`IAsyncEventHandler<PaymentConfirmedEvent>`))
    .to(PaymentWebhookHandler)
    .inTransientScope();
}
