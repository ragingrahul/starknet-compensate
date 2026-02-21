import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a raw on-chain token amount (stored as a decimal string with token
 * decimals baked in) into a human-readable number.
 * e.g. "5000000000000000000000" with 18 decimals → "5,000"
 */
export function formatTokenAmount(raw: string, decimals = 18): string {
  try {
    const value = BigInt(raw);
    const divisor = 10n ** BigInt(decimals);
    const whole = value / divisor;
    const fractional = value % divisor;
    const fractStr = fractional.toString().padStart(decimals, "0").slice(0, 2);
    const wholeFormatted = whole.toLocaleString();
    return fractStr === "00"
      ? wholeFormatted
      : `${wholeFormatted}.${fractStr}`;
  } catch {
    return raw;
  }
}
