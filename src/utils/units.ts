/**
 * Utility functions for unit conversion
 */

/**
 * Converts an amount from a human-readable format to wei (or equivalent smallest unit)
 * @param amount - Amount in human-readable format
 * @param decimals - Number of decimals
 * @returns Amount in smallest unit as bigint
 */
export function parseUnits(amount: string, decimals: number): bigint {
  // Split the amount into integer and fractional parts
  const [integerPart, fractionalPart = ""] = amount.split(".");

  // Pad or truncate the fractional part to the correct number of decimals
  const paddedFractionalPart = fractionalPart
    .padEnd(decimals, "0")
    .slice(0, decimals);

  // Combine parts and convert to bigint
  const combinedAmount = `${integerPart}${paddedFractionalPart}`;
  return BigInt(combinedAmount);
}

/**
 * Converts an amount from wei (or equivalent smallest unit) to a human-readable format
 * @param amount - Amount in smallest unit
 * @param decimals - Number of decimals
 * @returns Amount in human-readable format
 */
export function formatUnits(amount: bigint, decimals: number): string {
  // Convert to string with padding
  let amountStr = amount.toString().padStart(decimals + 1, "0");

  // Split into integer and fractional parts
  const integerPart = amountStr.slice(0, amountStr.length - decimals) || "0";
  const fractionalPart = amountStr.slice(amountStr.length - decimals);

  // Trim trailing zeros from fractional part
  const trimmedFractionalPart = fractionalPart.replace(/0+$/, "");

  // Return formatted amount
  return trimmedFractionalPart
    ? `${integerPart}.${trimmedFractionalPart}`
    : integerPart;
}

/**
 * Converts ether to wei
 * @param ether - Amount in ether
 * @returns Amount in wei as bigint
 */
export function parseEther(ether: string): bigint {
  return parseUnits(ether, 18);
}

/**
 * Converts wei to ether
 * @param wei - Amount in wei
 * @returns Amount in ether
 */
export function formatEther(wei: bigint): string {
  return formatUnits(wei, 18);
}
