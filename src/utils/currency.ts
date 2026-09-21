/**
 * Format amounts into Indian Standard Rupees (INR / ₹)
 * Supports standard Indian numerical grouping: ₹12,34,567 (lakhs, crores)
 */
export function formatINR(amount: number | string, options?: { showPaise?: boolean; compact?: boolean }): string {
  const num = typeof amount === 'string' ? parseFloat(amount) || 0 : amount;
  if (isNaN(num)) return '₹0';

  if (options?.compact) {
    const abs = Math.abs(num);
    const sign = num < 0 ? '-' : '';
    if (abs >= 10000000) {
      // Crores
      return `${sign}₹${(abs / 10000000).toFixed(2)} Cr`;
    } else if (abs >= 100000) {
      // Lakhs
      return `${sign}₹${(abs / 100000).toFixed(2)} L`;
    } else if (abs >= 1000) {
      // Thousands
      return `${sign}₹${(abs / 1000).toFixed(1)}k`;
    }
  }

  const fractionDigits = options?.showPaise ? 2 : 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  }).format(num);
}
