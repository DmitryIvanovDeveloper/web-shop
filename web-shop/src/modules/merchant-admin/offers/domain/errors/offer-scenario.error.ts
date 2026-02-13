export class OfferScenarioConfigurationError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'OfferScenarioConfigurationError';
    Object.setPrototypeOf(this, OfferScenarioConfigurationError.prototype);
  }
}

export class OfferScenarioValidationError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'OfferScenarioValidationError';
    Object.setPrototypeOf(this, OfferScenarioValidationError.prototype);
  }
}






