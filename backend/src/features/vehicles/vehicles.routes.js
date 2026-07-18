import express from "express";
import * as vehiclesController from "./vehicles.controller.js";
import * as vehiclesValidation from "./vehicles.validation.js";
import { validate } from "../../middleware/validate.middleware.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/rbac.middleware.js";
import { Permissions } from "../../constants/permissions.js";

const router = express.Router();

router.use(requireAuth);

/**
 * @openapi
 * /api/v1/vehicles/available:
 *   get:
 *     summary: Retrieve available vehicles
 *     tags: [Vehicles]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.get(
  "/available",
  authorize(Permissions.VEHICLE.VIEW),
  vehiclesController.getAvailableVehicles
);

/**
 * @openapi
 * /api/v1/vehicles:
 *   get:
 *     summary: Retrieve vehicles entry
 *     tags: [Vehicles]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.get(
  "/",
  authorize(Permissions.VEHICLE.VIEW),
  vehiclesController.getAllVehicles
);

/**
 * @openapi
 * /api/v1/vehicles/{id}:
 *   get:
 *     summary: Get vehicle by ID
 *     tags: [Vehicles]
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
  authorize(Permissions.VEHICLE.VIEW),
  vehiclesController.getVehicleById
);

/**
 * @openapi
 * /api/v1/vehicles/{id}/maintenance-stats:
 *   get:
 *     summary: Get maintenance statistics for a specific vehicle
 *     tags: [Vehicles]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.get(
  "/:id/maintenance-stats",
  authorize(Permissions.VEHICLE.VIEW),
  vehiclesController.getMaintenanceStats
);

/**
 * @openapi
 * /api/v1/vehicles/{id}/timeline:
 *   get:
 *     summary: Get chronological history of vehicle
 *     tags: [Vehicles]
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
  authorize(Permissions.VEHICLE.VIEW),
  vehiclesController.getVehicleTimeline
);

/**
 * @openapi
 * /api/v1/vehicles/{id}/fuel-profile:
 *   get:
 *     summary: Get enterprise fuel history profile for a vehicle
 *     tags: [Vehicles]
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
  "/:id/fuel-profile",
  authorize(Permissions.VEHICLE.VIEW),
  vehiclesController.getFuelProfile
);

/**
 * @openapi
 * /api/v1/vehicles:
 *   post:
 *     summary: Register a new vehicle
 *     tags: [Vehicles]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               registration_number:
 *                 type: string
 *               make:
 *                 type: string
 *               model:
 *                 type: string
 *               year:
 *                 type: number
 *               capacity:
 *                 type: number
 *               current_location:
 *                 type: string
 *               insurance_expiry:
 *                 type: string
 *                 format: date
 *               registration_expiry:
 *                 type: string
 *                 format: date
 *               puc_expiry:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Successful operation
 */
router.post(
  "/",
  authorize(Permissions.VEHICLE.CREATE),
  validate(vehiclesValidation.createVehicleSchema),
  vehiclesController.createVehicle
);

/**
 * @openapi
 * /api/v1/vehicles/{id}:
 *   put:
 *     summary: Update vehicle details
 *     tags: [Vehicles]
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
 *               registration_number:
 *                 type: string
 *               make:
 *                 type: string
 *               model:
 *                 type: string
 *               year:
 *                 type: number
 *               capacity:
 *                 type: number
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.put(
  "/:id",
  authorize(Permissions.VEHICLE.UPDATE),
  validate(vehiclesValidation.updateVehicleSchema),
  vehiclesController.updateVehicle
);

/**
 * @openapi
 * /api/v1/vehicles/{id}/status:
 *   patch:
 *     summary: Update vehicle status
 *     tags: [Vehicles]
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
 *                 enum: [active, maintenance, retired]
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.patch(
  "/:id/status",
  authorize(Permissions.VEHICLE.UPDATE),
  validate(vehiclesValidation.updateVehicleStatusSchema),
  vehiclesController.updateVehicleStatus
);

/**
 * @openapi
 * /api/v1/vehicles/{id}/archive:
 *   put:
 *     summary: Soft delete / archive a vehicle
 *     tags: [Vehicles]
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
  authorize(Permissions.VEHICLE.DELETE),
  vehiclesController.softDeleteVehicle
);

/**
 * @openapi
 * /api/v1/vehicles/{id}/restore:
 *   put:
 *     summary: Restore an archived vehicle
 *     tags: [Vehicles]
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
  authorize(Permissions.VEHICLE.DELETE),
  vehiclesController.restoreVehicle
);

/**
 * @openapi
 * /api/v1/vehicles/{id}/retire:
 *   put:
 *     summary: Retire a vehicle permanently
 *     tags: [Vehicles]
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
  "/:id/retire",
  authorize(Permissions.VEHICLE.UPDATE),
  vehiclesController.retireVehicle
);

export default router;
