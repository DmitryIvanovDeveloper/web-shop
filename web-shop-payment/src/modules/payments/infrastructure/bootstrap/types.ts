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
  
  // Use Cases (Application Layer)
  CreatePaymentIntentUseCase: Symbol.for('Payments.CreatePaymentIntentUseCase'),
  ConfirmPaymentUseCase: Symbol.for('Payments.ConfirmPaymentUseCase'),
  SavePaymentTransactionUseCase: Symbol.for('Payments.SavePaymentTransactionUseCase'),
  
  // Presenters (Interface Adapters)
  PaymentPresenter: Symbol.for('Payments.PaymentPresenter'),
  
  // Handlers (Interface Adapters)
  ProductSelectedForPaymentHandler: Symbol.for('Payments.ProductSelectedForPaymentHandler'),
  PaymentWebhookHandler: Symbol.for('Payments.PaymentWebhookHandler')
};
