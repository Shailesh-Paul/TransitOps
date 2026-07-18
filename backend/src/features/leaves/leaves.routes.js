import express from "express";
import * as leavesController from "./leaves.controller.js";
import * as leavesValidation from "./leaves.validation.js";
import { validate } from "../../middleware/validate.middleware.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { requirePermission } from "../../middleware/rbac.middleware.js";

const router = express.Router();

// Everyone must be authenticated
router.use(requireAuth);

// Employees submit leave requests (in a real app, we might just enforce they are an employee)

/**
 * @openapi
 * /api/v1/leaves:
 *   post:
 *     summary: Create leaves entry
 *     tags: [Leaves]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *           example: {"data":"example"}
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
router.post(
  "/",
  validate(leavesValidation.createLeaveSchema),
  leavesController.createLeaveRequest
);

// ==========================================
// HR MANAGEMENT
// ==========================================

/**
 * @openapi
 * /api/v1/leaves:
 *   get:
 *     summary: Retrieve leaves entry
 *     tags: [Leaves]
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
router.get(
  "/",
  requirePermission("view_attendance"),
  leavesController.getAllLeaves
);


/**
 * @openapi
 * /api/v1/leaves/{id}:
 *   get:
 *     summary: Retrieve leaves entry
 *     tags: [Leaves]
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
router.get(
  "/:id",
  requirePermission("view_attendance"),
  leavesController.getLeaveById
);

// HR Approves or Rejects the request

/**
 * @openapi
 * /api/v1/leaves/{id}/status:
 *   patch:
 *     summary: Modify leaves entry
 *     tags: [Leaves]
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
 *           example: {"data":"example"}
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
router.patch(
  "/:id/status",
  requirePermission("manage_attendance"),
  validate(leavesValidation.updateLeaveStatusSchema),
  leavesController.updateLeaveStatus
);

export default router;
