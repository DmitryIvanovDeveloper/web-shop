
export function stringToDeterministicUuid(value: string): string {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) - hash) + value.charCodeAt(index);
    hash |= 0;
  }

  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  const prefix = hex.substring(0, 8);
  const middle = hex.substring(0, 4);
  const variant = ((parseInt(hex.substring(0, 1), 16) & 0x3) | 0x8).toString(16);
  const third = `4${hex.substring(1, 4)}`;
  const suffixSource = value
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0).toString(16), '');
  const suffix = `${variant}${hex.substring(1, 4)}-${suffixSource.substring(0, 12).padEnd(12, '0')}`;

  return `${prefix}-${middle}-${third}-${suffix}`;
}


