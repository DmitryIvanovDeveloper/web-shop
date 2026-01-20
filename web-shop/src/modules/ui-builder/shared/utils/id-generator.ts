
export function generateElementId(type: string): string {
  if (typeof crypto === 'undefined' || !crypto.randomUUID) {

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

export function generateUuid(): string {
  if (typeof crypto === 'undefined' || !crypto.randomUUID) {

    const chars = '0123456789abcdef';
    const segments = [8, 4, 4, 4, 12];
    return segments
      .map((len) => {
        let segment = '';
        for (let i = 0; i < len; i++) {
          segment += chars[Math.floor(Math.random() * chars.length)];
        }
        return segment;
      })
      .join('-');
  }

  return crypto.randomUUID();
}
