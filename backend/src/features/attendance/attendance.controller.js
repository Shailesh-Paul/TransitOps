import ApiResponse from "../../core/ApiResponse.js";
import * as attendanceService from "./attendance.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const getAllAttendance = asyncHandler(async (req, res, next) => {
  const { page, limit, ...filters } = req.query;

    const result = await attendanceService.getAllAttendance({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      filters,
    });

    ApiResponse.sendPaginated(res, result);
});

export const getAttendanceById = asyncHandler(async (req, res, next) => {
  const record = await attendanceService.getAttendanceById(req.params.id);
    ApiResponse.send(res, record);
});

// Convenience endpoint for the logged-in user
export const clockIn = asyncHandler(async (req, res, next) => {
  const newRecordId = await attendanceService.clockIn(req.user.id);
    ApiResponse.send(res, { id: newRecordId }, "Successfully clocked in for today.", 201);
});

// Convenience endpoint for the logged-in user
export const clockOut = asyncHandler(async (req, res, next) => {
  await attendanceService.clockOut(req.user.id);
    ApiResponse.send(res, null, "Successfully clocked out.");
});

// HR override endpoint
export const createManualRecord = asyncHandler(async (req, res, next) => {
  const newRecordId = await attendanceService.createManualRecord(req.body, req.user.id);
    ApiResponse.send(res, { id: newRecordId }, "Attendance record created manually.", 201);
});

// HR override endpoint
export const updateAttendance = asyncHandler(async (req, res, next) => {
  await attendanceService.updateAttendance(req.params.id, req.body, req.user.id);
    ApiResponse.send(res, null, "Attendance record updated successfully");
});
