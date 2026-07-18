import { NotFoundError, BusinessRuleError } from "../../core/errors.js";
import employeesRepository from "./employees.repository.js";

export const getAllEmployees = async (options) => {
  return await employeesRepository.findAllWithDetails({
    page: options.page,
    limit: options.limit,
    status: options.filters?.status,
    department_id: options.filters?.department_id,
    search: options.search,
  });
};

export const getEmployeeById = async (id) => {
  const employee = await employeesRepository.findDetailedById(id);
  if (!employee) throw new NotFoundError("Employee not found");
  return employee;
};

export const createEmployee = async (employeeData, createdBy) => {
  // Enforce unique user_id (1 user = 1 employee profile)
  const existingUserLink = await employeesRepository.findByUserId(employeeData.user_id);
  if (existingUserLink) {
    throw new BusinessRuleError("This user is already linked to an employee profile");
  }

  // Enforce unique phone
  if (employeeData.phone) {
    const existingPhone = await employeesRepository.findByPhone(employeeData.phone);
    if (existingPhone) {
      throw new BusinessRuleError("An employee with this phone number already exists");
    }
  }

  const payload = {
    ...employeeData,
    status: employeeData.status || "active",
    created_by: createdBy,
  };

  const newEmployeeId = await employeesRepository.create(payload);
  return newEmployeeId;
};

export const updateEmployee = async (id, updateData, updatedBy) => {
  const employee = await employeesRepository.findById(id);
  if (!employee) throw new NotFoundError("Employee not found");

  // Check unique phone if being updated
  if (updateData.phone && updateData.phone !== employee.phone) {
    const existingPhone = await employeesRepository.findByPhone(updateData.phone);
    if (existingPhone) {
      throw new BusinessRuleError("An employee with this phone number already exists");
    }
  }

  const payload = {
    ...updateData,
    updated_by: updatedBy,
  };

  await employeesRepository.update(id, payload);
};

export const softDeleteEmployee = async (id, deletedBy) => {
  const employee = await employeesRepository.findById(id);
  if (!employee) throw new NotFoundError("Employee not found");

  await employeesRepository.update(id, { deleted_by: deletedBy, status: "terminated" });
  await employeesRepository.softDelete(id);
};
