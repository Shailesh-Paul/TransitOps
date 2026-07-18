import ApiResponse from "../../core/ApiResponse.js";
import * as leavesService from "./leaves.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const getAllLeaves = asyncHandler(async (req, res, next) => {
  const { page, limit, ...filters } = req.query;

    const result = await leavesService.getAllLeaves({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      filters,
    });

    ApiResponse.sendPaginated(res, result);
});

export const getLeaveById = asyncHandler(async (req, res, next) => {
  const leave = await leavesService.getLeaveById(req.params.id);
    ApiResponse.send(res, leave);
});

export const createLeaveRequest = asyncHandler(async (req, res, next) => {
  const newLeaveId = await leavesService.createLeaveRequest(req.body, req.user.id);
    ApiResponse.send(res, { id: newLeaveId }, "Leave request submitted successfully", 201);
});

export const updateLeaveStatus = asyncHandler(async (req, res, next) => {
  await leavesService.updateLeaveStatus(req.params.id, req.body.status, req.user.id);
    ApiResponse.send(res, null, `Leave request ${req.body.status}`);
});
