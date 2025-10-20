export class OffersDomainError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'OffersDomainError';
  }
}

export class InvalidRuleError extends OffersDomainError {
  constructor(message: string) {
    super(message, 'INVALID_RULE');
  }
}

export class OfferNotFoundError extends OffersDomainError {
  constructor(offerId: string) {
    super(`Offer with id '${offerId}' not found`, 'OFFER_NOT_FOUND');
  }
}

export class EvaluationError extends OffersDomainError {
  constructor(message: string) {
    super(message, 'EVALUATION_ERROR');
  }
}
