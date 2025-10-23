/**
 * Logger Port - Interface for logging functionality
 * All modules use this interface for logging
 */

export interface Logger {
  info(message: string, meta?: any): void;
  error(message: string, error?: Error | any): void;
  warn(message: string, meta?: any): void;
  debug(message: string, meta?: any): void;
}
