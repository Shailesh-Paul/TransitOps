import express from "express";
import * as expensesController from "./expenses.controller.js";
import * as expensesValidation from "./expenses.validation.js";
import { validate } from "../../middleware/validate.middleware.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/rbac.middleware.js";
import { Permissions } from "../../constants/permissions.js";

const router = express.Router();

router.use(requireAuth);

/**
 * @openapi
 * /api/v1/expenses:
 *   get:
 *     summary: Retrieve expenses
 *     tags: [Expenses]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: vehicle_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: driver_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [Maintenance, Toll, Parking, Insurance, Miscellaneous]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Pending, Cleared, Rejected]
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.get(
  "/",
  authorize(Permissions.EXPENSE.VIEW),
  expensesController.getAllExpenses
);

/**
 * @openapi
 * /api/v1/expenses/operational-costs:
 *   get:
 *     summary: Retrieve operational cost analytics
 *     tags: [Expenses]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.get(
  "/operational-costs",
  authorize(Permissions.EXPENSE.VIEW),
  expensesController.getOperationalCosts
);

/**
 * @openapi
 * /api/v1/expenses/dashboard-kpis:
 *   get:
 *     summary: Retrieve financial dashboard KPIs
 *     tags: [Expenses]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.get(
  "/dashboard-kpis",
  authorize(Permissions.EXPENSE.VIEW),
  expensesController.getDashboardKpis
);

/**
 * @openapi
 * /api/v1/expenses/{id}:
 *   get:
 *     summary: Get expense by ID
 *     tags: [Expenses]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.get(
  "/:id",
  authorize(Permissions.EXPENSE.VIEW),
  expensesController.getExpenseById
);

/**
 * @openapi
 * /api/v1/expenses:
 *   post:
 *     summary: Log a new expense
 *     tags: [Expenses]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               vehicle_id:
 *                 type: string
 *               driver_id:
 *                 type: string
 *               trip_id:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [Maintenance, Toll, Parking, Insurance, Miscellaneous]
 *               description:
 *                 type: string
 *               amount:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [Pending, Cleared, Rejected]
 *               date:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Successful operation
 */
router.post(
  "/",
  authorize(Permissions.EXPENSE.CREATE),
  validate(expensesValidation.logExpenseSchema),
  expensesController.logExpense
);

/**
 * @openapi
 * /api/v1/expenses/{id}/status:
 *   put:
 *     summary: Update expense status (Pending, Cleared, Rejected)
 *     tags: [Expenses]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Pending, Cleared, Rejected]
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.put(
  "/:id/status",
  authorize(Permissions.EXPENSE.UPDATE),
  validate(expensesValidation.updateExpenseStatusSchema),
  expensesController.updateExpenseStatus
);

/**
 * @openapi
 * /api/v1/expenses/{id}:
 *   put:
 *     summary: Update an expense (restricted fields only)
 *     tags: [Expenses]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.put(
  "/:id",
  authorize(Permissions.EXPENSE.UPDATE),
  validate(expensesValidation.updateExpenseSchema),
  expensesController.updateExpense
);

/**
 * @openapi
 * /api/v1/expenses/{id}:
 *   delete:
 *     summary: Delete an expense
 *     tags: [Expenses]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.delete(
  "/:id",
  authorize(Permissions.EXPENSE.DELETE),
  expensesController.deleteExpense
);

// --- APPROVAL ENGINE ROUTES ---

router.post(
  "/:id/submit",
  authorize(Permissions.FINANCE.SUBMIT),
  expensesController.submitExpense
);

router.post(
  "/:id/approve",
  authorize(Permissions.FINANCE.APPROVE),
  expensesController.approveExpense
);

router.post(
  "/:id/reject",
  authorize(Permissions.FINANCE.REJECT),
  expensesController.rejectExpense
);

router.post(
  "/:id/post",
  authorize(Permissions.FINANCE.POST),
  expensesController.postExpense
);

router.post(
  "/:id/archive",
  authorize(Permissions.FINANCE.ARCHIVE),
  expensesController.archiveExpense
);

export default router;
