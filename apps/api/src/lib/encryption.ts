/**
 * AES-256-GCM application-layer column encryption for C3+ fields.
 *
 * Key governance:
 *   - ENCRYPTION_KEY env var: hex-encoded 32-byte AES key stored in AWS KMS CMK (eu-west-2)
 *   - EMAIL_HMAC_KEY env var: hex-encoded 32-byte HMAC key for deterministic email search index
 *
 * Usage:
 *   - encrypt(plaintext)          → `<iv_hex>:<ciphertext_hex>:<tag_hex>` (non-deterministic)
 *   - decrypt(ciphertext)         → plaintext string
 *   - encryptEmail(email)         → same format as encrypt(), deterministic-safe via HMAC index
 *   - hashEmailForLookup(email)   → HMAC-SHA256 hex — use this for WHERE clauses, not the ciphertext
 *
 * Never call crypto functions directly in route handlers.
 * All C3+ fields (email, display_name, age_band, stripe IDs, etc.) must pass through here.
 *
 * Data classification: C8 (encryption key is a crown jewel — never log, never return in API)
 */

import { createCipheriv, createDecipheriv, createHmac, randomBytes } from 'node:crypto';

const ALGORITHM = 'aes-256-gcm' as const;
const IV_BYTES = 12;   // 96-bit IV recommended for GCM
const TAG_BYTES = 16;  // 128-bit authentication tag

function getEncryptionKey(): Buffer {
  const hex = process.env['ENCRYPTION_KEY'];
  if (!hex || hex.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be a 64-char hex string (32 bytes). Check your environment configuration.');
  }
  return Buffer.from(hex, 'hex');
}

function getEmailHmacKey(): Buffer {
  const hex = process.env['EMAIL_HMAC_KEY'];
  if (!hex || hex.length !== 64) {
    throw new Error('EMAIL_HMAC_KEY must be a 64-char hex string (32 bytes). Check your environment configuration.');
  }
  return Buffer.from(hex, 'hex');
}

/**
 * Encrypt a plaintext string.
 * Returns `<iv_hex>:<ciphertext_hex>:<tag_hex>`.
 * Each call produces a unique ciphertext (non-deterministic IV).
 */
export function encrypt(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  const ciphertextBuf = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${ciphertextBuf.toString('hex')}:${tag.toString('hex')}`;
}

/**
 * Decrypt a ciphertext string produced by `encrypt()`.
 * Throws on tampered ciphertext (authentication tag mismatch).
 */
export function decrypt(ciphertext: string): string {
  const parts = ciphertext.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid ciphertext format. Expected iv:ciphertext:tag');
  }

  const [ivHex, ctHex, tagHex] = parts as [string, string, string];
  const key = getEncryptionKey();
  const iv = Buffer.from(ivHex, 'hex');
  const ct = Buffer.from(ctHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  const plaintext = Buffer.concat([decipher.update(ct), decipher.final()]);
  return plaintext.toString('utf8');
}

/**
 * Encrypt an email address for at-rest storage.
 * The stored value is non-deterministic (safe for general lookup via hashEmailForLookup).
 */
export function encryptEmail(email: string): string {
  return encrypt(email.toLowerCase().trim());
}

/**
 * Produce a deterministic HMAC-SHA256 of the normalised email for use as a lookup
 * index in WHERE clauses. The hash does not reveal the plaintext but is consistent
 * across calls — enabling `WHERE email_hash = ?` without decrypting all rows.
 *
 * Classification: C3 (hash of PII — do NOT log)
 */
export function hashEmailForLookup(email: string): string {
  const key = getEmailHmacKey();
  return createHmac('sha256', key)
    .update(email.toLowerCase().trim())
    .digest('hex');
}

/**
 * Hash an IP address for audit records (SHA-256, no key — collision-free but
 * not reversible for tracking purposes). Classification: C3 — do not log.
 */
export function hashIpAddress(ip: string): string {
  // Deliberate choice: keyless SHA-256 for IP. This is weaker than HMAC but
  // IP addresses are not secret per se — the constraint is "never store in plaintext".
  const { createHash } = require('node:crypto') as typeof import('node:crypto');
  return createHash('sha256').update(ip).digest('hex');
}

/**
 * Safely compare two strings in constant time to prevent timing attacks.
 * Use when comparing tokens, hashes, or any security-sensitive values.
 */
export function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // Still do a comparison to avoid short-circuit timing leaks
    const { timingSafeEqual } = require('node:crypto') as typeof import('node:crypto');
    const dummyA = Buffer.alloc(32);
    const dummyB = Buffer.alloc(32);
    timingSafeEqual(dummyA, dummyB);
    return false;
  }
  const { timingSafeEqual } = require('node:crypto') as typeof import('node:crypto');
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}
