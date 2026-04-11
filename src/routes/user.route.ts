import express from 'express';
import * as userController from '../controllers/user.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { UserRole } from '../models/user.model';
import { validate } from '../middlewares/validate.middleware';
import {
    createUserSchema,
    updateUserSchema,
    deleteUserSchema,
    getUserSchema,
    listUsersSchema
} from '../validation/user.validation';

const router = express.Router();

// Protect ALL routes below and restricts them to ADMIN only
router.use(protect);
router.use(restrictTo(UserRole.ADMIN));

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: "List all users (Requires Role: Admin)"
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of users per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or email (Partial match, case-insensitive)
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [ADMIN, ANALYST, VIEWER]
 *         description: Filter by user role
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE]
 *         description: Filter by user status
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Requires ADMIN role
 *   post:
 *     summary: "Create new user (Requires Role: Admin)"
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@zorvyn.org
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: "protectedPassword"
 *               role:
 *                 type: string
 *                 enum: [ADMIN, ANALYST, VIEWER]
 *                 default: VIEWER
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE]
 *                 default: ACTIVE
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Bad request - Validation failed or email in use
 * 
 * /api/users/{id}:
 *   get:
 *     summary: "Get user details (Requires Role: Admin)"
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID (MongoDB ObjectID)
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 *       404:
 *         description: User not found
 *   put:
 *     summary: "Update user (Requires Role: Admin)"
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [ADMIN, ANALYST, VIEWER]
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE]
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 *   delete:
 *     summary: "Soft delete user (Requires Role: Admin)"
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User soft-deleted successfully
 *       404:
 *         description: User not found
 */
router
    .route('/')
    .get(validate(listUsersSchema), userController.getUsers)
    .post(validate(createUserSchema), userController.createUser);

router
    .route('/:id')
    .get(validate(getUserSchema), userController.getUser)
    .put(validate(updateUserSchema), userController.updateUser)
    .delete(validate(deleteUserSchema), userController.deleteUser);

export default router;
