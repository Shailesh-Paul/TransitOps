import ApiResponse from "../../core/ApiResponse.js";
import expensesService from "./expenses.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import ApprovalEngine from "../../core/ApprovalEngine.js";

export const getAllExpenses = asyncHandler(async (req, res, next) => {
  const { page, limit, vehicle_id, driver_id, category, status } = req.query;
  const result = await expensesService.getAllExpenses({
    page: page ? parseInt(page) : 1,
    limit: limit ? parseInt(limit) : 10,
    vehicle_id,
    driver_id,
    category,
    status
  });
  ApiResponse.sendPaginated(res, result);
});

export const getExpenseById = asyncHandler(async (req, res, next) => {
  const expense = await expensesService.getExpenseById(req.params.id);
  ApiResponse.send(res, expense);
});

export const logExpense = asyncHandler(async (req, res, next) => {
  const result = await expensesService.logExpense(req.body, req.user.id);
  ApiResponse.send(res, result, "Expense logged successfully", 201);
});

export const updateExpenseStatus = asyncHandler(async (req, res, next) => {
  const updatedExpense = await expensesService.updateExpenseStatus(req.params.id, req.body.status, req.user.id);
  ApiResponse.send(res, updatedExpense, `Expense marked as ${req.body.status}`);
});

export const updateExpense = asyncHandler(async (req, res, next) => {
  const updatedExpense = await expensesService.updateExpense(req.params.id, req.body, req.user.id);
  ApiResponse.send(res, updatedExpense, "Expense updated successfully");
});

export const deleteExpense = asyncHandler(async (req, res, next) => {
  await expensesService.deleteExpense(req.params.id, req.user.id);
  ApiResponse.send(res, null, "Expense deleted successfully");
});

export const getOperationalCosts = asyncHandler(async (req, res, next) => {
  const { startDate, endDate } = req.query;
  const analytics = await expensesService.getOperationalCosts({ startDate, endDate });
  ApiResponse.send(res, analytics, "Operational costs retrieved successfully");
});

export const getDashboardKpis = asyncHandler(async (req, res, next) => {
  const kpis = await expensesService.getDashboardKpis(req.query);
  ApiResponse.send(res, kpis, "Financial dashboard KPIs retrieved successfully");
});

export const submitExpense = asyncHandler(async (req, res, next) => {
  const result = await ApprovalEngine.submit('expense', req.params.id, req.user.id, req.body.comments);
  ApiResponse.send(res, result, "Expense submitted for approval");
});

export const approveExpense = asyncHandler(async (req, res, next) => {
  const result = await ApprovalEngine.approve('expense', req.params.id, req.user.id, req.body.comments);
  ApiResponse.send(res, result, "Expense approved");
});

export const rejectExpense = asyncHandler(async (req, res, next) => {
  const result = await ApprovalEngine.reject('expense', req.params.id, req.user.id, req.body.reason, req.body.comments);
  ApiResponse.send(res, result, "Expense rejected");
});

export const postExpense = asyncHandler(async (req, res, next) => {
  const result = await ApprovalEngine.post('expense', req.params.id, req.user.id, req.body.comments);
  ApiResponse.send(res, result, "Expense posted");
});

export const archiveExpense = asyncHandler(async (req, res, next) => {
  const result = await ApprovalEngine.archive('expense', req.params.id, req.user.id, req.body.comments);
  ApiResponse.send(res, result, "Expense archived");
});
