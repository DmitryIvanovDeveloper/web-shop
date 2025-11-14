export abstract class OfferRuleTreeError extends Error {
  protected constructor(message: string) {
    super(message);
    this.name = 'OfferRuleTreeError';
  }
}

export class OfferRuleTreeBuildError extends OfferRuleTreeError {
  public constructor(message: string) {
    super(message);
    this.name = 'OfferRuleTreeBuildError';
  }
}

export class OfferRuleTreeValidationError extends OfferRuleTreeError {
  public constructor(message: string) {
    super(message);
    this.name = 'OfferRuleTreeValidationError';
  }
}


