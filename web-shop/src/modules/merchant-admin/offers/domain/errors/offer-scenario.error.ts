export class OfferScenarioConfigurationError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'OfferScenarioConfigurationError';
    Object.setPrototypeOf(this, OfferScenarioConfigurationError.prototype);
  }
}

