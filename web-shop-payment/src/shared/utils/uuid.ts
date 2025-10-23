/**
 * UUID Generation Utility
 * 
 * Provides cross-platform UUID generation that works in both Node.js and browser environments
 */

/**
 * Generate a UUID v4 string
 * Works in both Node.js and browser environments
 */
export function generateUUID(): string {
  // Check if crypto.randomUUID is available (Node.js 14.17+ or modern browsers)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback for older environments
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
