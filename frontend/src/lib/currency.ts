export interface CurrencyConfig {
  code: string;
  symbol: string;
  position: "prefix" | "suffix";
  decimals: number;
}

export const defaultCurrency: CurrencyConfig = {
  code: "BDT",
  symbol: "৳",
  position: "prefix",
  decimals: 2,
};

export function formatCurrency(
  amount: number,
  config: CurrencyConfig = defaultCurrency,
): string {
  const formattedNumber = amount.toLocaleString("en-BD", {
    minimumFractionDigits: config.decimals,
    maximumFractionDigits: config.decimals,
  });

  return config.position === "prefix"
    ? `${config.symbol}${formattedNumber}`
    : `${formattedNumber} ${config.symbol}`;
}
