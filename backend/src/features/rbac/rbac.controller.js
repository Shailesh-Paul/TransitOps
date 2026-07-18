import ApiResponse from "../../core/ApiResponse.js";
import * as rbacService from "./rbac.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const getAllRoles = asyncHandler(async (req, res, next) => {
  const roles = await rbacService.getAllRoles();
    ApiResponse.send(res, { roles });
});

export const getAllPermissions = asyncHandler(async (req, res, next) => {
  const permissions = await rbacService.getAllPermissions();
    ApiResponse.send(res, { permissions });
});

export const createRole = asyncHandler(async (req, res, next) => {
  const { name, description } = req.body;
    const roleId = await rbacService.createRole(name, description, req.user.id);
    ApiResponse.send(res, { id: roleId }, null, 201);
});

export const updateRole = asyncHandler(async (req, res, next) => {
  const { name, description, is_active } = req.body;
    await rbacService.updateRole(req.params.id, name, description, is_active, req.user.id);
    ApiResponse.send(res, null, "Operation successful");
});

export const deleteRole = asyncHandler(async (req, res, next) => {
  await rbacService.deleteRole(req.params.id);
    ApiResponse.send(res, null, "Operation successful");
});

export const assignRoleToUser = asyncHandler(async (req, res, next) => {
  const { userId, roleId } = req.params;
    await rbacService.assignRoleToUser(userId, roleId);
    ApiResponse.send(res, null, "Operation successful");
});

export const removeRoleFromUser = asyncHandler(async (req, res, next) => {
  const { userId, roleId } = req.params;
    await rbacService.removeRoleFromUser(userId, roleId);
    ApiResponse.send(res, null, "Operation successful");
});

export const assignPermissionToRole = asyncHandler(async (req, res, next) => {
  const { roleId, permissionId } = req.params;
    await rbacService.assignPermissionToRole(roleId, permissionId);
    ApiResponse.send(res, null, "Operation successful");
});

export const removePermissionFromRole = asyncHandler(async (req, res, next) => {
  const { roleId, permissionId } = req.params;
    await rbacService.removePermissionFromRole(roleId, permissionId);
    ApiResponse.send(res, null, "Operation successful");
});
