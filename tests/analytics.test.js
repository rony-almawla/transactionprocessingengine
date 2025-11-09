import { describe, it, expect } from "@jest/globals";
import { calculateAnalytics } from "../src/services/analyticsService.js";

describe("Analytics Service", () => {
  it("should calculate analytics correctly", () => {
    const transactions = [
      { source: "Charlie", destination: "NG", amount: 6000, createdAt: new Date("2025-11-09T11:00:00Z") },
    ];
    const result = calculateAnalytics(transactions);

    expect(result.volumeBySource.Charlie).toBe(6000);
    expect(result.avgAmountByDest.NG).toBe(6000);
    expect(result.txPerHour["11"]).toBe(1);
  });
});
