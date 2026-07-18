import express from 'express';
import * as dashboardController from './dashboard.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/rbac.middleware.js';
import { Permissions } from '../../constants/permissions.js';

const router = express.Router();

router.use(requireAuth);

/**
 * @openapi
 * /api/v1/dashboard:
 *   get:
 *     summary: Retrieve enterprise dashboard KPIs
 *     tags: [Dashboard]
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
  '/', 
  authorize(Permissions.DASHBOARD.VIEW), 
  dashboardController.getDashboardData
);

export default router;
