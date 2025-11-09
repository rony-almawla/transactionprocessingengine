import { describe, it, expect } from "@jest/globals";
import bcrypt from "bcryptjs";

describe("Authentication", () => {
  it("should hash and compare a password correctly", async () => {
    const password = "mypassword";
    const hashed = await bcrypt.hash(password, 10);
    const match = await bcrypt.compare(password, hashed);
    expect(match).toBe(true);
  });
});
