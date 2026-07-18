import ApiResponse from "../../core/ApiResponse.js";
import * as tripsService from "./trips.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const getAllTrips = asyncHandler(async (req, res, next) => {
  const { page, limit, sort, order, ...filters } = req.query;

  const result = await tripsService.getAllTrips({
    page: page ? parseInt(page) : 1,
    limit: limit ? parseInt(limit) : 10,
    filters,
  });

  ApiResponse.sendPaginated(res, result);
});

export const getTripById = asyncHandler(async (req, res, next) => {
  const trip = await tripsService.getTripById(req.params.id);
  ApiResponse.send(res, trip);
});

export const createTrip = asyncHandler(async (req, res, next) => {
  const newTripId = await tripsService.createTrip(req.body, req.user.id);
  ApiResponse.send(res, { id: newTripId }, "Draft trip created successfully", 201);
});

export const assignDriver = asyncHandler(async (req, res, next) => {
  await tripsService.assignDriver(req.params.id, req.body.driver_id, req.user.id);
  ApiResponse.send(res, null, "Driver assigned successfully");
});

export const assignVehicle = asyncHandler(async (req, res, next) => {
  await tripsService.assignVehicle(req.params.id, req.body.vehicle_id, req.user.id);
  ApiResponse.send(res, null, "Vehicle assigned successfully");
});

export const dispatchTrip = asyncHandler(async (req, res, next) => {
  await tripsService.dispatchTrip(req.params.id, req.user.id);
  ApiResponse.send(res, null, "Trip dispatched successfully");
});

export const startTrip = asyncHandler(async (req, res, next) => {
  await tripsService.startTrip(req.params.id, req.user.id);
  ApiResponse.send(res, null, "Trip started successfully");
});

export const completeTrip = asyncHandler(async (req, res, next) => {
  await tripsService.completeTrip(req.params.id, req.body, req.user.id);
  ApiResponse.send(res, null, "Trip completed successfully");
});

export const cancelTrip = asyncHandler(async (req, res, next) => {
  await tripsService.cancelTrip(req.params.id, req.body, req.user.id);
  ApiResponse.send(res, null, "Trip cancelled successfully");
});

export const terminateTrip = asyncHandler(async (req, res, next) => {
  await tripsService.terminateTrip(req.params.id, req.body, req.user.id);
  ApiResponse.send(res, null, "Trip terminated successfully");
});

export const updateTrip = asyncHandler(async (req, res, next) => {
  await tripsService.updateTrip(req.params.id, req.body, req.user.id);
  ApiResponse.send(res, null, "Trip updated successfully");
});
