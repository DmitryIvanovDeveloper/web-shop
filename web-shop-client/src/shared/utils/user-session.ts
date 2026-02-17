


export function getCurrentUserId(): string {
  if (typeof window === 'undefined') {
        return '';
  }
  
    const userId = localStorage.getItem('user_id');
  
    return userId ?? '';
}


export function clearUserSession(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('temp_user_id');
  }
}


export function setUserId(userId: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('temp_user_id', userId);
  }
}
