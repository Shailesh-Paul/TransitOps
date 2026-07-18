import ApiResponse from "../../core/ApiResponse.js";
import * as usersService from "./users.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

// ==========================================
// ADMIN CRUD ENDPOINTS
// ==========================================

export const getAllUsers = asyncHandler(async (req, res, next) => {
  const { page, limit, sort, order, search, ...filters } = req.query;
    
    const result = await usersService.getAllUsers({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      sort: sort || "created_at",
      order: order || "DESC",
      search: search || "",
      filters
    });

    ApiResponse.sendPaginated(res, result);
});

export const getUserById = asyncHandler(async (req, res, next) => {
  const user = await usersService.getUserById(req.params.id);
    ApiResponse.send(res, user);
});

export const createUser = asyncHandler(async (req, res, next) => {
  const newUserId = await usersService.createUser(req.body, req.user.id);
    ApiResponse.send(res, { id: newUserId }, "User created successfully", 201);
});

export const updateUser = asyncHandler(async (req, res, next) => {
  await usersService.updateUser(req.params.id, req.body, req.user.id);
    ApiResponse.send(res, null, "User updated successfully");
});

export const softDeleteUser = asyncHandler(async (req, res, next) => {
  await usersService.softDeleteUser(req.params.id);
    ApiResponse.send(res, null, null, 204);
});

// ==========================================
// MY PROFILE ENDPOINTS
// ==========================================

export const getMyProfile = asyncHandler(async (req, res, next) => {
  const profile = await usersService.getMyProfile(req.user.id);
    ApiResponse.send(res, profile);
});

export const updateMyProfile = asyncHandler(async (req, res, next) => {
  await usersService.updateMyProfile(req.user.id, req.body);
    ApiResponse.send(res, null, "Profile updated successfully");
});

export const changeMyPassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
    await usersService.changeMyPassword(req.user.id, currentPassword, newPassword);
    ApiResponse.send(res, null, "Password changed successfully");
});
