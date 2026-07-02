/**
  * Merges Tailwind class names safely using clsx and tailwind-merge equivalent behavior.
  * We will import full package libraries once npm install finishes.
  */
export function cn(...inputs: (string | undefined | null | boolean | { [key: string]: boolean })[]): string {
  return inputs
    .filter(Boolean)
    .map(String)
    .join(' ')
    .trim();
}

/**
 * Formats a number to currency.
 */
export function formatCurrency(amount: number, currency = 'PKR', locale = 'en-PK'): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(amount);
  } catch (_err) {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

/**
 * Capitalizes the first letter of a string.
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
