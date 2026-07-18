import { AuthenticationError, AuthorizationError, BusinessRuleError } from "../../core/errors.js";
import * as authRepository from "./auth.repository.js";
import { comparePassword, hashPassword } from "../../utils/password.util.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../../utils/jwt.util.js";
import { hashToken, generateRandomToken } from "../../utils/crypto.util.js";

export const login = async (email, password) => {
  // 1. & 2. Validate request & Find user
  const user = await authRepository.findUserByEmail(email);

  // 3. Check account status
  if (!user || user.status !== "active") {
    throw new AuthenticationError("Invalid credentials or inactive account");
  }

  // Account Lock Check (if implemented in schema review)
  if (user.account_locked_until && new Date(user.account_locked_until) > new Date()) {
    throw new AuthorizationError("Account is temporarily locked due to multiple failed login attempts");
  }

  // 4. Verify password using the secure helper
  const isPasswordCorrect = await comparePassword(password, user.password_hash);
  if (!isPasswordCorrect) {
    // In a full implementation we would increment failed_login_attempts here
    throw new AuthenticationError("Invalid credentials");
  }

  // 5. & 6. Generate Access Token & Generate Refresh Token
  const tokenPayload = { id: user.id, role_id: user.role_id };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);
  
  // Store hashed refresh token in DB for validation during refresh
  const hashedRefreshToken = hashToken(refreshToken);

  await authRepository.updateRefreshToken(user.id, hashedRefreshToken);

  // 7. Update Last Login
  await authRepository.updateLastLogin(user.id);

  // 8. Return standardized response structure
  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      role_id: user.role_id,
    },
  };
};

export const refresh = async (oldRefreshToken) => {
  if (!oldRefreshToken) {
    throw new AuthenticationError("Not authorized");
  }

  // 1. Validate Refresh Token (JWT signature and expiration)
  let decoded;
  try {
    decoded = verifyRefreshToken(oldRefreshToken);
  } catch (error) {
    throw new AuthenticationError("Invalid or expired refresh token");
  }

  // 2. Hash it to compare against the stored hash in the database
  const hashedInputToken = hashToken(oldRefreshToken);

  // Verify user and token validity in the database
  const user = await authRepository.findUserByRefreshToken(hashedInputToken);
  
  if (!user || user.status !== "active") {
    throw new AuthenticationError("Invalid or expired refresh token");
  }

  // 3. & 4. Generate new Access Token & Generate new Refresh Token (Token Rotation)
  const tokenPayload = { id: user.id, role_id: user.role_id };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);
  
  // 5. Invalidate previous refresh token by storing the new hashed token
  const newHashedRefreshToken = hashToken(refreshToken);

  await authRepository.updateRefreshToken(user.id, newHashedRefreshToken);

  // 6. Return standardized response structure
  return { accessToken, refreshToken };
};

export const logout = async (userId, refreshToken) => {
  if (!refreshToken) return;
  
  const hashedToken = hashToken(refreshToken);

  await authRepository.clearSpecificRefreshToken(userId, hashedToken);
};

export const generatePasswordResetToken = async (email) => {
  const user = await authRepository.findUserByEmail(email);
  if (!user) {
    // Return silently to prevent email enumeration attacks
    return null;
  }

  const resetToken = generateRandomToken(32);
  const hashedToken = hashToken(resetToken);

  // Expires in 1 hour
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
  
  await authRepository.savePasswordResetToken(user.id, hashedToken, expiresAt);
  
  return resetToken; // This raw token is sent via email
};

export const resetPassword = async (rawToken, newPassword) => {
  const hashedToken = hashToken(rawToken);

  const user = await authRepository.findUserByResetToken(hashedToken);

  if (!user || new Date(user.reset_token_expires_at) < new Date()) {
    throw new BusinessRuleError("Token is invalid or has expired");
  }

  const newPasswordHash = await hashPassword(newPassword);
  await authRepository.updatePassword(user.id, newPasswordHash);
};
