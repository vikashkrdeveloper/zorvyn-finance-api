import express from 'express';
import * as authController from '../controllers/auth.controller';
import { protect } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { registerSchema, loginSchema, refreshSchema } from '../validation/auth.validation';

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: "Register a new user"
 *     tags: [Authentication]
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
 *                 example: Jane Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: jane@example.com
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: "securePass123"
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Bad request - Email already exists or validation failed
 */
router.post('/register', validate(registerSchema), authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: "User login"
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@zorvyn.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful - Returns access and refresh tokens
 *       401:
 *         description: Unauthorized - Invalid credentials
 */
router.post('/login', validate(loginSchema), authController.login);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: "Refresh access token"
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post('/refresh', validate(refreshSchema), authController.refresh);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: "User logout (Blacklist token)"
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post('/logout', protect, validate(refreshSchema), authController.logout);

/**
 * @swagger
 * /api/auth/logout-all:
 *   post:
 *     summary: "Logout from all devices"
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out from all devices successfully
 */
router.post('/logout-all', protect, authController.logoutAll);


export default router;
