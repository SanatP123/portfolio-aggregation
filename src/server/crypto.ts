import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

const encryptedPrefix = "enc:v1:";

function getEncryptionKey() {
  const secret = process.env.PLAID_TOKEN_ENCRYPTION_KEY;
  if (!secret) return null;
  return createHash("sha256").update(secret).digest();
}

export function encryptSecret(value: string) {
  const key = getEncryptionKey();
  if (!key) return value;

  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return `${encryptedPrefix}${Buffer.concat([iv, authTag, encrypted]).toString("base64")}`;
}

export function decryptSecret(value: string) {
  if (!value.startsWith(encryptedPrefix)) return value;

  const key = getEncryptionKey();
  if (!key) {
    throw new Error("PLAID_TOKEN_ENCRYPTION_KEY is required to decrypt Plaid access tokens.");
  }

  const payload = Buffer.from(value.slice(encryptedPrefix.length), "base64");
  const iv = payload.subarray(0, 12);
  const authTag = payload.subarray(12, 28);
  const encrypted = payload.subarray(28);

  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}
