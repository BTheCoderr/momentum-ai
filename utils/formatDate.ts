/**
 * Safely calculates percentage, preventing NaN values that cause CoreGraphics errors
 */
export const safePercentage = (value: number | undefined | null, total: number | undefined | null): number => {
  const safeValue = typeof value === 'number' && !isNaN(value) ? value : 0;
  const safeTotal = typeof total === 'number' && !isNaN(total) && total > 0 ? total : 1;
  const percentage = (safeValue / safeTotal) * 100;
  return Math.min(100, Math.max(0, percentage));
};

/**
 * Safely formats percentage as string for React Native styles
 */
export const safePercentageString = (value: number | undefined | null, total: number | undefined | null): string => {
  return `${safePercentage(value, total)}%`;
};

/**
 * Safely handles dimension calculations to prevent NaN
 */
export const safeDimension = (value: number | undefined | null, fallback: number = 0): number => {
  return typeof value === 'number' && !isNaN(value) ? value : fallback;
}; 