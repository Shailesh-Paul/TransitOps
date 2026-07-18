import ApiResponse from "../../core/ApiResponse.js";
import FinancialAnalyticsEngine from "../../core/FinancialAnalyticsEngine.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const getKpis = asyncHandler(async (req, res, next) => {
  const data = await FinancialAnalyticsEngine.getKpis(req.query);
  ApiResponse.send(res, data, "Financial KPIs retrieved successfully");
});

export const getVehicleAnalytics = asyncHandler(async (req, res, next) => {
  const data = await FinancialAnalyticsEngine.getVehicleAnalytics(req.query);
  ApiResponse.send(res, data, "Vehicle Analytics retrieved successfully");
});

export const getDriverAnalytics = asyncHandler(async (req, res, next) => {
  const data = await FinancialAnalyticsEngine.getDriverAnalytics(req.query);
  ApiResponse.send(res, data, "Driver Analytics retrieved successfully");
});

export const getBudgetAnalytics = asyncHandler(async (req, res, next) => {
  const data = await FinancialAnalyticsEngine.getBudgetAnalytics(req.query);
  ApiResponse.send(res, data, "Budget Analytics retrieved successfully");
});

export const getMonthlyAnalytics = asyncHandler(async (req, res, next) => {
  const data = await FinancialAnalyticsEngine.getMonthlyAnalytics(req.query);
  ApiResponse.send(res, data, "Monthly Analytics retrieved successfully");
});

export const getRankings = asyncHandler(async (req, res, next) => {
  const data = await FinancialAnalyticsEngine.getRankings(req.query);
  ApiResponse.send(res, data, "Rankings retrieved successfully");
});
