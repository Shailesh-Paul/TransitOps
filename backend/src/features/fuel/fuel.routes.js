import express from "express";
import * as fuelController from "./fuel.controller.js";
import * as fuelValidation from "./fuel.validation.js";
import { validate } from "../../middleware/validate.middleware.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/rbac.middleware.js";
import { Permissions } from "../../constants/permissions.js";

const router = express.Router();

router.use(requireAuth);

/**
 * @openapi
 * /api/v1/fuel/dashboard:
 *   get:
 *     summary: Retrieve fuel dashboard analytics
 *     tags: [Fuel]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.get(
  "/dashboard",
  authorize(Permissions.FUEL.VIEW),
  fuelController.getFuelDashboard
);

/**
 * @openapi
 * /api/v1/fuel/enterprise/{scope}:
 *   get:
 *     summary: Retrieve enterprise fuel analytics by scope
 *     tags: [Fuel]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: scope
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.get(
  "/enterprise/:scope",
  authorize(Permissions.FUEL.VIEW),
  fuelController.getEnterpriseAnalytics
);

/**
 * @openapi
 * /api/v1/fuel:
 *   get:
 *     summary: Retrieve fuel logs
 *     tags: [Fuel]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: vehicle_id
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.get(
  "/",
  authorize(Permissions.FUEL.VIEW),
  fuelController.getAllFuelLogs
);

/**
 * @openapi
 * /api/v1/fuel/analytics/{vehicleId}:
 *   get:
 *     summary: Get monthly fuel analytics for a vehicle
 *     tags: [Fuel]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: vehicleId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.get(
  "/analytics/:vehicleId",
  authorize(Permissions.FUEL.VIEW),
  fuelController.getMonthlyAnalytics
);

/**
 * @openapi
 * /api/v1/fuel/validate:
 *   post:
 *     summary: Validate a fuel entry payload without saving
 *     tags: [Fuel]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Validation payload returned
 */
router.post(
  "/validate",
  authorize(Permissions.FUEL.CREATE),
  validate(fuelValidation.logFuelSchema),
  fuelController.validateFuel
);

/**
 * @openapi
 * /api/v1/fuel/{id}:
 *   get:
 *     summary: Get fuel log by ID
 *     tags: [Fuel]
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
  authorize(Permissions.FUEL.VIEW),
  fuelController.getFuelLogById
);

/**
 * @openapi
 * /api/v1/fuel:
 *   post:
 *     summary: Log a fuel entry and calculate efficiency
 *     tags: [Fuel]
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
 *               liters:
 *                 type: number
 *               cost:
 *                 type: number
 *               odometer_reading:
 *                 type: number
 *               station:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Successful operation
 */
router.post(
  "/",
  authorize(Permissions.FUEL.CREATE),
  validate(fuelValidation.logFuelSchema),
  fuelController.logFuel
);

/**
 * @openapi
 * /api/v1/fuel/{id}:
 *   put:
 *     summary: Update a fuel log (restricted fields only)
 *     tags: [Fuel]
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
 *               station:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.put(
  "/:id",
  authorize(Permissions.FUEL.UPDATE),
  validate(fuelValidation.updateFuelLogSchema),
  fuelController.updateFuelLog
);

/**
 * @openapi
 * /api/v1/fuel/{id}:
 *   delete:
 *     summary: Delete a fuel log
 *     tags: [Fuel]
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
  authorize(Permissions.FUEL.DELETE),
  fuelController.deleteFuelLog
);

export default router;
