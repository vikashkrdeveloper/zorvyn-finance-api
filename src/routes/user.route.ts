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
 *     summary: List all users (Requires Role: Admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *   post:
 *     summary: Create new user (Requires Role: Admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: User created
 */
router
    .route('/')
    .get(validate(listUsersSchema), userController.getUsers)
    .post(validate(createUserSchema), userController.createUser);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user details (Requires Role: Admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *   put:
 *     summary: Update user (Requires Role: Admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *   delete:
 *     summary: Soft delete user (Requires Role: Admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router
    .route('/:id')
    .get(validate(getUserSchema), userController.getUser)
    .put(validate(updateUserSchema), userController.updateUser)
    .delete(validate(deleteUserSchema), userController.deleteUser);

export default router;
