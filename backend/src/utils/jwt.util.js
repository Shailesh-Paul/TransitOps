import jwt from 'jsonwebtoken';

// Environment-based secrets and expirations with fallback defaults for safety
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'transitops_default_access_secret_do_not_use_in_prod';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'transitops_default_refresh_secret_do_not_use_in_prod';

const ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

/**
 * Generates a short-lived JWT Access Token.
 * @param {Object} payload - The payload containing user data (e.g., { id, role_id }).
 * @returns {string} The signed JWT access token.
 */
export const generateAccessToken = (payload) => {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES_IN });
};

/**
 * Generates a long-lived JWT Refresh Token.
 * @param {Object} payload - The payload containing user data.
 * @returns {string} The signed JWT refresh token.
 */
export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN });
};

/**
 * Verifies an Access Token.
 * @param {string} token - The access token to verify.
 * @returns {Object} The decoded payload if valid.
 * @throws {Error} Throws an error if the token is invalid, malformed, or expired.
 */
export const verifyAccessToken = (token) => {
  return jwt.verify(token, ACCESS_SECRET);
};

/**
 * Verifies a Refresh Token.
 * @param {string} token - The refresh token to verify.
 * @returns {Object} The decoded payload if valid.
 * @throws {Error} Throws an error if the token is invalid, malformed, or expired.
 */
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, REFRESH_SECRET);
};
