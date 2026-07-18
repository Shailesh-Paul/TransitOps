import bcrypt from "bcryptjs";
import { NotFoundError, BusinessRuleError } from "../../core/errors.js";
import userRepository from "./users.repository.js";

export const getAllUsers = async (options) => {
  return await userRepository.findAll({
    ...options,
    searchFields: ["email"], // Allows fuzzy searching by email
  });
};

export const getUserById = async (id) => {
  const user = await userRepository.getFullProfile(id);
  if (!user) throw new NotFoundError("User not found");
  return user;
};

export const createUser = async (userData, createdBy) => {
  // Check if email exists
  const existingUser = await userRepository.findByEmail(userData.email);
  if (existingUser) {
    throw new BusinessRuleError("Email is already in use");
  }

  const hashedPassword = await bcrypt.hash(userData.password, 10);
  
  const newUserId = await userRepository.create({
    email: userData.email,
    password_hash: hashedPassword,
    role_id: userData.role_id,
    status: userData.status || "active",
    created_by: createdBy,
  });

  return newUserId;
};

export const updateUser = async (id, updateData, updatedBy) => {
  const user = await userRepository.findById(id);
  if (!user) throw new NotFoundError("User not found");

  const payload = {
    ...updateData,
    updated_by: updatedBy
  };

  await userRepository.update(id, payload);
};

export const softDeleteUser = async (id) => {
  const user = await userRepository.findById(id);
  if (!user) throw new NotFoundError("User not found");

  // In a real app we might also want to set deleted_by
  await userRepository.softDelete(id);
};

export const getMyProfile = async (userId) => {
  const profile = await userRepository.getFullProfile(userId);
  if (!profile) throw new NotFoundError("Profile not found");
  return profile;
};

export const updateMyProfile = async (userId, profileData) => {
  try {
    await userRepository.upsertProfile(userId, profileData);
  } catch (error) {
    throw new BusinessRuleError(error.message);
  }
};

export const changeMyPassword = async (userId, currentPassword, newPassword) => {
  const user = await userRepository.findById(userId);
  if (!user) throw new NotFoundError("User not found");

  const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
  if (!isMatch) {
    throw new BusinessRuleError("Incorrect current password");
  }

  const newHashedPassword = await bcrypt.hash(newPassword, 10);
  
  await userRepository.update(userId, {
    password_hash: newHashedPassword,
    updated_by: userId
  });
};
