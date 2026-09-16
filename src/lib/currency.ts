/**
 * Centralized currency formatting utility for Nanami Kitchen.
 * Defaults to "N$" (Namibia Dollar, requirement O4).
 */

let cachedCurrencySymbol = "N$";

export function setCurrencySymbol(symbol: string) {
  if (symbol && symbol.trim()) {
    cachedCurrencySymbol = symbol.trim();
  }
}

export function getCurrencySymbol(): string {
  return cachedCurrencySymbol;
}

export function formatCurrency(amount: number, overrideSymbol?: string): string {
  const symbol = overrideSymbol || cachedCurrencySymbol;
  const num = typeof amount === "number" && !isNaN(amount) ? amount : 0;
  return `${symbol} ${Math.round(num).toLocaleString("en-ZA")}`;
}
