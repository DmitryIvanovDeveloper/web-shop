export class ProjectNotFoundError extends Error {
  constructor(projectId: string) {
    super(`Project with id ${projectId} not found`);
    this.name = 'ProjectNotFoundError';
  }
}

export class ProjectAlreadyExistsError extends Error {
  constructor(appId: string) {
    super(`Project with app_id ${appId} already exists`);
    this.name = 'ProjectAlreadyExistsError';
  }
}

export class InvalidProjectDataError extends Error {
  constructor(field: string, reason: string) {
    super(`Invalid project data for field ${field}: ${reason}`);
    this.name = 'InvalidProjectDataError';
  }
}

export class MerchantNotFoundError extends Error {
  constructor(merchantId: string) {
    super(`Merchant with id ${merchantId} not found`);
    this.name = 'MerchantNotFoundError';
  }
}