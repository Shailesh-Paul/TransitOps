import ApiResponse from "../../core/ApiResponse.js";
import * as vehiclesService from "./vehicles.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const getAllVehicles = asyncHandler(async (req, res, next) => {
  const { page, limit, sort, order, search, includeDeleted, ...filters } = req.query;

    const result = await vehiclesService.getAllVehicles({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      sort: sort || "created_at",
      order: order || "DESC",
      search: search || "",
      includeDeleted: includeDeleted === 'true',
      filters,
    });

    ApiResponse.sendPaginated(res, result);
});

export const getAvailableVehicles = asyncHandler(async (req, res, next) => {
  const available = await vehiclesService.getAvailable();
  ApiResponse.send(res, available, "Available vehicles retrieved");
});

export const getVehicleById = asyncHandler(async (req, res, next) => {
  const vehicle = await vehiclesService.getVehicleById(req.params.id);
    ApiResponse.send(res, vehicle);
});

export const getVehicleTimeline = asyncHandler(async (req, res, next) => {
  const timeline = await vehiclesService.getTimeline(req.params.id);
  ApiResponse.send(res, timeline, "Vehicle timeline retrieved");
});

export const getMaintenanceStats = asyncHandler(async (req, res, next) => {
  const stats = await vehiclesService.getMaintenanceStats(req.params.id);
  ApiResponse.send(res, stats, "Vehicle maintenance stats retrieved");
});

export const getFuelProfile = asyncHandler(async (req, res, next) => {
  const profile = await vehiclesService.getFuelProfile(req.params.id);
  ApiResponse.send(res, profile, "Vehicle fuel profile retrieved");
});

export const createVehicle = asyncHandler(async (req, res, next) => {
  const newVehicleId = await vehiclesService.createVehicle(req.body, req.user.id);
    ApiResponse.send(res, { id: newVehicleId }, "Vehicle registered successfully", 201);
});

export const updateVehicle = asyncHandler(async (req, res, next) => {
  await vehiclesService.updateVehicle(req.params.id, req.body, req.user.id);
    ApiResponse.send(res, null, "Vehicle updated successfully");
});

export const updateVehicleStatus = asyncHandler(async (req, res, next) => {
  await vehiclesService.updateStatus(req.params.id, req.body.status, req.user.id);
  ApiResponse.send(res, null, "Vehicle status updated successfully");
});

export const softDeleteVehicle = asyncHandler(async (req, res, next) => {
  await vehiclesService.softDeleteVehicle(req.params.id, req.user.id);
    ApiResponse.send(res, null, "Vehicle archived successfully", 204);
});

export const restoreVehicle = asyncHandler(async (req, res, next) => {
  await vehiclesService.restoreVehicle(req.params.id, req.user.id);
  ApiResponse.send(res, null, "Vehicle restored successfully");
});

export const retireVehicle = asyncHandler(async (req, res, next) => {
  await vehiclesService.retireVehicle(req.params.id, req.user.id);
  ApiResponse.send(res, null, "Vehicle retired successfully");
});
