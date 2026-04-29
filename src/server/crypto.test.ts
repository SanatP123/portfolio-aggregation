import { afterEach, describe, expect, it, vi } from "vitest";
import { decryptSecret, encryptSecret } from "./crypto";

const encryptionKey = "test-encryption-key";
const originalEnv = process.env.PLAID_TOKEN_ENCRYPTION_KEY;

describe("Plaid token crypto", () => {
  afterEach(() => {
    process.env.PLAID_TOKEN_ENCRYPTION_KEY = originalEnv;
    vi.restoreAllMocks();
  });

  it("returns plaintext unchanged when no encryption key is configured", () => {
    delete process.env.PLAID_TOKEN_ENCRYPTION_KEY;

    expect(encryptSecret("access-token")).toBe("access-token");
    expect(decryptSecret("access-token")).toBe("access-token");
  });

  it("encrypts values with the expected prefix and decrypts them", () => {
    process.env.PLAID_TOKEN_ENCRYPTION_KEY = encryptionKey;

    const encrypted = encryptSecret("access-token");

    expect(encrypted).toMatch(/^enc:v1:/);
    expect(encrypted).not.toContain("access-token");
    expect(decryptSecret(encrypted)).toBe("access-token");
  });

  it("uses a random iv so repeated encryption produces different ciphertext", () => {
    process.env.PLAID_TOKEN_ENCRYPTION_KEY = encryptionKey;

    expect(encryptSecret("access-token")).not.toBe(encryptSecret("access-token"));
  });

  it("requires an encryption key to decrypt encrypted values", () => {
    process.env.PLAID_TOKEN_ENCRYPTION_KEY = encryptionKey;
    const encrypted = encryptSecret("access-token");

    delete process.env.PLAID_TOKEN_ENCRYPTION_KEY;

    expect(() => decryptSecret(encrypted)).toThrow("PLAID_TOKEN_ENCRYPTION_KEY is required");
  });
});
