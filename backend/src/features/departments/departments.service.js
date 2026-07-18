import { NotFoundError, BusinessRuleError } from "../../core/errors.js";
import departmentsRepository from "./departments.repository.js";

export const getAllDepartments = async (options) => {
  return await departmentsRepository.findAll({
    ...options,
    searchFields: ["name", "description"],
  });
};

export const getDepartmentById = async (id) => {
  const department = await departmentsRepository.findById(id);
  if (!department) throw new NotFoundError("Department not found");
  return department;
};

export const createDepartment = async (departmentData, createdBy) => {
  const existing = await departmentsRepository.findByName(departmentData.name);
  if (existing) {
    throw new BusinessRuleError("A department with this name already exists");
  }

  const payload = {
    ...departmentData,
    is_active: departmentData.is_active !== undefined ? departmentData.is_active : true,
    created_by: createdBy,
  };

  const newDepartmentId = await departmentsRepository.create(payload);
  return newDepartmentId;
};

export const updateDepartment = async (id, updateData, updatedBy) => {
  const department = await departmentsRepository.findById(id);
  if (!department) throw new NotFoundError("Department not found");

  if (updateData.name && updateData.name !== department.name) {
    const existing = await departmentsRepository.findByName(updateData.name);
    if (existing) {
      throw new BusinessRuleError("A department with this name already exists");
    }
  }

  const payload = {
    ...updateData,
    updated_by: updatedBy,
  };

  await departmentsRepository.update(id, payload);
};

export const softDeleteDepartment = async (id, deletedBy) => {
  const department = await departmentsRepository.findById(id);
  if (!department) throw new NotFoundError("Department not found");

  await departmentsRepository.update(id, { deleted_by: deletedBy });
  await departmentsRepository.softDelete(id);
};
