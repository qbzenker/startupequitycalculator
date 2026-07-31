const wholeCurrencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const shareFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

const ownershipFormatter = new Intl.NumberFormat("en-US", {
  style: "percent",
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
});

export function formatCurrency(value: number): string {
  return wholeCurrencyFormatter.format(value);
}

export function formatCompactCurrency(value: number): string {
  const maximumFractionDigits = Math.abs(value) >= 1_000_000 ? 2 : 1;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    minimumFractionDigits: 0,
    maximumFractionDigits,
  }).format(value);
}

export function formatShares(value: number): string {
  return shareFormatter.format(value);
}

export function formatOwnership(value: number): string {
  return ownershipFormatter.format(value);
}
