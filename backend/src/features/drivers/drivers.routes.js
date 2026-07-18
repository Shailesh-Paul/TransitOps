import express from "express";
import * as driversController from "./drivers.controller.js";
import * as driversValidation from "./drivers.validation.js";
import { validate } from "../../middleware/validate.middleware.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/rbac.middleware.js";
import { Permissions } from "../../constants/permissions.js";

const router = express.Router();

router.use(requireAuth);

/**
 * @openapi
 * /api/v1/drivers/available:
 *   get:
 *     summary: Retrieve available drivers
 *     tags: [Drivers]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.get(
  "/available",
  authorize(Permissions.DRIVER.VIEW),
  driversController.getAvailableDrivers
);

/**
 * @openapi
 * /api/v1/drivers:
 *   get:
 *     summary: Retrieve drivers entry
 *     tags: [Drivers]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.get(
  "/",
  authorize(Permissions.DRIVER.VIEW),
  driversController.getAllDrivers
);

/**
 * @openapi
 * /api/v1/drivers/{id}:
 *   get:
 *     summary: Get driver by ID
 *     tags: [Drivers]
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
  authorize(Permissions.DRIVER.VIEW),
  driversController.getDriverById
);

/**
 * @openapi
 * /api/v1/drivers/{id}/timeline:
 *   get:
 *     summary: Get chronological history of driver
 *     tags: [Drivers]
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
  "/:id/timeline",
  authorize(Permissions.DRIVER.VIEW),
  driversController.getDriverTimeline
);

/**
 * @openapi
 * /api/v1/drivers:
 *   post:
 *     summary: Register a new driver
 *     tags: [Drivers]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               employee_id:
 *                 type: string
 *               license_number:
 *                 type: string
 *               license_expiry:
 *                 type: string
 *                 format: date
 *               safety_score:
 *                 type: number
 *               emergency_contact:
 *                 type: string
 *     responses:
 *       201:
 *         description: Successful operation
 */
router.post(
  "/",
  authorize(Permissions.DRIVER.CREATE),
  validate(driversValidation.createDriverSchema),
  driversController.createDriver
);

/**
 * @openapi
 * /api/v1/drivers/{id}:
 *   put:
 *     summary: Update driver details
 *     tags: [Drivers]
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
 *               license_number:
 *                 type: string
 *               license_expiry:
 *                 type: string
 *                 format: date
 *               safety_score:
 *                 type: number
 *               emergency_contact:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.put(
  "/:id",
  authorize(Permissions.DRIVER.UPDATE),
  validate(driversValidation.updateDriverSchema),
  driversController.updateDriver
);

/**
 * @openapi
 * /api/v1/drivers/{id}/status:
 *   patch:
 *     summary: Update driver status
 *     tags: [Drivers]
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
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Available, On Trip, Off Duty, Suspended, Retired]
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.patch(
  "/:id/status",
  authorize(Permissions.DRIVER.UPDATE),
  validate(driversValidation.updateDriverStatusSchema),
  driversController.updateDriverStatus
);

/**
 * @openapi
 * /api/v1/drivers/{id}/archive:
 *   put:
 *     summary: Soft delete / archive a driver
 *     tags: [Drivers]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Successful operation
 */
router.put(
  "/:id/archive",
  authorize(Permissions.DRIVER.DELETE),
  driversController.archiveDriver
);

/**
 * @openapi
 * /api/v1/drivers/{id}/restore:
 *   put:
 *     summary: Restore an archived driver
 *     tags: [Drivers]
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
router.put(
  "/:id/restore",
  authorize(Permissions.DRIVER.DELETE),
  driversController.restoreDriver
);

export default router;
