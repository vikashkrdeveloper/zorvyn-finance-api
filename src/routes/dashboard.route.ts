import express from 'express';
import * as dashboardController from '../controllers/dashboard.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { UserRole } from '../models/user.model';

const router = express.Router();

// All roles (Viewer, Analyst, Admin) can view the dashboard
router.use(protect);

/**
 * @swagger
 * /api/dashboard/summary:
 *   get:
 *     summary: Get financial performance summary
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Dashboard statistics
 */
router.get('/summary', restrictTo(UserRole.ADMIN, UserRole.ANALYST, UserRole.VIEWER), dashboardController.getDashboardSummary);

export default router;
