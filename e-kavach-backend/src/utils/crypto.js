const crypto = require('crypto');
const env = require('../config/env');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

// Derive a 32-byte key from secret
const getKey = () => {
  return crypto.createHash('sha256').update(String(env.ENCRYPTION_SECRET_KEY)).digest();
};

/**
 * Encrypt sensitive PII text using AES-256-GCM
 * Returns formatted string: "iv:authTag:ciphertext" (hex encoded)
 */
function encryptPII(plainText) {
  if (!plainText) return plainText;
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
    let encrypted = cipher.update(String(plainText), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  } catch (err) {
    console.error('PII Encryption Error:', err.message);
    throw new Error('Encryption failed');
  }
}

/**
 * Decrypt sensitive PII text
 */
function decryptPII(cipherText) {
  if (!cipherText || typeof cipherText !== 'string' || !cipherText.includes(':')) {
    return cipherText;
  }
  try {
    const parts = cipherText.split(':');
    if (parts.length !== 3) return cipherText;
    const [ivHex, authTagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    // If decryption fails (e.g. was plain text previously), return as-is
    return cipherText;
  }
}

/**
 * Mask PII for safe logging or partial display
 * e.g. "9824-8819-3320-TN" -> "9824-****-****-TN"
 * "+91 98401 22819" -> "+91 98401 *****"
 */
function maskPII(text) {
  if (!text) return '';
  const str = String(text);
  if (str.length <= 6) return '****';
  return str.slice(0, 4) + '-****-****-' + str.slice(-2);
}

module.exports = {
  encryptPII,
  decryptPII,
  maskPII,
};
