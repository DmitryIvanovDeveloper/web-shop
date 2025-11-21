/**
 * Generates a unique element ID using UUID v4 with a type prefix
 * Format: {type}-{uuid-v4}
 * Example: button-a1b2c3d4-e5f6-7890-abcd-ef1234567890
 */
export function generateElementId(type: string): string {
  if (typeof crypto === 'undefined' || !crypto.randomUUID) {
    // Fallback for environments without crypto.randomUUID
    // Generate a simple UUID-like string
    const chars = '0123456789abcdef';
    const segments = [8, 4, 4, 4, 12];
    const uuid = segments
      .map((len) => {
        let segment = '';
        for (let i = 0; i < len; i++) {
          segment += chars[Math.floor(Math.random() * chars.length)];
        }
        return segment;
      })
      .join('-');
    return `${type}-${uuid}`;
  }

  const uuid = crypto.randomUUID();
  return `${type}-${uuid}`;
}
