import ApiResponse from "../../core/ApiResponse.js";
import maintenanceService from "./maintenance.service.js";
import maintenanceAnalyticsService from "./maintenanceAnalytics.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const getMaintenanceRecords = asyncHandler(async (req, res, next) => {
  const { page, limit, sort, order, ...filters } = req.query;
  const result = await maintenanceService.getMaintenanceRecords({
    page: page ? parseInt(page) : 1,
    limit: limit ? parseInt(limit) : 10,
    filters,
  });
  ApiResponse.sendPaginated(res, result);
});

export const getAnalytics = asyncHandler(async (req, res, next) => {
  const filters = req.query;
  const analytics = await maintenanceAnalyticsService.getAnalytics(filters);
  ApiResponse.send(res, analytics);
});

export const getRecordById = asyncHandler(async (req, res, next) => {
  const record = await maintenanceService.getRecordById(req.params.id);
  ApiResponse.send(res, record);
});

export const getComprehensiveDetails = asyncHandler(async (req, res, next) => {
  const details = await maintenanceService.getComprehensiveDetails(req.params.id);
  ApiResponse.send(res, details);
});

export const getQueue = asyncHandler(async (req, res, next) => {
  const queue = await maintenanceService.getQueue();
  ApiResponse.send(res, queue);
});

export const requestMaintenance = asyncHandler(async (req, res, next) => {
  const newId = await maintenanceService.requestMaintenance(req.body, req.user.id);
  ApiResponse.send(res, { id: newId }, "Maintenance requested successfully", 201);
});

export const queueMaintenance = asyncHandler(async (req, res, next) => {
  await maintenanceService.queueMaintenance(req.params.id, req.user.id);
  ApiResponse.send(res, null, "Maintenance moved to workshop queue");
});

export const startMaintenance = asyncHandler(async (req, res, next) => {
  await maintenanceService.startMaintenance(req.params.id, req.user.id);
  ApiResponse.send(res, null, "Maintenance started successfully");
});

export const completeMaintenance = asyncHandler(async (req, res, next) => {
  await maintenanceService.completeMaintenance(req.params.id, req.body, req.user.id);
  ApiResponse.send(res, null, "Maintenance completed successfully");
});

export const cancelMaintenance = asyncHandler(async (req, res, next) => {
  await maintenanceService.cancelMaintenance(req.params.id, req.user.id);
  ApiResponse.send(res, null, "Maintenance cancelled successfully");
});

export const updateProgress = asyncHandler(async (req, res, next) => {
  const result = await maintenanceService.updateProgress(req.params.id, req.body, req.user.id);
  ApiResponse.send(res, result);
});

export const getDashboardKpis = asyncHandler(async (req, res, next) => {
  const kpis = await maintenanceService.getDashboardKpis();
  ApiResponse.send(res, kpis);
});

export const updateRecord = asyncHandler(async (req, res, next) => {
  const updatedRecord = await maintenanceService.updateRecord(req.params.id, req.body, req.user.id);
  ApiResponse.send(res, updatedRecord, "Maintenance record updated successfully");
});

export const deleteRecord = asyncHandler(async (req, res, next) => {
  await maintenanceService.deleteRecord(req.params.id);
  ApiResponse.send(res, null, "Maintenance record deleted successfully");
});
