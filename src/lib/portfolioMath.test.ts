import { describe, expect, it } from "vitest";
import { calculateHoldingWeight, calculateTotalMarketValue, toFiniteNumber } from "./portfolioMath";

describe("portfolioMath", () => {
  it("normalizes invalid numeric inputs to zero", () => {
    expect(toFiniteNumber(null)).toBe(0);
    expect(toFiniteNumber(undefined)).toBe(0);
    expect(toFiniteNumber("not-a-number")).toBe(0);
    expect(toFiniteNumber(Number.POSITIVE_INFINITY)).toBe(0);
  });

  it("calculates total market value from mixed numeric inputs", () => {
    expect(
      calculateTotalMarketValue([
        { marketValue: 1250 },
        { marketValue: "750.50" },
        { marketValue: null },
      ])
    ).toBe(2000.5);
  });

  it("calculates a holding weight percentage", () => {
    expect(calculateHoldingWeight(250, 1000)).toBe(25);
  });

  it("returns zero holding weight when the portfolio total is not positive", () => {
    expect(calculateHoldingWeight(250, 0)).toBe(0);
    expect(calculateHoldingWeight(250, -1000)).toBe(0);
    expect(calculateHoldingWeight(250, "not-a-number")).toBe(0);
  });

  it("keeps negative market values in the total for liabilities or short exposure", () => {
    expect(
      calculateTotalMarketValue([
        { marketValue: 1000 },
        { marketValue: -250 },
      ])
    ).toBe(750);
  });
});
