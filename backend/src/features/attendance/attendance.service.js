import { NotFoundError, AuthorizationError, BusinessRuleError } from "../../core/errors.js";
import attendanceRepository from "./attendance.repository.js";
import employeesRepository from "../employees/employees.repository.js";

export const getAllAttendance = async (options) => {
  return await attendanceRepository.findAllWithDetails({
    page: options.page,
    limit: options.limit,
    status: options.filters?.status,
    employee_id: options.filters?.employee_id,
    date: options.filters?.date,
  });
};

export const getAttendanceById = async (id) => {
  const record = await attendanceRepository.findDetailedById(id);
  if (!record) throw new NotFoundError("Attendance record not found");
  return record;
};

export const clockIn = async (userId) => {
  // 1. Find the employee associated with this user
  const employee = await employeesRepository.findByUserId(userId);
  if (!employee) {
    throw new AuthorizationError("Only employees can clock in.");
  }

  const today = new Date().toISOString().slice(0, 10);
  
  // 2. Ensure they haven't already clocked in today
  const existingRecord = await attendanceRepository.findByEmployeeAndDate(employee.id, today);
  if (existingRecord) {
    throw new BusinessRuleError("You have already clocked in today.");
  }

  const payload = {
    employee_id: employee.id,
    date: today,
    clock_in: new Date().toISOString().slice(0, 19).replace('T', ' '),
    status: "present",
    created_by: userId,
  };

  const newRecordId = await attendanceRepository.create(payload);
  return newRecordId;
};

export const clockOut = async (userId) => {
  const employee = await employeesRepository.findByUserId(userId);
  if (!employee) {
    throw new AuthorizationError("Only employees can clock out.");
  }

  const today = new Date().toISOString().slice(0, 10);
  
  const existingRecord = await attendanceRepository.findByEmployeeAndDate(employee.id, today);
  if (!existingRecord) {
    throw new BusinessRuleError("You must clock in before you can clock out.");
  }

  if (existingRecord.clock_out) {
    throw new BusinessRuleError("You have already clocked out today.");
  }

  const payload = {
    clock_out: new Date().toISOString().slice(0, 19).replace('T', ' '),
    updated_by: userId,
  };

  await attendanceRepository.update(existingRecord.id, payload);
};

export const createManualRecord = async (data, createdBy) => {
  const existingRecord = await attendanceRepository.findByEmployeeAndDate(data.employee_id, data.date);
  if (existingRecord) {
    throw new BusinessRuleError("An attendance record for this employee on this date already exists.");
  }

  const payload = {
    ...data,
    created_by: createdBy,
  };
  return await attendanceRepository.create(payload);
};

export const updateAttendance = async (id, updateData, updatedBy) => {
  const record = await attendanceRepository.findById(id);
  if (!record) throw new NotFoundError("Attendance record not found");

  const payload = {
    ...updateData,
    updated_by: updatedBy,
  };

  await attendanceRepository.update(id, payload);
};
