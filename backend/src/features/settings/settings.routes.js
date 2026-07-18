import express from "express";
import * as settingsController from "./settings.controller.js";
import * as settingsValidation from "./settings.validation.js";
import { validate } from "../../middleware/validate.middleware.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { requirePermission } from "../../middleware/rbac.middleware.js";

const router = express.Router();

// Everyone must be authenticated
router.use(requireAuth);

// Get a setting by key - employees/system services might need to read settings (e.g. system_maintenance_mode)

/**
 * @openapi
 * /api/v1/settings/{key}:
 *   get:
 *     summary: Retrieve settings entry
 *     tags: [Settings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful operation
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get("/:key", validate(settingsValidation.getSettingSchema), settingsController.getSettingByKey);

// Rest of endpoints are Admin-only

/**
 * @openapi
 * /api/v1/settings:
 *   get:
 *     summary: Retrieve settings entry
 *     tags: [Settings]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successful operation
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get("/", requirePermission("manage_settings"), settingsController.getAllSettings);

/**
 * @openapi
 * /api/v1/settings/{key}:
 *   put:
 *     summary: Update settings entry
 *     tags: [Settings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *           example: {"theme":"dark","language":"en"}
 *     responses:
 *       200:
 *         description: Successful operation
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put("/:key", requirePermission("manage_settings"), validate(settingsValidation.updateSettingSchema), settingsController.updateSettingByKey);

export default router;
