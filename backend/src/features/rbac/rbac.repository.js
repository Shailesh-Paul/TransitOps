import { getDB } from "../../config/db.js";

/**
 * Retrieves all active roles assigned to a user.
 */
export const getUserRoles = async (userId) => {
  const pool = getDB();
  const [rows] = await pool.query(
    `SELECT r.id, r.name, r.description 
     FROM roles r
     JOIN users u ON r.id = u.role_id
     WHERE u.id = ? AND r.is_active = TRUE`,
    [userId]
  );
  return rows;
};

/**
 * Retrieves an aggregated, unique list of permission names for a user across all their roles.
 */
export const getUserPermissions = async (userId) => {
  const pool = getDB();
  const [rows] = await pool.query(
    `SELECT DISTINCT p.name
     FROM permissions p
     JOIN role_permissions rp ON p.id = rp.permission_id
     JOIN roles r ON rp.role_id = r.id
     JOIN users u ON r.id = u.role_id
     WHERE u.id = ? AND r.is_active = TRUE`,
    [userId]
  );
  return rows.map((r) => r.name);
};

/**
 * Retrieves all permissions explicitly assigned to a specific role.
 */
export const getRolePermissions = async (roleId) => {
  const pool = getDB();
  const [rows] = await pool.query(
    `SELECT p.id, p.name, p.module 
     FROM permissions p
     JOIN role_permissions rp ON p.id = rp.permission_id
     WHERE rp.role_id = ?`,
    [roleId]
  );
  return rows;
};

/**
 * Assigns a role to a user (Updates their role_id in users table).
 */
export const assignRole = async (userId, roleId) => {
  const pool = getDB();
  await pool.query(
    `UPDATE users SET role_id = ? WHERE id = ?`,
    [roleId, userId]
  );
};

/**
 * Removes a specific role from a user by falling back to a default role.
 * (Assuming role 9 is Standard Employee, as role_id cannot be null)
 */
export const removeRole = async (userId, roleId) => {
  const pool = getDB();
  // We cannot set role_id to NULL. If it matches, we set to default role 9 (Standard Employee)
  await pool.query(
    `UPDATE users SET role_id = 9 WHERE id = ? AND role_id = ?`,
    [userId, roleId]
  );
};

/**
 * Assigns a permission to a role. Uses INSERT IGNORE to prevent duplicate entry errors.
 */
export const assignPermission = async (roleId, permissionId) => {
  const pool = getDB();
  await pool.query(
    `INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)`,
    [roleId, permissionId]
  );
};

/**
 * Removes a specific permission from a role.
 */
export const removePermission = async (roleId, permissionId) => {
  const pool = getDB();
  await pool.query(
    `DELETE FROM role_permissions WHERE role_id = ? AND permission_id = ?`,
    [roleId, permissionId]
  );
};

// ==========================================
// CRUD OPERATIONS FOR ROLE MANAGEMENT
// ==========================================

export const getAllRoles = async () => {
  const pool = getDB();
  const [rows] = await pool.query(
    `SELECT id, name, description, is_active, created_at, updated_at 
     FROM roles`
  );
  return rows;
};

export const getAllPermissions = async () => {
  const pool = getDB();
  const [rows] = await pool.query(
    `SELECT id, name, module, description, created_at 
     FROM permissions`
  );
  return rows;
};

export const findRoleById = async (roleId) => {
  const pool = getDB();
  const [rows] = await pool.query(
    `SELECT id, name, description, is_active FROM roles WHERE id = ?`,
    [roleId]
  );
  return rows[0];
};

export const findPermissionById = async (permissionId) => {
  const pool = getDB();
  const [rows] = await pool.query(
    `SELECT id, name, module FROM permissions WHERE id = ?`,
    [permissionId]
  );
  return rows[0];
};

export const createRole = async (name, description, createdBy) => {
  const pool = getDB();
  const [result] = await pool.query(
    `INSERT INTO roles (name, description, is_active, created_by) VALUES (?, ?, TRUE, ?)`,
    [name, description, createdBy]
  );
  return result.insertId;
};

export const updateRole = async (roleId, name, description, isActive, updatedBy) => {
  const pool = getDB();
  await pool.query(
    `UPDATE roles SET name = ?, description = ?, is_active = ?, updated_by = ? WHERE id = ?`,
    [name, description, isActive, updatedBy, roleId]
  );
};

export const deleteRole = async (roleId) => {
  const pool = getDB();
  await pool.query(
    `DELETE FROM roles WHERE id = ?`,
    [roleId]
  );
};
