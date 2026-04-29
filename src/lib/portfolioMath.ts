export type PortfolioPosition = {
  marketValue: number | string | null | undefined;
};

export function toFiniteNumber(value: number | string | null | undefined) {
  const numberValue = Number(value ?? 0);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

export function calculateTotalMarketValue(positions: PortfolioPosition[]) {
  return positions.reduce((total, position) => total + toFiniteNumber(position.marketValue), 0);
}

export function calculateHoldingWeight(marketValue: number | string | null | undefined, totalValue: number | string | null | undefined) {
  const total = toFiniteNumber(totalValue);
  if (total <= 0) return 0;

  return (toFiniteNumber(marketValue) / total) * 100;
}
