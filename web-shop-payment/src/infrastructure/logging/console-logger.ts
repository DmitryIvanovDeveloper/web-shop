import { injectable } from 'inversify';
import { Logger } from '../../application/ports/logger.port';

/**
 * Console Logger implementation
 * Simple console-based logging for development
 */
@injectable()
export class ConsoleLogger implements Logger {
  info(message: string, meta?: any): void {
    console.log(`[INFO] ${message}`, meta || '');
  }

  error(message: string, error?: Error | any): void {
    console.error(`[ERROR] ${message}`, error || '');
  }

  warn(message: string, meta?: any): void {
    console.warn(`[WARN] ${message}`, meta || '');
  }

  debug(message: string, meta?: any): void {
    console.debug(`[DEBUG] ${message}`, meta || '');
  }
}
