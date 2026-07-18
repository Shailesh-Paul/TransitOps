import express from "express";
import * as maintenanceController from "./maintenance.controller.js";
import * as maintenanceValidation from "./maintenance.validation.js";
import { validate } from "../../middleware/validate.middleware.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/rbac.middleware.js";
import { Permissions } from "../../constants/permissions.js";

const router = express.Router();

router.use(requireAuth);

/**
 * @openapi
 * /api/v1/maintenance/dashboard-kpis:
 *   get:
 *     summary: Get dashboard KPIs for maintenance
 *     tags: [Maintenance]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.get(
  "/dashboard-kpis",
  authorize(Permissions.MAINTENANCE.VIEW),
  maintenanceController.getDashboardKpis
);

/**
 * @openapi
 * /api/v1/maintenance/analytics:
 *   get:
 *     summary: Get maintenance analytics
 *     tags: [Maintenance]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.get(
  "/analytics",
  authorize(Permissions.MAINTENANCE.VIEW),
  maintenanceController.getAnalytics
);

/**
 * @openapi
 * /api/v1/maintenance:
 *   get:
 *     summary: Retrieve maintenance records
 *     tags: [Maintenance]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.get(
  "/",
  authorize(Permissions.MAINTENANCE.VIEW),
  maintenanceController.getMaintenanceRecords
);

/**
 * @openapi
 * /api/v1/maintenance/queue:
 *   get:
 *     summary: Retrieve active workshop queue
 *     tags: [Maintenance]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Workshop queue retrieved successfully
 */
router.get(
  "/queue",
  authorize(Permissions.MAINTENANCE.VIEW),
  maintenanceController.getQueue
);

/**
 * @openapi
 * /api/v1/maintenance/{id}:
 *   get:
 *     summary: Get maintenance record by ID
 *     tags: [Maintenance]
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
  authorize(Permissions.MAINTENANCE.VIEW),
  maintenanceController.getRecordById
);

/**
 * @openapi
 * /api/v1/maintenance/{id}/details:
 *   get:
 *     summary: Get comprehensive details of a maintenance record
 *     tags: [Maintenance]
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
  "/:id/details",
  authorize(Permissions.MAINTENANCE.VIEW),
  maintenanceController.getComprehensiveDetails
);

/**
 * @openapi
 * /api/v1/maintenance:
 *   post:
 *     summary: Request maintenance for a vehicle
 *     tags: [Maintenance]
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
 *               type:
 *                 type: string
 *                 enum: [routine, repair, emergency, inspection]
 *               priority:
 *                 type: string
 *                 enum: [Low, Medium, High, Critical]
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Successful operation
 */
router.post(
  "/",
  authorize(Permissions.MAINTENANCE.CREATE),
  validate(maintenanceValidation.requestMaintenanceSchema),
  maintenanceController.requestMaintenance
);

/**
 * @openapi
 * /api/v1/maintenance/{id}/queue:
 *   post:
 *     summary: Move maintenance to workshop queue (Locks vehicle)
 *     tags: [Maintenance]
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
  "/:id/queue",
  authorize(Permissions.MAINTENANCE.UPDATE),
  maintenanceController.queueMaintenance
);

/**
 * @openapi
 * /api/v1/maintenance/{id}/start:
 *   post:
 *     summary: Start the maintenance work
 *     tags: [Maintenance]
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
  authorize(Permissions.MAINTENANCE.UPDATE),
  maintenanceController.startMaintenance
);

/**
 * @openapi
 * /api/v1/maintenance/{id}/complete:
 *   post:
 *     summary: Complete the maintenance work (Frees vehicle)
 *     tags: [Maintenance]
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
 *               cost:
 *                 type: number
 *               parts:
 *                 type: object
 *               performed_by:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.post(
  "/:id/complete",
  authorize(Permissions.MAINTENANCE.UPDATE),
  validate(maintenanceValidation.completeMaintenanceSchema),
  maintenanceController.completeMaintenance
);

/**
 * @openapi
 * /api/v1/maintenance/{id}/cancel:
 *   post:
 *     summary: Cancel the maintenance work (Frees vehicle)
 *     tags: [Maintenance]
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
  authorize(Permissions.MAINTENANCE.UPDATE),
  maintenanceController.cancelMaintenance
);

/**
 * @openapi
 * /api/v1/maintenance/{id}/progress:
 *   put:
 *     summary: Update maintenance progress
 *     tags: [Maintenance]
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
 *               progress:
 *                 type: integer
 *               note:
 *                 type: string
 *               work_performed_checklist:
 *                 type: array
 *               attachments:
 *                 type: array
 *               workshop_bay:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.put(
  "/:id/progress",
  authorize(Permissions.MAINTENANCE.UPDATE),
  maintenanceController.updateProgress
);

/**
 * @openapi
 * /api/v1/maintenance/{id}:
 *   put:
 *     summary: Update maintenance metadata
 *     tags: [Maintenance]
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
 *               type:
 *                 type: string
 *                 enum: [routine, repair, emergency, inspection]
 *               priority:
 *                 type: string
 *                 enum: [Low, Medium, High, Critical]
 *               description:
 *                 type: string
 *               performed_by:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.put(
  "/:id",
  authorize(Permissions.MAINTENANCE.UPDATE),
  validate(maintenanceValidation.updateRecordSchema),
  maintenanceController.updateRecord
);

/**
 * @openapi
 * /api/v1/maintenance/{id}:
 *   delete:
 *     summary: Delete maintenance record
 *     tags: [Maintenance]
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
  authorize(Permissions.MAINTENANCE.DELETE),
  maintenanceController.deleteRecord
);

export default router;
