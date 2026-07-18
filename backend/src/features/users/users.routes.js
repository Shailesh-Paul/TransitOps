import express from "express";
import * as usersController from "./users.controller.js";
import * as usersValidation from "./users.validation.js";
import { validate } from "../../middleware/validate.middleware.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/rbac.middleware.js";

const router = express.Router();

// ==========================================
// MY PROFILE ROUTES (Any authenticated user)
// ==========================================
router.use("/me", requireAuth); // Apply requireAuth to all /me routes


/**
 * @openapi
 * /api/v1/users/me/profile:
 *   get:
 *     summary: Retrieve users entry
 *     tags: [Users]
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
router.get("/me/profile", usersController.getMyProfile);

/**
 * @openapi
 * /api/v1/users/me/profile:
 *   patch:
 *     summary: Modify users entry
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *           example: {"first_name":"John","last_name":"Doe","email":"john@example.com","role_id":2,"department_id":1}
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
  "/me/profile",
  validate(usersValidation.updateProfileSchema),
  usersController.updateMyProfile
);

/**
 * @openapi
 * /api/v1/users/me/change-password:
 *   patch:
 *     summary: Modify users entry
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *           example: {"first_name":"John","last_name":"Doe","email":"john@example.com","role_id":2,"department_id":1}
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
  "/me/change-password",
  validate(usersValidation.changePasswordSchema),
  usersController.changeMyPassword
);

// ==========================================
// ADMIN USER ROUTES (manage_users permission)
// ==========================================
router.use("/", requireAuth, authorize("manage_users")); // Apply to all routes below


/**
 * @openapi
 * /api/v1/users:
 *   get:
 *     summary: Retrieve users entry
 *     tags: [Users]
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
router.get("/", usersController.getAllUsers);

/**
 * @openapi
 * /api/v1/users:
 *   post:
 *     summary: Create users entry
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *           example: {"first_name":"John","last_name":"Doe","email":"john@example.com","role_id":2,"department_id":1}
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
  validate(usersValidation.createUserSchema),
  usersController.createUser
);

/**
 * @openapi
 * /api/v1/users/{id}:
 *   get:
 *     summary: Retrieve users entry
 *     tags: [Users]
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
router.get("/:id", usersController.getUserById);

/**
 * @openapi
 * /api/v1/users/{id}:
 *   put:
 *     summary: Update users entry
 *     tags: [Users]
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
 *           example: {"first_name":"John","last_name":"Doe","email":"john@example.com","role_id":2,"department_id":1}
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
router.put(
  "/:id",
  validate(usersValidation.updateUserSchema),
  usersController.updateUser
);

/**
 * @openapi
 * /api/v1/users/{id}:
 *   delete:
 *     summary: Delete users entry
 *     tags: [Users]
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
router.delete("/:id", usersController.softDeleteUser);

export default router;
