/**
 * Czech number formatting utilities.
 * Thousand separator: space (non-breaking)
 * Decimal separator: comma
 */

export function formatCZK(value: number, decimals = 0): string {
  if (!isFinite(value)) return '—';
  return value.toLocaleString('cs-CZ', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatPercent(value: number, decimals = 2): string {
  if (!isFinite(value)) return '—';
  return value.toLocaleString('cs-CZ', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Parse a Czech-formatted number string back to a JS number.
 * Accepts both "1 234,56" and "1234.56" inputs.
 */
export function parseCzechNumber(text: string): number {
  // Remove non-breaking and regular spaces (thousand separators)
  const cleaned = text
    .replace(/\u00a0/g, '')
    .replace(/\s/g, '')
    .replace(',', '.');
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}
