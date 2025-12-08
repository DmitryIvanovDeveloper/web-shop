/**
 * Payment Module DI Types
 * 
 * Defines injection tokens for the Payments module
 * Uses Symbol.for() for consistent token generation
 */

export const PAYMENT_TYPES = {
  // Ports (Application Layer)
  PaymentRepository: Symbol.for('Payments.PaymentRepository'),
  PaymentStorage: Symbol.for('Payments.PaymentStorage'),
  PaymentService: Symbol.for('Payments.PaymentService'),
  PaymentProductRepository: Symbol.for('Payments.PaymentProductRepository'),
  
  // Use Cases (Application Layer)
  CreatePaymentIntentUseCase: Symbol.for('Payments.CreatePaymentIntentUseCase'),
  ConfirmPaymentUseCase: Symbol.for('Payments.ConfirmPaymentUseCase'),
  SavePaymentTransactionUseCase: Symbol.for('Payments.SavePaymentTransactionUseCase'),
  LoadPaymentProductUseCase: Symbol.for('Payments.LoadPaymentProductUseCase'),
  
  // Application Services
  WebhookService: Symbol.for('Payments.WebhookService'),
  
  // Presenters (Interface Adapters)
  PaymentPresenter: Symbol.for('Payments.PaymentPresenter'),
  
  // Handlers (Interface Adapters)
  ProductSelectedForPaymentHandler: Symbol.for('Payments.ProductSelectedForPaymentHandler'),
  PaymentWebhookHandler: Symbol.for('Payments.PaymentWebhookHandler')
};
