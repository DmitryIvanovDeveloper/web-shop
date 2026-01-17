import { Logger } from '../../application/ports/logger.port';

export class ConsoleLogger implements Logger {
  info(message: string, context?: any): void {
  }

  warn(message: string, context?: any): void {
  }

  error(message: string, context?: any): void {
  }

  debug(message: string, context?: any): void {
  }
}

