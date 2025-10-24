/**
 * User Session Utility
 * 
 * Handles temporary user ID management for purchase tracking
 * Uses localStorage to persist user ID across sessions
 */

/**
 * Get current user ID from localStorage or generate new one
 * 
 * @returns User ID string
 */
export function getCurrentUserId(): string {
  if (typeof window === 'undefined') {
    // Server-side rendering - return empty string
    return '';
  }
  
  // Get userId from localStorage if exists (set after authorization)
  const userId = localStorage.getItem('user_id');
  
  // Return userId or empty string if not authorized
  return userId || '';
}

/**
 * Clear user session (for testing or logout)
 */
export function clearUserSession(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('temp_user_id');
  }
}

/**
 * Set specific user ID (for testing)
 */
export function setUserId(userId: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('temp_user_id', userId);
  }
}
