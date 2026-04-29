import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchPortfolioSummary, type PortfolioSummaryResponse } from "./portfolioApi";

const portfolioResponse: PortfolioSummaryResponse = {
  summary: {
    totalValue: 10000,
    cashValue: 1000,
    investedValue: 9000,
    accountCount: 2,
    lastSyncedAt: "2026-04-28T12:00:00.000Z",
    source: "normalized",
  },
  holdings: [
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      quantity: "10",
      price: "200",
      market_value: "2000",
      currency: "USD",
    },
  ],
  transactions: [],
  connections: [],
  legacy: null,
};

describe("fetchPortfolioSummary", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("requests the portfolio summary without caching", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(portfolioResponse),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchPortfolioSummary()).resolves.toEqual(portfolioResponse);
    expect(fetchMock).toHaveBeenCalledWith("/api/portfolio/summary", {
      method: "GET",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    });
  });

  it("throws the API error message when the request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: vi.fn().mockResolvedValue({ error: "Portfolio unavailable" }),
      })
    );

    await expect(fetchPortfolioSummary()).rejects.toThrow("Portfolio unavailable");
  });

  it("throws a fallback error when the API omits an error message", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: vi.fn().mockResolvedValue({}),
      })
    );

    await expect(fetchPortfolioSummary()).rejects.toThrow("Unable to fetch portfolio summary.");
  });
});
