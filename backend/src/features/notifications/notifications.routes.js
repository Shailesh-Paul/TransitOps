import express from "express";
import * as notificationsController from "./notifications.controller.js";
import * as notificationsValidation from "./notifications.validation.js";
import { validate } from "../../middleware/validate.middleware.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { requirePermission } from "../../middleware/rbac.middleware.js";

const router = express.Router();

// Everyone must be authenticated
router.use(requireAuth);

// Get logged-in user's notifications

/**
 * @openapi
 * /api/v1/notifications:
 *   get:
 *     summary: Retrieve notifications entry
 *     tags: [Notifications]
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
// Get Notification Counts

/**
 * @openapi
 * /api/v1/notifications/count:
 *   get:
 *     summary: Get notification counts grouped by status
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.get("/count", notificationsController.getNotificationCounts);

// Mark all unread notifications as read

/**
 * @openapi
 * /api/v1/notifications/mark-all-read:
 *   patch:
 *     summary: Mark all unread notifications as read
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.patch("/mark-all-read", notificationsController.markAllAsRead);

// Mark a notification as read (Legacy)

/**
 * @openapi
 * /api/v1/notifications/{id}/read:
 *   patch:
 *     summary: Mark notification as read
 *     tags: [Notifications]
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
router.patch("/:id/read", validate(notificationsValidation.markAsReadSchema), notificationsController.markAsRead);

// Update notification status

/**
 * @openapi
 * /api/v1/notifications/{id}/status:
 *   patch:
 *     summary: Update notification status (read, archived, dismissed)
 *     tags: [Notifications]
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
 *                 enum: [read, archived, dismissed]
 *           example: {"status": "archived"}
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.patch("/:id/status", validate(notificationsValidation.updateStatusSchema), notificationsController.updateStatus);

// Delete notification

/**
 * @openapi
 * /api/v1/notifications/{id}:
 *   delete:
 *     summary: Delete a notification
 *     tags: [Notifications]
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
router.delete("/:id", validate(notificationsValidation.deleteNotificationSchema), notificationsController.deleteNotification);


// Get Notification History

/**
 * @openapi
 * /api/v1/notifications/{id}/history:
 *   get:
 *     summary: Get lifecycle history of a notification
 *     tags: [Notifications]
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
router.get("/:id/history", validate(notificationsValidation.notificationHistorySchema), notificationsController.getNotificationHistory);


// Get Notification Preferences

/**
 * @openapi
 * /api/v1/notifications/preferences:
 *   get:
 *     summary: Get user notification preferences
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.get("/preferences", notificationsController.getPreferences);

// Update Notification Preference

/**
 * @openapi
 * /api/v1/notifications/preferences:
 *   put:
 *     summary: Update notification preference
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notification_type:
 *                 type: string
 *                 enum: [SYSTEM, EXPIRY, ASSIGNMENT, APPROVAL]
 *               in_app:
 *                 type: boolean
 *               email:
 *                 type: boolean
 *           example: {"notification_type": "EXPIRY", "in_app": true, "email": false}
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.put("/preferences", validate(notificationsValidation.updatePreferenceSchema), notificationsController.updatePreference);

// Only Admins or system services can send arbitrary notifications via API

/**
 * @openapi
 * /api/v1/notifications:
 *   post:
 *     summary: Create notifications entry
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: string
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [SYSTEM, EXPIRY, ASSIGNMENT, APPROVAL]
 *               reference_id:
 *                 type: string
 *               reference_type:
 *                 type: string
 *           example: {"user_id": "1", "title":"Alert","message":"System update required", "type": "SYSTEM"}
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.post("/", requirePermission("manage_notifications"), validate(notificationsValidation.createNotificationSchema), notificationsController.createNotification);

export default router;
