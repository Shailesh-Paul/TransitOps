import ApiResponse from '../../core/ApiResponse.js';
import dashboardService from './dashboard.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const getDashboardData = asyncHandler(async (req, res, next) => {
  const { startDate, endDate } = req.query;
  const kpis = await dashboardService.getEnterpriseDashboard({ startDate, endDate });
  
  ApiResponse.send(res, kpis, "Enterprise dashboard KPIs retrieved successfully");
});
