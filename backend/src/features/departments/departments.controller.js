import ApiResponse from "../../core/ApiResponse.js";
import * as departmentsService from "./departments.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const getAllDepartments = asyncHandler(async (req, res, next) => {
  const { page, limit, sort, order, search, ...filters } = req.query;

    const result = await departmentsService.getAllDepartments({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      sort: sort || "name",
      order: order || "ASC",
      search: search || "",
      filters,
    });

    ApiResponse.sendPaginated(res, result);
});

export const getDepartmentById = asyncHandler(async (req, res, next) => {
  const department = await departmentsService.getDepartmentById(req.params.id);
    ApiResponse.send(res, department);
});

export const createDepartment = asyncHandler(async (req, res, next) => {
  const newDepartmentId = await departmentsService.createDepartment(req.body, req.user.id);
    ApiResponse.send(res, { id: newDepartmentId }, "Department created successfully", 201);
});

export const updateDepartment = asyncHandler(async (req, res, next) => {
  await departmentsService.updateDepartment(req.params.id, req.body, req.user.id);
    ApiResponse.send(res, null, "Department updated successfully");
});

export const softDeleteDepartment = asyncHandler(async (req, res, next) => {
  await departmentsService.softDeleteDepartment(req.params.id, req.user.id);
    ApiResponse.send(res, null, null, 204);
});
