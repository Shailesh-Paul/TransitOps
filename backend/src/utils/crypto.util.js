import crypto from "crypto";

/**
 * Hashes a token using SHA-256 for secure database storage.
 * @param {string} token - The raw token to hash.
 * @returns {string|null} The hashed hex string, or null if no token provided.
 */
export const hashToken = (token) => {
  if (!token) return null;
  return crypto.createHash("sha256").update(token).digest("hex");
};

/**
 * Generates a cryptographically secure random token.
 * @param {number} bytes - Number of random bytes.
 * @returns {string} The random hex string.
 */
export const generateRandomToken = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString("hex");
};
