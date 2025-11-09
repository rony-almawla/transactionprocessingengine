import { describe, it, expect, jest } from "@jest/globals";
import { processTransactions } from "../src/services/transactionService.js";

describe("Transactions Service", () => {
  const fastifyMock = {
    prisma: {
      transaction: { findMany: jest.fn().mockResolvedValue([]) }
    }
  };

  it("should process valid transactions successfully", async () => {
    const transactions = [{ source: "Alice", destination: "Bob", amount: 200 }];
    const result = await processTransactions(fastifyMock, transactions);
    expect(result[0].success).toBe(true);
    expect(result[0].tx.source).toBe("Alice");
  });
});
