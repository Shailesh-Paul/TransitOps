import ApiResponse from "../../core/ApiResponse.js";
import * as driversService from "./drivers.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const getAllDrivers = asyncHandler(async (req, res, next) => {
  const { page, limit, search, includeDeleted, validity, ...filters } = req.query;

    const result = await driversService.getAllDrivers({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      search: search || "",
      includeDeleted: includeDeleted === 'true',
      validity: validity,
      filters,
    });

    ApiResponse.sendPaginated(res, result);
});

export const getAvailableDrivers = asyncHandler(async (req, res, next) => {
  const available = await driversService.getAvailableDrivers();
  ApiResponse.send(res, available, "Available drivers retrieved");
});

export const getDriverById = asyncHandler(async (req, res, next) => {
  const driver = await driversService.getDriverById(req.params.id);
  ApiResponse.send(res, driver);
});

export const getDriverTimeline = asyncHandler(async (req, res, next) => {
  const timeline = await driversService.getDriverTimeline(req.params.id);
  ApiResponse.send(res, timeline, "Driver timeline retrieved");
});

export const createDriver = asyncHandler(async (req, res, next) => {
  const newDriverId = await driversService.createDriver(req.body, req.user.id);
  ApiResponse.send(res, { id: newDriverId }, "Driver profile created successfully", 201);
});

export const updateDriver = asyncHandler(async (req, res, next) => {
  await driversService.updateDriver(req.params.id, req.body, req.user.id);
  ApiResponse.send(res, null, "Driver profile updated successfully");
});

export const updateDriverStatus = asyncHandler(async (req, res, next) => {
  await driversService.updateDriverStatus(req.params.id, req.body.status, req.user.id);
  ApiResponse.send(res, null, "Driver status updated successfully");
});

export const archiveDriver = asyncHandler(async (req, res, next) => {
  await driversService.archiveDriver(req.params.id, req.user.id);
  ApiResponse.send(res, null, "Driver archived successfully", 204);
});

export const restoreDriver = asyncHandler(async (req, res, next) => {
  await driversService.restoreDriver(req.params.id, req.user.id);
  ApiResponse.send(res, null, "Driver restored successfully");
});
