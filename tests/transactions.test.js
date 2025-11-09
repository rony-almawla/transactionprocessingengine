import { describe, it, expect, jest } from "@jest/globals";
import { processTransactions } from "../src/services/transactionService.js";
import { checkRateLimit } from "../src/utils/rateLimiter.js";

// Mock the rate limiter to always allow transactions
jest.mock("../src/utils/rateLimiter.js", () => ({
  checkRateLimit: jest.fn().mockResolvedValue({ ok: true }),
}));

describe("Transactions Service", () => {
  const fastifyMock = {
    prisma: {
      transaction: {
        create: jest.fn().mockImplementation(({ data }) => Promise.resolve(data)),
        count: jest.fn().mockResolvedValue(0), // for fraud check
      },
      fraudulentTransaction: {
        create: jest.fn(),
      },
    },
    redis: null,
    log: { warn: jest.fn() },
  };

  it("should process valid transactions successfully", async () => {
    const transactions = [
      {
        txId: "tx1",
        source: "Alice",
        destination: "Bob",
        amount: 200,
        currency: "USD",
        timestamp: new Date(),
      },
    ];

    const result = await processTransactions(fastifyMock, transactions);

    expect(result.success).toBe(1);
    expect(result.failed).toBe(0);
    expect(result.details[0].tx.source).toBe("Alice");
    expect(result.details[0].fraudReasons).toEqual([]);
  });

  it("should detect fraud for high amount", async () => {
    const transactions = [
      {
        txId: "tx2",
        source: "Charlie",
        destination: "NG",
        amount: 6000, // above HIGH_AMOUNT
        currency: "USD",
        timestamp: new Date(),
      },
    ];

    const result = await processTransactions(fastifyMock, transactions);

    expect(result.success).toBe(1);
    expect(result.failed).toBe(0);
    expect(result.details[0].fraudReasons).toContain("High amount");
  });

  it("should handle partial success with invalid transaction", async () => {
    const transactions = [
      {
        txId: "tx3",
        source: "David",
        destination: "US",
        amount: 100,
        currency: "USD",
        timestamp: new Date(),
      },
      {
        // Invalid transaction (missing amount)
        txId: "tx4",
        source: "Eve",
        destination: "US",
        currency: "USD",
        timestamp: new Date(),
      },
    ];

    const result = await processTransactions(fastifyMock, transactions);

    expect(result.success).toBe(1);       // only 1 valid transaction
    expect(result.failed).toBe(1);        // 1 failed
    expect(result.details[1].error).toBeDefined();
  });
});
