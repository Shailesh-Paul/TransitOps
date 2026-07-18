import { NotFoundError, BusinessRuleError } from "../../core/errors.js";
import leavesRepository from "./leaves.repository.js";
import employeesRepository from "../employees/employees.repository.js";

export const getAllLeaves = async (options) => {
  return await leavesRepository.findAllWithDetails({
    page: options.page,
    limit: options.limit,
    status: options.filters?.status,
    employee_id: options.filters?.employee_id,
  });
};

export const getLeaveById = async (id) => {
  const leave = await leavesRepository.findDetailedById(id);
  if (!leave) throw new NotFoundError("Leave request not found");
  return leave;
};

export const createLeaveRequest = async (data, userId) => {
  // Determine if the user creating this is an employee or HR
  // For simplicity, we assume data.employee_id is provided, but in a real app
  // if an employee is logged in, we'd enforce their own employee_id.
  const employee = await employeesRepository.findById(data.employee_id);
  if (!employee) {
    throw new BusinessRuleError("Invalid employee ID.");
  }

  // Validate dates
  if (new Date(data.start_date) > new Date(data.end_date)) {
    throw new BusinessRuleError("Start date must be before end date.");
  }

  const payload = {
    ...data,
    status: "pending",
    created_by: userId,
  };

  const newRecordId = await leavesRepository.create(payload);
  return newRecordId;
};

export const updateLeaveStatus = async (id, status, updatedBy) => {
  const leave = await leavesRepository.findById(id);
  if (!leave) throw new NotFoundError("Leave request not found");

  const payload = {
    status,
    reviewed_by: updatedBy,
    updated_by: updatedBy,
  };

  await leavesRepository.update(id, payload);
};
