// Simple container implementation for dependency injection
class Container {
  private services = new Map<symbol, any>();

  register<T>(token: symbol, factory: () => T): void {
    this.services.set(token, factory);
  }

  resolve<T>(token: symbol): T {
    const factory = this.services.get(token);
    if (!factory) {
      throw new Error(`Service not registered for token: ${token.toString()}`);
    }
    return factory();
  }
}

export const container = new Container();