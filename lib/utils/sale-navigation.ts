/**
 * Helper function to generate navigation links for sale numbers
 * @param currentSaleNumber - Current sale number in format "ABC-123-456"
 * @param offset - Offset to apply (+1 for next, -1 for previous)
 * @returns Navigation link path or null if invalid
 */
export function getSaleNavigationLink(currentSaleNumber: string, offset: number): string | null {
  const parts = currentSaleNumber.split('-');
  if (parts.length !== 3) return null;
  
  const prefix = parts[0] + '-' + parts[1] + '-';
  const last = parts[2];
  const num = Number(last);
  
  if (isNaN(num)) return null;
  
  const nextNum = num + offset;
  if (nextNum <= 0) return null;
  
  // Pad with leading zeros to match original length
  const nextStr = nextNum.toString().padStart(last.length, '0');
  return `/${prefix}${nextStr}`;
}