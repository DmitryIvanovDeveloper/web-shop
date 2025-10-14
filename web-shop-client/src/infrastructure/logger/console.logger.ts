import { Logger } from '../../application/ports/logger.port';

export class ConsoleLogger implements Logger {
  info(message: string, context?: any): void {
    console.log(`[INFO] ${message}`, context || '');
  }

  warn(message: string, context?: any): void {
    console.warn(`[WARN] ${message}`, context || '');
  }

  error(message: string, context?: any): void {
    console.error(`[ERROR] ${message}`, context || '');
  }

  debug(message: string, context?: any): void {
    console.debug(`[DEBUG] ${message}`, context || '');
  }
}

