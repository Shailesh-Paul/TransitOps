import express from "express";
import * as authController from "./auth.controller.js";
import * as authValidation from "./auth.validation.js";
import { validate } from "../../middleware/validate.middleware.js";

const router = express.Router();


/**
 * @openapi
 * /api/v1/auth/login:
 *   post:
 *     summary: Create auth entry
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *           example: {"email":"admin@example.com","password":"Password123!"}
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
router.post("/login", validate(authValidation.loginSchema), authController.login);

/**
 * @openapi
 * /api/v1/auth/refresh:
 *   post:
 *     summary: Create auth entry
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *           example: {"refreshToken":"eyJhbGciOiJIUzI1NiIsInR5c..."}
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
router.post("/refresh", validate(authValidation.refreshSchema), authController.refresh);
// logout is protected by requireAuth typically, but we haven't imported the middleware here yet
// We will import it from global middleware. Wait, importing it here creates a circular dependency if not careful? No.
import { requireAuth } from "../../middleware/auth.middleware.js";


/**
 * @openapi
 * /api/v1/auth/logout:
 *   post:
 *     summary: Create auth entry
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *           example: {"refreshToken":"eyJhbGciOiJIUzI1NiIsInR5c..."}
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
router.post("/logout", requireAuth, validate(authValidation.logoutSchema), authController.logout);

// Protected authenticated user profile endpoint

/**
 * @openapi
 * /api/v1/auth/me:
 *   get:
 *     summary: Retrieve auth entry
 *     tags: [Auth]
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
router.get("/me", requireAuth, authController.getMe);


/**
 * @openapi
 * /api/v1/auth/reset-password-request:
 *   post:
 *     summary: Create auth entry
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *           example: {"email":"admin@example.com"}
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
router.post("/reset-password-request", validate(authValidation.forgotPasswordSchema), authController.requestPasswordReset);

/**
 * @openapi
 * /api/v1/auth/reset-password:
 *   post:
 *     summary: Create auth entry
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *           example: {"token":"123456","newPassword":"NewPassword123!"}
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
router.post("/reset-password", validate(authValidation.resetPasswordSchema), authController.resetPassword);

export default router;
