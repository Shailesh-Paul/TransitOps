import express from "express";
import * as tripsController from "./trips.controller.js";
import * as tripsValidation from "./trips.validation.js";
import { validate } from "../../middleware/validate.middleware.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/rbac.middleware.js";
import { Permissions } from "../../constants/permissions.js";

const router = express.Router();

router.use(requireAuth);

/**
 * @openapi
 * /api/v1/trips:
 *   get:
 *     summary: Retrieve trips
 *     tags: [Trips]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.get(
  "/",
  authorize(Permissions.TRIP.VIEW),
  tripsController.getAllTrips
);

/**
 * @openapi
 * /api/v1/trips/{id}:
 *   get:
 *     summary: Get trip by ID
 *     tags: [Trips]
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
  authorize(Permissions.TRIP.VIEW),
  tripsController.getTripById
);

/**
 * @openapi
 * /api/v1/trips:
 *   post:
 *     summary: Create a Draft trip
 *     tags: [Trips]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               route_id:
 *                 type: string
 *               vehicle_id:
 *                 type: string
 *               driver_id:
 *                 type: string
 *               start_time:
 *                 type: string
 *                 format: date-time
 *               end_time:
 *                 type: string
 *                 format: date-time
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Successful operation
 */
router.post(
  "/",
  authorize(Permissions.TRIP.CREATE),
  validate(tripsValidation.createTripSchema),
  tripsController.createTrip
);

/**
 * @openapi
 * /api/v1/trips/{id}/assign-driver:
 *   patch:
 *     summary: Assign a driver to the trip
 *     tags: [Trips]
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
 *               driver_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.patch(
  "/:id/assign-driver",
  authorize(Permissions.TRIP.UPDATE),
  validate(tripsValidation.assignDriverSchema),
  tripsController.assignDriver
);

/**
 * @openapi
 * /api/v1/trips/{id}/assign-vehicle:
 *   patch:
 *     summary: Assign a vehicle to the trip
 *     tags: [Trips]
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
 *               vehicle_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.patch(
  "/:id/assign-vehicle",
  authorize(Permissions.TRIP.UPDATE),
  validate(tripsValidation.assignVehicleSchema),
  tripsController.assignVehicle
);

/**
 * @openapi
 * /api/v1/trips/{id}/dispatch:
 *   post:
 *     summary: Dispatch the trip (Validates rules)
 *     tags: [Trips]
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
router.post(
  "/:id/dispatch",
  authorize(Permissions.TRIP.UPDATE),
  tripsController.dispatchTrip
);

/**
 * @openapi
 * /api/v1/trips/{id}/start:
 *   post:
 *     summary: Start the dispatched trip
 *     tags: [Trips]
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
router.post(
  "/:id/start",
  authorize(Permissions.TRIP.UPDATE),
  tripsController.startTrip
);

/**
 * @openapi
 * /api/v1/trips/{id}/complete:
 *   post:
 *     summary: Complete the trip
 *     tags: [Trips]
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
router.post(
  "/:id/complete",
  authorize(Permissions.TRIP.UPDATE),
  tripsController.completeTrip
);

/**
 * @openapi
 * /api/v1/trips/{id}/cancel:
 *   post:
 *     summary: Cancel the trip
 *     tags: [Trips]
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
router.post(
  "/:id/cancel",
  authorize(Permissions.TRIP.CANCEL),
  tripsController.cancelTrip
);

/**
 * @openapi
 * /api/v1/trips/{id}/terminate:
 *   post:
 *     summary: Emergency terminate an In Progress trip
 *     tags: [Trips]
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
router.post(
  "/:id/terminate",
  authorize(Permissions.TRIP.EMERGENCY_TERMINATE),
  tripsController.terminateTrip
);

/**
 * @openapi
 * /api/v1/trips/{id}:
 *   put:
 *     summary: Update trip metadata
 *     tags: [Trips]
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
 *               route_id:
 *                 type: string
 *               start_time:
 *                 type: string
 *                 format: date-time
 *               end_time:
 *                 type: string
 *                 format: date-time
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.put(
  "/:id",
  authorize(Permissions.TRIP.UPDATE),
  validate(tripsValidation.updateTripSchema),
  tripsController.updateTrip
);

export default router;
