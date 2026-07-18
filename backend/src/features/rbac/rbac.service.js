import * as rbacRepository from "./rbac.repository.js";
import { NotFoundError } from "../../core/errors.js";
import { findUserById } from "../auth/auth.repository.js";

export const getAllRoles = async () => {
  return await rbacRepository.getAllRoles();
};

export const getAllPermissions = async () => {
  return await rbacRepository.getAllPermissions();
};

export const createRole = async (name, description, createdBy) => {
  return await rbacRepository.createRole(name, description, createdBy);
};

export const updateRole = async (roleId, name, description, isActive, updatedBy) => {
  const role = await rbacRepository.findRoleById(roleId);
  if (!role) {
    throw new NotFoundError("Role not found");
  }
  await rbacRepository.updateRole(roleId, name, description, isActive, updatedBy);
};

export const deleteRole = async (roleId) => {
  const role = await rbacRepository.findRoleById(roleId);
  if (!role) {
    throw new NotFoundError("Role not found");
  }
  await rbacRepository.deleteRole(roleId);
};

export const assignRoleToUser = async (userId, roleId) => {
  const user = await findUserById(userId);
  if (!user) throw new NotFoundError("User not found");

  const role = await rbacRepository.findRoleById(roleId);
  if (!role) throw new NotFoundError("Role not found");

  await rbacRepository.assignRole(userId, roleId);
};

export const removeRoleFromUser = async (userId, roleId) => {
  await rbacRepository.removeRole(userId, roleId);
};

export const assignPermissionToRole = async (roleId, permissionId) => {
  const role = await rbacRepository.findRoleById(roleId);
  if (!role) throw new NotFoundError("Role not found");

  const permission = await rbacRepository.findPermissionById(permissionId);
  if (!permission) throw new NotFoundError("Permission not found");

  await rbacRepository.assignPermission(roleId, permissionId);
};

export const removePermissionFromRole = async (roleId, permissionId) => {
  await rbacRepository.removePermission(roleId, permissionId);
};
