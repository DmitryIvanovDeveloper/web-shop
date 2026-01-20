

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class InvalidAppIdError extends AuthenticationError {
  constructor(appId: string) {
    super(`Invalid app ID: ${appId}`);
    this.name = 'InvalidAppIdError';
  }
}

export class UserNotFoundError extends AuthenticationError {
  constructor(appId: string) {
    super(`User not found for app ID: ${appId}`);
    this.name = 'UserNotFoundError';
  }
}

export class AppIdRequiredError extends AuthenticationError {
  constructor() {
    super('App ID is required');
    this.name = 'AppIdRequiredError';
  }
}
