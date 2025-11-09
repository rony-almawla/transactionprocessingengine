import { describe, it, expect } from "@jest/globals";
import { checkFraud } from "../src/services/fraudDetectionService.js";

describe("Fraud Detection", () => {
  it("should flag fraudulent transaction over 10,000", () => {
    const transaction = { source: "A", destination: "B", amount: 15000 };
    const result = checkFraud(transaction);
    expect(result.isFraud).toBe(true);
  });

  it("should not flag legitimate transaction", () => {
    const transaction = { source: "A", destination: "B", amount: 500 };
    const result = checkFraud(transaction);
    expect(result.isFraud).toBe(false);
  });
});
