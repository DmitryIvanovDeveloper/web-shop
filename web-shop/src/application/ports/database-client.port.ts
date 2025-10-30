/**
 * Database Client Port - Interface for database operations
 * 
 * Generic interface for database client that can be implemented
 * by different providers (Supabase, PostgreSQL, etc.)
 * All modules use this interface for database operations
 */

export interface DatabaseClientPort {
  /**
   * Start a query on a table
   * Returns Supabase-like query builder
   */
  from(table: string): any;
  
  /**
   * Get underlying client instance if needed for advanced operations
   */
  getClient(): any;
}

