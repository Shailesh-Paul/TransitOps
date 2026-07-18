import ApiResponse from "../../core/ApiResponse.js";
import fuelService from "./fuel.service.js";
import fuelAnalyticsService from "./fuelAnalytics.service.js";
import FuelValidationEngine from "../../core/FuelValidationEngine.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const getAllFuelLogs = asyncHandler(async (req, res, next) => {
  const { page, limit, vehicle_id, startDate, endDate, fuelType, station, search, driver_id } = req.query;
  const result = await fuelService.getAllLogs({
    page: page ? parseInt(page) : 1,
    limit: limit ? parseInt(limit) : 10,
    vehicle_id,
    startDate,
    endDate,
    fuelType,
    station,
    search,
    driver_id
  });
  ApiResponse.sendPaginated(res, result);
});

export const getFuelLogById = asyncHandler(async (req, res, next) => {
  const log = await fuelService.getLogById(req.params.id);
  ApiResponse.send(res, log);
});

export const logFuel = asyncHandler(async (req, res, next) => {
  const result = await fuelService.logFuel(req.body, req.user.id);
  ApiResponse.send(res, result, "Fuel logged successfully", 201);
});

export const updateFuelLog = asyncHandler(async (req, res, next) => {
  const updatedLog = await fuelService.updateLog(req.params.id, req.body, req.user.id);
  ApiResponse.send(res, updatedLog, "Fuel log updated successfully");
});

export const deleteFuelLog = asyncHandler(async (req, res, next) => {
  await fuelService.deleteLog(req.params.id, req.user.id);
  ApiResponse.send(res, null, "Fuel log deleted successfully");
});

export const getMonthlyAnalytics = asyncHandler(async (req, res, next) => {
  const analytics = await fuelService.getMonthlyAnalytics(req.params.vehicleId);
  ApiResponse.send(res, analytics, "Analytics retrieved successfully");
});

export const getFuelDashboard = asyncHandler(async (req, res, next) => {
  const data = await fuelAnalyticsService.getDashboardData(req.query);
  ApiResponse.send(res, data, "Dashboard data retrieved successfully");
});

export const getEnterpriseAnalytics = asyncHandler(async (req, res, next) => {
  const data = await fuelAnalyticsService.getEnterpriseData(req.params.scope, req.query);
  ApiResponse.send(res, data, "Enterprise Analytics data retrieved successfully");
});

export const validateFuel = asyncHandler(async (req, res, next) => {
  const validation = await FuelValidationEngine.validate(req.body);
  ApiResponse.send(res, validation, "Fuel validation complete");
});
