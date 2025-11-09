import { describe, it, expect } from "@jest/globals";
import { calculateAnalytics } from "../src/services/analyticsService.js";

describe("Analytics Service", () => {
  it("should correctly calculate analytics", () => {
    const transactions = [
      { source: "Alice", destination: "Bob", amount: 100, timestamp: new Date("2025-11-09T10:00:00Z") },
      { source: "Alice", destination: "Bob", amount: 50, timestamp: new Date("2025-11-09T10:30:00Z") },
      { source: "Charlie", destination: "NG", amount: 300, timestamp: new Date("2025-11-09T11:00:00Z") },
    ];

    const result = calculateAnalytics(transactions);

    expect(result.volumeBySource).toEqual({ Alice: 150, Charlie: 300 });
    expect(result.avgAmountByDest).toEqual({ Bob: 75, NG: 300 });
    expect(result.txPerHour).toEqual({ 10: 2, 11: 1 });
  });
});
