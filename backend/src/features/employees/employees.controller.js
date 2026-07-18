import ApiResponse from "../../core/ApiResponse.js";
import * as employeesService from "./employees.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const getAllEmployees = asyncHandler(async (req, res, next) => {
  const { page, limit, search, ...filters } = req.query;

    const result = await employeesService.getAllEmployees({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      search: search || "",
      filters,
    });

    ApiResponse.sendPaginated(res, result);
});

export const getEmployeeById = asyncHandler(async (req, res, next) => {
  const employee = await employeesService.getEmployeeById(req.params.id);
    ApiResponse.send(res, employee);
});

export const createEmployee = asyncHandler(async (req, res, next) => {
  const newEmployeeId = await employeesService.createEmployee(req.body, req.user.id);
    ApiResponse.send(res, { id: newEmployeeId }, "Employee profile created successfully", 201);
});

export const updateEmployee = asyncHandler(async (req, res, next) => {
  await employeesService.updateEmployee(req.params.id, req.body, req.user.id);
    ApiResponse.send(res, null, "Employee profile updated successfully");
});

export const softDeleteEmployee = asyncHandler(async (req, res, next) => {
  await employeesService.softDeleteEmployee(req.params.id, req.user.id);
    ApiResponse.send(res, null, null, 204);
});
