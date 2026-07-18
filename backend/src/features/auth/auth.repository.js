import { getDB } from "../../config/db.js";

export const findUserByEmail = async (email) => {
  const pool = getDB();
  const [rows] = await pool.query(
    "SELECT id, email, password_hash, status FROM users WHERE email = ? AND deleted_at IS NULL",
    [email]
  );
  return rows[0];
};

export const findUserById = async (id) => {
  const pool = getDB();
  const [rows] = await pool.query(
    `SELECT u.id, u.email, u.status 
     FROM users u
     WHERE u.id = ? AND u.deleted_at IS NULL`,
    [id]
  );
  return rows[0];
};

export const updateLastLogin = async (userId) => {
  const pool = getDB();
  await pool.query(
    "UPDATE users SET last_login_at = NOW(), failed_login_attempts = 0 WHERE id = ?",
    [userId]
  );
};

export const findUserByRefreshToken = async (hashedToken) => {
  const pool = getDB();
  const [rows] = await pool.query(
    "SELECT id, email, status FROM users WHERE refresh_token = ? AND deleted_at IS NULL",
    [hashedToken]
  );
  return rows[0];
};

export const updateRefreshToken = async (userId, refreshToken) => {
  const pool = getDB();
  await pool.query("UPDATE users SET refresh_token = ? WHERE id = ?", [
    refreshToken,
    userId,
  ]);
};

export const clearSpecificRefreshToken = async (userId, hashedToken) => {
  const pool = getDB();
  await pool.query(
    "UPDATE users SET refresh_token = NULL WHERE id = ? AND refresh_token = ?",
    [userId, hashedToken]
  );
};

export const savePasswordResetToken = async (userId, hashedToken, expiresAt) => {
  const pool = getDB();
  await pool.query(
    "UPDATE users SET reset_token_hash = ?, reset_token_expires_at = ? WHERE id = ?",
    [hashedToken, expiresAt, userId]
  );
};

export const findUserByResetToken = async (hashedToken) => {
  const pool = getDB();
  const [rows] = await pool.query(
    "SELECT id, reset_token_expires_at FROM users WHERE reset_token_hash = ? AND deleted_at IS NULL",
    [hashedToken]
  );
  return rows[0];
};

export const updatePassword = async (userId, newPasswordHash) => {
  const pool = getDB();
  await pool.query(
    "UPDATE users SET password_hash = ?, reset_token_hash = NULL, reset_token_expires_at = NULL, refresh_token = NULL WHERE id = ?",
    [newPasswordHash, userId]
  );
};

