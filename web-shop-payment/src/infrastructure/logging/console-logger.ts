import { injectable } from 'inversify';
import { Logger } from '../../application/ports/logger.port';

/**
 * Console Logger implementation
 * Simple console-based logging for development
 */
@injectable()
export class ConsoleLogger implements Logger {
  info(message: string, meta?: any): void {
  }

  error(message: string, error?: Error | any): void {
  }

  warn(message: string, meta?: any): void {
  }

  debug(message: string, meta?: any): void {
  }
}
