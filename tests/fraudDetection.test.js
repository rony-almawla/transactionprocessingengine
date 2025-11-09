import { describe, it, expect } from "@jest/globals";
import { checkFraud } from "../src/services/fraudDetectionService.js";

describe("Fraud Detection", () => {
  // Mock fastify.prisma transaction.count
  const fastifyMock = {
    prisma: {
      transaction: {
        count: jest.fn(async () => 0) // Default: no recent transactions
      }
    }
  };

  it("should flag transaction over high amount", async () => {
    const tx = { txId: "1", source: "Alice", destination: "Bob", amount: 6000, createdAt: new Date() };
    const result = await checkFraud(fastifyMock, tx);
    expect(result.isFraud).toBe(true);
    expect(result.reasons).toContain("High amount");
  });

  it("should flag transaction to high-risk destination", async () => {
    const tx = { txId: "2", source: "Alice", destination: "VE", amount: 100, createdAt: new Date() };
    const result = await checkFraud(fastifyMock, tx);
    expect(result.isFraud).toBe(true);
    expect(result.reasons).toContain("High-risk destination");
  });

  it("should flag transaction with too many recent transactions", async () => {
    fastifyMock.prisma.transaction.count.mockResolvedValueOnce(5);
    const tx = { txId: "3", source: "Alice", destination: "Bob", amount: 100, createdAt: new Date() };
    const result = await checkFraud(fastifyMock, tx);
    expect(result.isFraud).toBe(true);
    expect(result.reasons).toContain("Too many transactions in 10 minutes");
  });

  it("should pass transaction with no fraud rules triggered", async () => {
    fastifyMock.prisma.transaction.count.mockResolvedValueOnce(0);
    const tx = { txId: "4", source: "Alice", destination: "Bob", amount: 100, createdAt: new Date() };
    const result = await checkFraud(fastifyMock, tx);
    expect(result.isFraud).toBe(false);
    expect(result.reasons).toEqual([]);
  });
});
